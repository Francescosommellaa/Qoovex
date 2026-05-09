import type { ReactNode } from "react";
import { Box } from "@qoovex/ui";
import { SiteFooter } from "./site-footer";
import { SiteTopbar } from "./site-topbar";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <Box className="mx-auto flex min-h-dvh w-full max-w-(--container-wide) flex-col bg-(--color-bg) px-(--spacing-4) py-(--spacing-6) text-(--color-text) md:px-(--spacing-6) md:py-(--spacing-8)">
      <SiteTopbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </Box>
  );
}
