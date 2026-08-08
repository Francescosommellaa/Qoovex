"use client";

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
  SidebarCollapseButton,
} from "@qoovex/ui/components/sidebar";
import { BrandMark } from "@/components/brand-mark";
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
} from "@tabler/icons-react";

const navigation = {
  foundations: [
    { name: "Colori", href: "/foundations/colors", icon: IconPalette },
    { name: "Tipografia", href: "/foundations/typography", icon: IconTypography },
    { name: "Spaziatura e Raggio", href: "/foundations/spacing-and-radius", icon: IconRulerMeasure },
  ],
  components: [
    { name: "Button", href: "/components/button", icon: IconClick },
    { name: "Card", href: "/components/card", icon: IconLayoutCards },
    { name: "Dialog", href: "/components/dialog", icon: IconWindowMaximize },
    { name: "Dropdown Menu", href: "/components/dropdown-menu", icon: IconForms },
    { name: "Field", href: "/components/field", icon: IconForms },
    { name: "Table", href: "/components/table", icon: IconTable },
    { name: "Badge", href: "/components/badge", icon: IconSquare },
  ],
};

export function SirioSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="h-14 items-center justify-between border-b px-4 py-0 flex-row">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark variant="sirio" />
        </Link>
        <SidebarCollapseButton iconOnly />
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
          <SidebarGroupLabel>Components</SidebarGroupLabel>
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
  );
}
