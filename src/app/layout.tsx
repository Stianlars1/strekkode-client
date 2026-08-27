import { Footer } from "@/components/footer/footer";
import { Navbar } from "@/components/navbar/navbar";
import { FAQ_ITEMS } from "@/features/guide/guide";
import { BASE_URL } from "@/utils/constants";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import "./globals.css";
import { mainPageMeta } from "./metadata";

export const metadata: Metadata = mainPageMeta;

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Strekkode",
  alternateName: "Strekkodegenerator",
  url: BASE_URL,
  inLanguage: "nb",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "NOK" },
  description:
    "Gratis strekkodegenerator på norsk. Lag strekkoder i CODE128, EAN-13, ISBN og flere formater, og last dem ned som PNG eller SVG – uten registrering.",
  featureList:
    "CODE128, EAN-13 med automatisk kontrollsiffer, EAN-8, UPC, ITF-14, ISBN, live forhåndsvisning, PNG- og SVG-nedlasting, transparent bakgrunn",
  author: {
    "@type": "Person",
    name: "Stian Larsen",
    url: "https://stianlarsen.com",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </body>
    </html>
  );
}
