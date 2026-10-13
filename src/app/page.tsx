import { HomepageStructuredData } from "@/components/structured-data/homepage-structured-data";
import { Header } from "@/components/header/header";
import { Contact } from "@/features/contact/contact";
import { AdSlot } from "@/features/ads/ad-slot";
import { Guide } from "@/features/guide/guide";
import { Hero } from "@/features/hero/hero";
import "./_css/page.css";

export default function Home() {
  return (
    <div className="whole-page-wrapper">
      <Header />
      <Hero />
      <AdSlot />
      <Contact />
      <Guide />
      <HomepageStructuredData />
    </div>
  );
}
