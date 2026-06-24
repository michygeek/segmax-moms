import { SerwistProvider } from "@serwist/next/react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEGMAX MOMS",
  description: "SEGMAX OIL NIG LTD — Manufacturing Operations Management System",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SEGMAX MOMS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#191359",
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
        <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV !== "production"}>
          <TooltipProvider>{children}</TooltipProvider>
        </SerwistProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
