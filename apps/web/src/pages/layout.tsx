import type { ReactNode } from "react";
import { SiteShell } from "@/shared/components/index";
import { HomePage } from "@/pages/home/index";
import { EnterprisePage } from "@/pages/enterprise/index";

type MarketingLayoutProps = {
  children: ReactNode;
};

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return <SiteShell>{children}</SiteShell>;
}
export { HomePage, EnterprisePage };