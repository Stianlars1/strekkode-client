import { BASE_URL } from "@/utils/constants";
import { Metadata } from "next";

export const mainPageMeta: Metadata = {
  title: "Strekkodegenerator - lag strekkoder gratis | Strekkode",
  description:
    "Gratis strekkodegenerator: skriv inn tall eller tekst, generer strekkode (CODE128, EAN-13 m.fl.) og last ned som PNG eller SVG. Ingen registrering - lag strekkoden din nå!",
  creator: "Stian Larsen",
  publisher: "Stian Larsen",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: BASE_URL,
    locale: "nb_NO",
    title: "Strekkodegenerator - lag strekkoder gratis | Strekkode",
    description:
      "Gratis strekkodegenerator: generer strekkoder og last ned som PNG eller SVG. Ingen registrering.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Strekkodegenerator - lag strekkoder gratis på strek-kode.no",
      },
    ],
    siteName: "strek-kode.no",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strekkodegenerator - lag strekkoder gratis | Strekkode",
    description:
      "Gratis strekkodegenerator: generer strekkoder og last ned som PNG eller SVG. Ingen registrering.",
    creator: "@Litehode",
    images: ["/og.png"],
  },

  icons: {
    icon: [{ rel: "icon", url: "/favicon.ico" }],
    apple: [{ rel: "apple", url: "/apple-touch-icon.png" }],
  },
};
