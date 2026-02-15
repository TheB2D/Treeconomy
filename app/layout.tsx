import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { GameStateProvider } from "@/lib/gameStateContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Treeconomy",
  description: "Treeconomy - a retro-styled gamified skill tree experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${playfair.variable}`}>
        <GameStateProvider>
          {children}
        </GameStateProvider>
      </body>
    </html>
  );
}
