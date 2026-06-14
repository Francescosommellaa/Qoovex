"use client";

import dynamic from "next/dynamic";

const SirioShowcase = dynamic(
  () =>
    import("@/components/sirio-showcase").then(
      (module) => module.SirioShowcase,
    ),
  { ssr: false },
);

export default function SirioPage() {
  return <SirioShowcase />;
}
