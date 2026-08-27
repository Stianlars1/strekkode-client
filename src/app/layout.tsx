import { Footer } from "@/components/footer/footer";
import { Navbar } from "@/components/navbar/navbar";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import "./globals.css";
import { mainPageMeta } from "./metadata";

export const metadata: Metadata = mainPageMeta;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <body className={GeistSans.className}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
