import type { Metadata } from "next";

import { ComponentCatalog } from "./component-catalog";

export const metadata: Metadata = { title: "Componenti — Sirio" };

export default function ComponentsPage() {
  return <ComponentCatalog />;
}
