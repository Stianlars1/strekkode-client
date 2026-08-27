import { Header } from "@/components/header/header";
import { Guide } from "@/features/guide/guide";
import { Hero } from "@/features/hero/hero";
import "./_css/page.css";

export default function Home() {
  return (
    <div className="whole-page-wrapper">
      <Header />
      <Hero />
      <Guide />
    </div>
  );
}
