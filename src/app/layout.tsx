import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from '@/components/Header';
import Footer from "@/components/Footer";
import "./globals.css";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "I Love Github",
  description: "Collection of GitHub tools ",
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
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
