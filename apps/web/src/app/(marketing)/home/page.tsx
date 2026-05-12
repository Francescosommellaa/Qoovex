import type { Metadata } from "next";
import {
  HomeFinalCtaSection,
  HomeHeroSection,
  KitchenRealitySection,
  ProductValueSection,
  WorkflowSection,
} from "./sections/index";

export const metadata: Metadata = {
  title: "Qoovex - Il workspace per chef professionisti",
  description:
    "Gestisci ricette, menu digitali, allergeni, valori nutrizionali e piani di lavoro collaborativi in un unico workspace.",
};

export default function Page() {
  return (
    <>
      <HomeHeroSection />
      <KitchenRealitySection />
      <WorkflowSection />
      <ProductValueSection />
      <HomeFinalCtaSection />
    </>
  );
}
