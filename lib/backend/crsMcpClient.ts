import { spawn, type ChildProcessWithoutNullStreams } from "child_process";

type JsonRpcId = number;

interface JsonRpcSuccess {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result: any;
}

interface JsonRpcError {
  jsonrpc: "2.0";
  id: JsonRpcId;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;

interface MCPToolDescriptor {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

interface MCPToolCallResult {
  content?: unknown[];
  isError?: boolean;
  [key: string]: unknown;
}

export interface CRSMcpClientState {
  initialized: boolean;
  connecting: boolean;
  connectingSince: number | null;
  lastConnectedAt: number | null;
  lastError: string | null;
}

const DEFAULT_TIMEOUT_MS = 60000;
const INIT_TIMEOUT_MS = 120000;
const MCP_PROTOCOL_VERSION = "2024-11-05";
const MAX_STDERR_CHARS = 4000;

function buildJsonRpcMessage(payload: object): string {
  const body = JSON.stringify(payload);
  return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}

export class CRSMcpClient {
  private proc: ChildProcessWithoutNullStreams | null = null;
  private nextId = 1;
  private stdoutBuffer = Buffer.alloc(0);
  private pending = new Map<
    JsonRpcId,
    {
      resolve: (value: any) => void;
      reject: (reason?: unknown) => void;
      timer: NodeJS.Timeout;
    }
  >();
  private initialized = false;
  private connecting: Promise<void> | null = null;
  private connectingSince: number | null = null;
  private lastConnectedAt: number | null = null;
  private lastError: string | null = null;
  private recentStderr = "";

  async connect(): Promise<void> {
    if (this.initialized) return;
    if (this.connecting) {
      await this.connecting;
      return;
    }

    this.connecting = (async () => {
      this.connectingSince = Date.now();
      this.proc = spawn("npx", ["-y", "@crscreditapi/mcp-server"], {
        stdio: "pipe",
        env: {
          ...process.env,
          CRS_USERNAME: process.env.CRS_USERNAME || "",
          CRS_PASSWORD: process.env.CRS_PASSWORD || "",
        },
      });

      this.proc.stdout.on("data", (chunk: Buffer) => {
        this.stdoutBuffer = Buffer.concat([this.stdoutBuffer, chunk]);
        this.drainStdoutBuffer();
      });
      this.proc.stderr.on("data", (chunk: Buffer) => {
        const text = chunk.toString("utf8");
        this.recentStderr = `${this.recentStderr}${text}`.slice(-MAX_STDERR_CHARS);
      });

      this.proc.on("error", (error) => {
        this.lastError = error?.message || "Unknown MCP process error.";
        this.rejectAllPending(error);
      });

      this.proc.on("exit", (code, signal) => {
        this.initialized = false;
        this.proc = null;
        this.lastError = `CRS MCP server exited (code=${code ?? "null"}, signal=${signal ?? "null"})`;
        this.rejectAllPending(
          new Error(
            `CRS MCP server exited (code=${code ?? "null"}, signal=${signal ?? "null"})`
          )
        );
      });

      await this.request(
        "initialize",
        {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: {
            name: "treeconomy-doge",
            version: "0.1.0",
          },
        },
        INIT_TIMEOUT_MS
      );

      this.notify("notifications/initialized", {});
      this.initialized = true;
      this.lastConnectedAt = Date.now();
      this.lastError = null;
    })();

    try {
      await this.connecting;
    } catch (error: any) {
      this.lastError = error?.message || "Failed to initialize CRS MCP server.";
      throw error;
    } finally {
      this.connectingSince = null;
      this.connecting = null;
    }
  }

  async listTools(): Promise<MCPToolDescriptor[]> {
    await this.connect();
    const result = await this.request("tools/list", {});
    return Array.isArray(result?.tools) ? result.tools : [];
  }

  async callTool(name: string, args: Record<string, unknown> = {}): Promise<MCPToolCallResult> {
    await this.connect();
    const result = await this.request("tools/call", {
      name,
      arguments: args,
    });
    return result ?? {};
  }

  close(): void {
    this.initialized = false;
    this.lastError = "CRS MCP client closed";
    this.rejectAllPending(new Error("CRS MCP client closed"));
    if (this.proc && !this.proc.killed) {
      this.proc.kill("SIGTERM");
    }
    this.proc = null;
    this.stdoutBuffer = Buffer.alloc(0);
  }

  private notify(method: string, params: Record<string, unknown>): void {
    if (!this.proc || !this.proc.stdin.writable) return;
    const payload = {
      jsonrpc: "2.0",
      method,
      params,
    };
    this.proc.stdin.write(buildJsonRpcMessage(payload));
  }

  private request(
    method: string,
    params: Record<string, unknown>,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.proc || !this.proc.stdin.writable) {
        reject(new Error("CRS MCP process is not running."));
        return;
      }

      const id = this.nextId++;
      const payload = {
        jsonrpc: "2.0",
        id,
        method,
        params,
      };

      const timer = setTimeout(() => {
        this.pending.delete(id);
        const stderrSnippet = this.recentStderr.trim();
        this.lastError = stderrSnippet
          ? `CRS MCP request timed out: ${method}. Server stderr: ${stderrSnippet}`
          : `CRS MCP request timed out: ${method}`;
        reject(
          new Error(
            stderrSnippet
              ? `CRS MCP request timed out: ${method}. Server stderr: ${stderrSnippet}`
              : `CRS MCP request timed out: ${method}`
          )
        );
      }, timeoutMs);

      this.pending.set(id, { resolve, reject, timer });
      this.proc.stdin.write(buildJsonRpcMessage(payload));
    });
  }

  getState(): CRSMcpClientState {
    return {
      initialized: this.initialized,
      connecting: Boolean(this.connecting),
      connectingSince: this.connectingSince,
      lastConnectedAt: this.lastConnectedAt,
      lastError: this.lastError,
    };
  }

  private drainStdoutBuffer(): void {
    // Handle both MCP framed transport and line-delimited JSON output variants.
    while (true) {
      const fullText = this.stdoutBuffer.toString("utf8");
      const headerStart = fullText.indexOf("Content-Length:");

      if (headerStart === -1) {
        const newlineIndex = this.stdoutBuffer.indexOf("\n");
        if (newlineIndex === -1) return;
        const line = this.stdoutBuffer
          .slice(0, newlineIndex + 1)
          .toString("utf8")
          .trim();
        this.stdoutBuffer = this.stdoutBuffer.slice(newlineIndex + 1);
        if (line.length > 0) this.handleJsonText(line);
        continue;
      }

      if (headerStart > 0) {
        // Drop preface logs/noise before framed payload.
        this.stdoutBuffer = this.stdoutBuffer.slice(headerStart);
      }

      const afterStartText = this.stdoutBuffer.toString("utf8");
      const headerEndCRLF = afterStartText.indexOf("\r\n\r\n");
      const headerEndLF = afterStartText.indexOf("\n\n");
      let headerEnd = -1;
      let separatorLength = 0;
      if (headerEndCRLF !== -1) {
        headerEnd = headerEndCRLF;
        separatorLength = 4;
      } else if (headerEndLF !== -1) {
        headerEnd = headerEndLF;
        separatorLength = 2;
      }
      if (headerEnd === -1) return;

      const headerText = afterStartText.slice(0, headerEnd);
      const lengthMatch = headerText.match(/Content-Length:\s*(\d+)/i);
      if (!lengthMatch) {
        this.stdoutBuffer = this.stdoutBuffer.slice(headerEnd + separatorLength);
        continue;
      }

      const contentLength = Number(lengthMatch[1]);
      const fullMessageLength = headerEnd + separatorLength + contentLength;
      if (this.stdoutBuffer.length < fullMessageLength) return;

      const jsonText = this.stdoutBuffer
        .slice(headerEnd + separatorLength, fullMessageLength)
        .toString("utf8");
      this.stdoutBuffer = this.stdoutBuffer.slice(fullMessageLength);

      this.handleJsonText(jsonText);
    }
  }

  private handleJsonText(jsonText: string): void {
    try {
      const message = JSON.parse(jsonText) as JsonRpcResponse | { method?: string };
      if ("id" in message && typeof message.id === "number") {
        this.resolvePending(message.id, message as JsonRpcResponse);
      }
    } catch {
      // Ignore non-JSON logs on stdout.
    }
  }

  private resolvePending(id: JsonRpcId, response: JsonRpcResponse): void {
    const pendingRequest = this.pending.get(id);
    if (!pendingRequest) return;

    clearTimeout(pendingRequest.timer);
    this.pending.delete(id);

    if ("error" in response && response.error) {
      pendingRequest.reject(
        new Error(
          `CRS MCP error ${response.error.code}: ${response.error.message}`
        )
      );
      return;
    }

    pendingRequest.resolve(response.result);
  }

  private rejectAllPending(reason: unknown): void {
    for (const [id, pendingRequest] of this.pending.entries()) {
      clearTimeout(pendingRequest.timer);
      pendingRequest.reject(reason);
      this.pending.delete(id);
    }
  }
}

let sharedClient: CRSMcpClient | null = null;

function getSharedCRSMcpClient(): CRSMcpClient {
  if (!sharedClient) {
    sharedClient = new CRSMcpClient();
  }
  return sharedClient;
}

export async function withCRSMcpClient<T>(
  fn: (client: CRSMcpClient) => Promise<T>
): Promise<T> {
  const client = getSharedCRSMcpClient();
  return fn(client);
}

export function getCRSMcpClientState(): CRSMcpClientState {
  return getSharedCRSMcpClient().getState();
}

export function prewarmCRSMcpClient(): void {
  void getSharedCRSMcpClient().connect().catch(() => {
    // Keep app responsive; status endpoints surface the error state.
  });
}
