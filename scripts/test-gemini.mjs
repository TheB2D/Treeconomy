import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  "";

if (!apiKey) {
  console.error("Missing Gemini API key.");
  console.error(
    "Set GOOGLE_GENERATIVE_AI_API_KEY (preferred), GEMINI_API_KEY, or GOOGLE_API_KEY."
  );
  process.exit(2);
}

const redactedKey =
  apiKey.length > 8
    ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
    : "(too short to redact safely)";
console.log(`Using key fingerprint: ${redactedKey}`);

const prompt = "Reply with exactly: OK";
const models = ["gemini-1.5-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash"];
const genAI = new GoogleGenerativeAI(apiKey);

for (const modelName of models) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    console.log(`\n[${modelName}] SUCCESS`);
    console.log(`Response: ${JSON.stringify(text)}`);
  } catch (error) {
    const e = /** @type {any} */ (error);
    console.log(`\n[${modelName}] FAILURE`);
    console.log(`status: ${e?.status ?? "unknown"}`);
    console.log(`statusText: ${e?.statusText ?? "unknown"}`);
    console.log(`message: ${e?.message ?? "unknown error"}`);
    if (e?.errorDetails) {
      console.log(`errorDetails: ${JSON.stringify(e.errorDetails)}`);
    }
  }
}
