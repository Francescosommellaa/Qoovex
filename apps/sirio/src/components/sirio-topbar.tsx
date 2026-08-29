"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Topbar, TopbarStart, TopbarCenter, TopbarEnd } from "@qoovex/ui/components/topbar";
import { SidebarTrigger, SidebarCollapseButton } from "@qoovex/ui/components/sidebar";
import { Separator } from "@qoovex/ui/components/separator";
import { Breadcrumb, type BreadcrumbItemSpec } from "@qoovex/ui/components/breadcrumb";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";
import {
  catalogNavigationGroups,
  findCatalogNavigation,
} from "@/lib/catalog-navigation";

export function SirioTopbar() {
  const pathname = usePathname() ?? "";

  const breadcrumbItems: BreadcrumbItemSpec[] = React.useMemo(() => {
    if (pathname === "/" || pathname === "") {
      return [{ label: "Sirio Catalog" }];
    }
    const current = findCatalogNavigation(pathname);
    if (!current) return [{ label: "Sirio" }];

    const sirioHome = catalogNavigationGroups[0].href;
    const groupBreadcrumbDisabled =
      "breadcrumbDisabled" in current.group && current.group.breadcrumbDisabled;

    return [
      { label: "Sirio", href: sirioHome, render: <Link href={sirioHome} /> },
      {
        label: groupBreadcrumbDisabled
          ? <span aria-disabled="true">{current.group.label}</span>
          : current.group.label,
        ...(groupBreadcrumbDisabled
          ? { className: "pointer-events-none cursor-default opacity-50" }
          : {
              href: current.group.href,
              render: <Link href={current.group.href} />,
            }),
      },
      { label: current.item.name },
    ];
  }, [pathname]);

  return (
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
        <ThemeToggle />
      </TopbarEnd>
    </Topbar>
  );
}
