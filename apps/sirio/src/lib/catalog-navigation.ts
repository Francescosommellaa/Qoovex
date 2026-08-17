import {
  IconAdjustments,
  IconAlertCircle,
  IconArrowsExchange,
  IconBoxPadding,
  IconChartBar,
  IconCircleCheck,
  IconCurrencyEuro,
  IconClick,
  IconFileText,
  IconFold,
  IconFolderOff,
  IconForms,
  IconInfoSquare,
  IconLayoutCards,
  IconLayoutNavbar,
  IconLayoutSidebar,
  IconListCheck,
  IconLoader,
  IconMail,
  IconMinus,
  IconPalette,
  IconPaperclip,
  IconRoute,
  IconRulerMeasure,
  IconSearch,
  IconSelector,
  IconSquare,
  IconTable,
  IconTemplate,
  IconTimeline,
  IconTypography,
  IconUser,
  IconWindowMaximize,
} from "@tabler/icons-react";

export const catalogNavigationGroups = [
  {
    label: "Foundations",
    href: "/foundations/colors",
    items: [
      { name: "Colori", href: "/foundations/colors", icon: IconPalette },
      { name: "Tipografia", href: "/foundations/typography", icon: IconTypography },
      { name: "Spaziatura e Raggio", href: "/foundations/spacing-and-radius", icon: IconRulerMeasure },
    ],
  },
  {
    label: "Patterns",
    href: "/patterns",
    items: [
      { name: "Panoramica", href: "/patterns", icon: IconTemplate },
      { name: "Work Queue", href: "/patterns/work-queue", icon: IconListCheck },
      { name: "Timeline Event", href: "/patterns/timeline-event", icon: IconTimeline },
      { name: "Status Presentation", href: "/patterns/status-presentation", icon: IconCircleCheck },
      { name: "Form Validation", href: "/patterns/form-validation", icon: IconForms },
      { name: "Money", href: "/patterns/money", icon: IconCurrencyEuro },
      { name: "Proposal Review", href: "/patterns/proposal-review", icon: IconArrowsExchange },
      { name: "Contextual Attachment", href: "/patterns/contextual-attachment", icon: IconPaperclip },
      { name: "Invitation", href: "/patterns/invitation", icon: IconMail },
    ],
  },
  {
    label: "Componenti UI",
    href: "/components/button",
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
] as const;

export const catalogNavigation = catalogNavigationGroups.flatMap((group) =>
  group.items.map((item) => ({ ...item, category: group.label })),
);

export type CatalogNavigationItem = (typeof catalogNavigation)[number];

export function findCatalogNavigation(pathname: string) {
  for (const group of catalogNavigationGroups) {
    const item = group.items.find((entry) => entry.href === pathname);
    if (item) return { group, item };
  }

  return null;
}
