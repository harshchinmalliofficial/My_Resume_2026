import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/data/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RobotAssistant } from "@/components/RobotAssistant";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | LLM Systems, RAG & Agentic Workflows`, template: `%s | ${site.name}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { title: site.name, description: site.description, type: "website", siteName: site.name, url: "/" },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = {
  viewportFit: "cover", themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0e1011" }, { media: "(prefers-color-scheme: light)", color: "#eceeec" }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <RobotAssistant />
      </body>
    </html>
  );
}
