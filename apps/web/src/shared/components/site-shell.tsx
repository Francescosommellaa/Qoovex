import type { ReactNode } from "react";
import { Box } from "@qoovex/ui";
import { SiteFooter } from "./site-footer";
import { SiteTopbar } from "./site-topbar";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <Box className="flex min-h-dvh w-full flex-col overflow-x-hidden bg-(--color-bg) text-(--color-text)">
      <SiteTopbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </Box>
  );
}
