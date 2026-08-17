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
import {
  catalogNavigationGroups,
  findCatalogNavigation,
} from "@/lib/catalog-navigation";

export function SirioTopbar() {
  const pathname = usePathname() ?? "";
  const [searchOpen, setSearchOpen] = React.useState(false);

  const breadcrumbItems: BreadcrumbItemSpec[] = React.useMemo(() => {
    if (pathname === "/" || pathname === "") {
      return [{ label: "Sirio Catalog" }];
    }
    const current = findCatalogNavigation(pathname);
    if (!current) return [{ label: "Sirio" }];

    const sirioHome = catalogNavigationGroups[0].href;

    if (current.group.href === current.item.href) {
      return [
        { label: "Sirio", href: sirioHome, render: <Link href={sirioHome} /> },
        { label: current.group.label },
      ];
    }

    return [
      { label: "Sirio", href: sirioHome, render: <Link href={sirioHome} /> },
      {
        label: current.group.label,
        href: current.group.href,
        render: <Link href={current.group.href} />,
      },
      { label: current.item.name },
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
            aria-label="Cerca nel catalogo"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setSearchOpen(true)}
          >
            <IconSearch aria-hidden="true" className="size-3.5" />
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
