import type { ReactNode } from "react";
import { SiteShell } from "@/shared/components/index";

type MarketingLayoutProps = {
  children: ReactNode;
};

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return <SiteShell>{children}</SiteShell>;
}
