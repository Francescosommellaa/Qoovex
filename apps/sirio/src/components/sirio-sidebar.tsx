"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@qoovex/ui/components/sidebar";
import { Button } from "@qoovex/ui/components/button";
import { BrandMark } from "@/components/brand-mark";
import { CatalogSearchModal } from "@/components/catalog-search-modal";
import {
  IconPalette,
  IconTypography,
  IconRulerMeasure,
  IconClick,
  IconLayoutCards,
  IconWindowMaximize,
  IconForms,
  IconTable,
  IconSquare,
  IconAlertCircle,
  IconUser,
  IconRoute,
  IconSelector,
  IconFolderOff,
  IconTimeline,
  IconInfoSquare,
  IconAdjustments,
  IconFileText,
  IconChartBar,
  IconFold,
  IconBoxPadding,
  IconLoader,
  IconListCheck,
  IconMinus,
  IconLayoutSidebar,
  IconLayoutNavbar,
  IconSearch,
} from "@tabler/icons-react";

const navigation = {
  foundations: [
    { name: "Colori", href: "/foundations/colors", icon: IconPalette },
    { name: "Tipografia", href: "/foundations/typography", icon: IconTypography },
    { name: "Spaziatura e Raggio", href: "/foundations/spacing-and-radius", icon: IconRulerMeasure },
  ],
  components: [
    { name: "Alert", href: "/components/alert", icon: IconAlertCircle },
    { name: "Avatar", href: "/components/avatar", icon: IconUser },
    { name: "Badge", href: "/components/badge", icon: IconSquare },
    { name: "Breadcrumb", href: "/components/breadcrumb", icon: IconRoute },
    { name: "Button", href: "/components/button", icon: IconClick },
    { name: "Card", href: "/components/card", icon: IconLayoutCards },
    { name: "Chart", href: "/components/chart", icon: IconChartBar },
    { name: "Collapsible", href: "/components/collapsible", icon: IconFold },
    { name: "Controlli & Input", href: "/components/controls", icon: IconAdjustments },
    { name: "Dialog", href: "/components/dialog", icon: IconWindowMaximize },
    { name: "Dropdown Menu", href: "/components/dropdown-menu", icon: IconForms },
    { name: "Empty State", href: "/components/empty", icon: IconFolderOff },
    { name: "Field", href: "/components/field", icon: IconForms },
    { name: "Floating Navigation", href: "/components/floating-navigation", icon: IconRoute },
    { name: "Search Field", href: "/components/search-field", icon: IconSearch },
    { name: "Select", href: "/components/select", icon: IconSelector },
    { name: "Separator", href: "/components/separator", icon: IconMinus },
    { name: "Sidebar", href: "/components/sidebar", icon: IconLayoutSidebar },
    { name: "Skeleton", href: "/components/skeleton", icon: IconBoxPadding },
    { name: "Spinner", href: "/components/spinner", icon: IconLoader },
    { name: "Table", href: "/components/table", icon: IconTable },
    { name: "Tabs", href: "/components/tabs", icon: IconInfoSquare },
    { name: "Textarea", href: "/components/textarea", icon: IconFileText },
    { name: "Timeline", href: "/components/timeline", icon: IconTimeline },
    { name: "Tooltip", href: "/components/tooltip", icon: IconInfoSquare },
    { name: "Topbar", href: "/components/topbar", icon: IconLayoutNavbar },
    { name: "Work Queue Item", href: "/components/work-queue-item", icon: IconListCheck },
  ],
};

export function SirioSidebar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="h-14 items-center justify-between border-b px-4 py-0 flex-row gap-2">
          <Link href="/" className="flex items-center gap-2 min-w-0 overflow-hidden">
            <BrandMark variant="sirio" />
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cerca nel catalogo"
            onClick={() => setSearchOpen(true)}
          >
            <IconSearch className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
          </Button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Foundations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.foundations.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Componenti UI ({navigation.components.length})</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.components.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <CatalogSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
