import { BASE_URL } from "@/utils/constants";
import { Metadata } from "next";
// title: "Strekkode generator",
// description:
//   "Generer og lag en gratis strekkode for din bedrift eller produkt.",
export const mainPageMeta: Metadata = {
  title: "Strekkode",
  description:
    "Generer og lag en gratis strekkode for din bedrift eller produkt.",
  keywords: [
    "Strekkode",
    "Barcode",
    "Strekkode generator",
    "Barcode generator",
    "Strekkode lag",
    "Barcode lag",
    "Strekkode bedrift",
    "Barcode bedrift",
    "Strekkode produkt",
    "Barcode produkt",
    "Strekkode generator",
    "Strekkodegenerator",
    "Lage strekkode",
    "Generere strekkode",
    "Gratis strekkode",
    "Strekkode online",
  ],
  creator: "Stian Larsen",
  publisher: "Stian Larsen",
  metadataBase: new URL(BASE_URL),

  openGraph: {
    type: "website",
    url: BASE_URL,
    title: "Strekkode",
    description:
      "Generer og lag en gratis strekkode for din bedrift eller produkt.",
    images: [
      {
        url: "https://strek-kode.no/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Strekkode logo",
      },
      {
        url: "https://strek-kode.no/android-chrome-192x192.png",
        width: 192,
        height: 192,
        alt: "Strekkode logo",
      },
    ],
    siteName: "strek-kode.no",
  },
  twitter: {
    card: "app",
    title: "strek-kode-no",
    description:
      "Generer og lag en gratis strekkode for din bedrift eller produkt.",
    siteId: "882276408",
    creator: "@Litehode",
    creatorId: "882276408",
    images: {
      url: "https://stianlarsen.com/og.png",
      alt: "Strekkode logo",
    },
    app: {
      name: "twitter_app",
      id: {
        iphone: "twitter_app://iphone",
        ipad: "twitter_app://ipad",
        googleplay: "twitter_app://googleplay",
      },
      url: {
        iphone: "https://iphone_url",
        ipad: "https://ipad_url",
      },
    },
  },

  icons: {
    icon: [{ url: "/icon.ico" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },

  verification: {
    google: "google",
    yandex: "yandex",
    yahoo: "yahoo",
    other: {
      me: ["stian.larsen@mac.com"],
    },
  },
};
