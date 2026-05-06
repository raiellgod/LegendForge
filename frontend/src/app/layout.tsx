import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MedievalSharp } from "next/font/google"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

const medieval = MedievalSharp({
  variable: "--font-medieval",
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "LegendForge",
  description: "LegendForge is a Virtual Tabletop designed to run tabletop RPG sessions online. Create and manage your characters, maps, and campaigns with ease, and bring your adventures to life with our immersive tools.",
   icons: {
    icon: "/favicon.png",
  },
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${medieval.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
