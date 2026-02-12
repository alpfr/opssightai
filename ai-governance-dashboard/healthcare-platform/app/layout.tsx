import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { SessionWarning } from "@/components/SessionWarning";
import { LayoutWrapper } from "@/components/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vantedge Health - AI-Driven Healthcare Platform",
  description: "Returning humanity to healthcare. Vantedge Health uses Agentic AI to solve the Small Practice Squeeze, helping doctors focus on patients, not paperwork.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutWrapper>
          <Navigation />
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <SessionWarning />
        </LayoutWrapper>
      </body>
    </html>
  );
}
