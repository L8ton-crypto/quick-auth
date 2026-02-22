import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickAuth - Drop-in Authentication for MVPs",
  description: "Add login, signup and user management to any app in under 5 minutes. Simple JavaScript widget with a clean API. Free for your first 100 users.",
  openGraph: {
    title: "QuickAuth - Drop-in Authentication for MVPs",
    description: "Add login, signup and user management to any app in under 5 minutes. Free for your first 100 users.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
