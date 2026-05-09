import type { Metadata } from "next";
import { StorySection } from "./sections/index";
import { SharedCtaSection } from "@/shared/sections/index";

export const metadata: Metadata = {
  title: "Enterprise",
  description:
    "Soluzioni Qoovex per brigate di cucina strutturate, ristoranti multi-sede e realta enterprise con limiti custom.",
};

export default function Page() {
  return (
    <>
      <StorySection />
      <SharedCtaSection />
    </>
  );
}
