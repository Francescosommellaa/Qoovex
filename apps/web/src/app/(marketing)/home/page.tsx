import type { Metadata } from "next";
import "./_styles/home.css";
import { FinalCtaBand } from "./_components/FinalCtaBand";
import { HeroSection } from "./_components/HeroSection";
import { ShowcaseSection } from "./_components/ShowcaseSection";

export const metadata: Metadata = {
  title: "Qoovex — Il workspace per chef professionisti",
  description:
    "Gestisci ricette, menu digitali, allergeni, valori nutrizionali e piani di lavoro collaborativi — tutto in un unico workspace.",
};

export default function Page() {
  return (
    <>
      <HeroSection />
      <ShowcaseSection />
      <FinalCtaBand />
    </>
  );
}
