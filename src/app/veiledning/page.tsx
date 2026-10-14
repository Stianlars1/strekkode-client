import type { Metadata } from "next";
import { BarcodeGuideArticle } from "@/features/guide/article";

export const metadata: Metadata = {
  title: "ISBN, GTIN og strekkoder: praktisk veiledning | Strek-kode.no",
  description:
    "Slik går du fra ISBN eller GTIN til strekkode, behandler CSV-lister på opptil 500 verdier og skriver ut etiketter i riktig størrelse.",
  alternates: { canonical: "/veiledning" },
};

export default function GuidePage() {
  return <BarcodeGuideArticle />;
}
