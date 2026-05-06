import type { ReactNode } from "react";
import { SiteShell } from "@/shared/components/index";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}