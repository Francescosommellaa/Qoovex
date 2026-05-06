import type { Metadata } from "next";
import { StorySection } from "./sections/index";
import { SharedCtaSection } from "@/shared/sections/index";

export const metadata: Metadata = {
  title: "Enterprise",
  description:
    "Soluzioni Qoovex per brighe di cucina strutturate, ristoranti multi-sede e realtà enterprise con limiti custom.",
};

export default function Page() {
  return (
    <div className="space-y-10">
      <StorySection />
      <SharedCtaSection />
    </div>
  );
}
