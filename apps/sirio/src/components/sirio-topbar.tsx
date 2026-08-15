"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Topbar, TopbarStart, TopbarCenter, TopbarEnd } from "@qoovex/ui/components/topbar";
import { SidebarTrigger, SidebarCollapseButton } from "@qoovex/ui/components/sidebar";
import { Separator } from "@qoovex/ui/components/separator";
import { Breadcrumb, type BreadcrumbItemSpec } from "@qoovex/ui/components/breadcrumb";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";
import { Button } from "@qoovex/ui/components/button";
import { KbdShortcut } from "@qoovex/ui/components/kbd-shortcut";
import { IconSearch } from "@tabler/icons-react";
import { CatalogSearchModal } from "@/components/catalog-search-modal";

export function SirioTopbar() {
  const pathname = usePathname() ?? "";
  const [searchOpen, setSearchOpen] = React.useState(false);

  const breadcrumbItems: BreadcrumbItemSpec[] = React.useMemo(() => {
    if (pathname === "/" || pathname === "") {
      return [{ label: "Sirio Catalog" }];
    }
    const parts = pathname.split("/").filter(Boolean);
    const category = parts[0] === "foundations" ? "Foundations" : "Componenti";
    const rawName = parts[parts.length - 1] ?? "";
    const name = rawName
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return [
      { label: "Sirio", href: "/components/button", render: <Link href="/components/button" /> },
      { label: category },
      { label: name },
    ];
  }, [pathname]);

  return (
    <>
      <Topbar>
        <TopbarStart>
          <SidebarTrigger aria-label="Apri navigazione mobile" className="md:hidden" />
          <SidebarCollapseButton className="hidden md:flex" iconOnly />
          <Separator className="hidden h-4 md:block" orientation="vertical" />
        </TopbarStart>

        <TopbarCenter>
          <Breadcrumb items={breadcrumbItems} className="min-w-0 flex-1" />
        </TopbarCenter>

        <TopbarEnd>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setSearchOpen(true)}
          >
            <IconSearch className="size-3.5" />
            <span className="hidden sm:inline">Cerca...</span>
            <KbdShortcut value="⌘K" className="text-[0.6rem] opacity-60" />
          </Button>
          <ThemeToggle />
        </TopbarEnd>
      </Topbar>

      <CatalogSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
