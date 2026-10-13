import { Footer } from "@/components/footer/footer";
import { Navbar } from "@/components/navbar/navbar";
import { ConsentProvider } from "@/features/ads/consent-provider";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";
import { mainPageMeta } from "./metadata";

export const metadata: Metadata = mainPageMeta;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nb">
      <head>
        <Script id="adsense-consent-pause" strategy="beforeInteractive">
          {"(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;"}
        </Script>
      </head>
      <body className={GeistSans.className}>
        <ConsentProvider>
          <Navbar />
          {children}
          <Footer />
        </ConsentProvider>
      </body>
    </html>
  );
}
