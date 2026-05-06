import type { Metadata } from "next";
import { PricingPlansSection } from "./sections/index";
import { SharedCtaSection } from "@/shared/sections/index";

export const metadata: Metadata = {
  title: "Prezzi",
  description:
    "Parti dal piano più adatto al tuo team e scala con limiti chiari su ricette, menu e piani di lavoro.",
};

export default function Page() {
  return (
    <div className="space-y-10">
      <PricingPlansSection />
      <SharedCtaSection />
    </div>
  );
}