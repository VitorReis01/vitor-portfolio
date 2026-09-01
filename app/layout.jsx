import "./globals.css";
import { Bricolage_Grotesque, JetBrains_Mono, Inter } from "next/font/google";

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-display",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "Vitor",
  description: "Portfólio pessoal de Vitor — sistemas digitais, do conceito ao produto no ar.",
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0b0d",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${displayFont.variable} ${monoFont.variable} ${bodyFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
