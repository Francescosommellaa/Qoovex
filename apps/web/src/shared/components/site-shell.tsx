import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteTopbar } from "./site-topbar";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col bg-bg px-6 py-8 text-text">
      <SiteTopbar />
      <main className="flex-1 py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
