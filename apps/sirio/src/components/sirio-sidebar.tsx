"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AdaptiveSidebar } from "@qoovex/ui/components/sidebar";
import { CatalogSearchModal } from "@/components/catalog-search-modal";
import sirioIcon from "@qoovex/brand-resources/sirio-icon/sirio.svg";
import sirioWhiteIcon from "@qoovex/brand-resources/sirio-icon/sirio-white.svg";
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

const navigationGroups = [
  {
    label: "Foundations",
    items: [
      { name: "Colori", href: "/foundations/colors", icon: IconPalette },
      { name: "Tipografia", href: "/foundations/typography", icon: IconTypography },
      { name: "Spaziatura e Raggio", href: "/foundations/spacing-and-radius", icon: IconRulerMeasure },
    ],
  },
  {
    label: "Componenti UI",
    items: [
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
  },
];

export function SirioSidebar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
      <AdaptiveSidebar
        brand={{
          href: "/",
          title: "Sirio",
          logo: (
            <span className="inline-flex size-7 shrink-0 items-center justify-center">
              <Image
                alt="Sirio"
                aria-hidden="true"
                className="size-6 object-contain dark:hidden"
                height={24}
                loading="eager"
                src={sirioIcon}
                unoptimized
                width={24}
              />
              <Image
                alt="Sirio"
                aria-hidden="true"
                className="hidden size-6 object-contain dark:block"
                height={24}
                loading="eager"
                src={sirioWhiteIcon}
                unoptimized
                width={24}
              />
            </span>
          ),
        }}
        search={{
          placeholder: "Cerca nel catalogo",
          onClick: () => setSearchOpen(true),
        }}
        groups={navigationGroups}
        pathname={pathname}
        variant="inset"
        collapsible="icon"
      />

      <CatalogSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
