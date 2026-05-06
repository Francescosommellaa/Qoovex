import type { Metadata } from "next";
import { ContactFormSection } from "./sections/index";

export const metadata: Metadata = {
  title: "Contatti",
  description: "Scrivici per supporto, partnership o informazioni su Qoovex.",
};

export default function Page() {
  return (
    <div className="space-y-10">
      <ContactFormSection />
    </div>
  );
}
