import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ranger Skill Tree - 8-Bit RPG",
  description: "A beautiful retro-styled skill tree interface using 8bitcn-ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
