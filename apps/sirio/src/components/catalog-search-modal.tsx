"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@qoovex/ui/components/dialog";
import { SearchField, SearchResults } from "@qoovex/ui/components/search-field";
import { Card } from "@qoovex/ui/components/card";
import { Badge } from "@qoovex/ui/components/badge";
import { KbdShortcut } from "@qoovex/ui/components/kbd-shortcut";
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

export const catalogNavigation = [
  { name: "Colori", href: "/foundations/colors", icon: IconPalette, category: "Foundations" },
  { name: "Tipografia", href: "/foundations/typography", icon: IconTypography, category: "Foundations" },
  { name: "Spaziatura e Raggio", href: "/foundations/spacing-and-radius", icon: IconRulerMeasure, category: "Foundations" },
  { name: "Alert", href: "/components/alert", icon: IconAlertCircle, category: "Componenti" },
  { name: "Avatar", href: "/components/avatar", icon: IconUser, category: "Componenti" },
  { name: "Badge", href: "/components/badge", icon: IconSquare, category: "Componenti" },
  { name: "Breadcrumb", href: "/components/breadcrumb", icon: IconRoute, category: "Componenti" },
  { name: "Button", href: "/components/button", icon: IconClick, category: "Componenti" },
  { name: "Card", href: "/components/card", icon: IconLayoutCards, category: "Componenti" },
  { name: "Chart", href: "/components/chart", icon: IconChartBar, category: "Componenti" },
  { name: "Collapsible", href: "/components/collapsible", icon: IconFold, category: "Componenti" },
  { name: "Controlli & Input", href: "/components/controls", icon: IconAdjustments, category: "Componenti" },
  { name: "Dialog", href: "/components/dialog", icon: IconWindowMaximize, category: "Componenti" },
  { name: "Dropdown Menu", href: "/components/dropdown-menu", icon: IconForms, category: "Componenti" },
  { name: "Empty State", href: "/components/empty", icon: IconFolderOff, category: "Componenti" },
  { name: "Field", href: "/components/field", icon: IconForms, category: "Componenti" },
  { name: "Floating Navigation", href: "/components/floating-navigation", icon: IconRoute, category: "Componenti" },
  { name: "Search Field", href: "/components/search-field", icon: IconSearch, category: "Componenti" },
  { name: "Select", href: "/components/select", icon: IconSelector, category: "Componenti" },
  { name: "Separator", href: "/components/separator", icon: IconMinus, category: "Componenti" },
  { name: "Sidebar", href: "/components/sidebar", icon: IconLayoutSidebar, category: "Componenti" },
  { name: "Skeleton", href: "/components/skeleton", icon: IconBoxPadding, category: "Componenti" },
  { name: "Spinner", href: "/components/spinner", icon: IconLoader, category: "Componenti" },
  { name: "Table", href: "/components/table", icon: IconTable, category: "Componenti" },
  { name: "Tabs", href: "/components/tabs", icon: IconInfoSquare, category: "Componenti" },
  { name: "Textarea", href: "/components/textarea", icon: IconFileText, category: "Componenti" },
  { name: "Timeline", href: "/components/timeline", icon: IconTimeline, category: "Componenti" },
  { name: "Tooltip", href: "/components/tooltip", icon: IconInfoSquare, category: "Componenti" },
  { name: "Topbar", href: "/components/topbar", icon: IconLayoutNavbar, category: "Componenti" },
  { name: "Work Queue Item", href: "/components/work-queue-item", icon: IconListCheck, category: "Componenti" },
];

export interface CatalogSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CatalogSearchModal({ open, onOpenChange }: CatalogSearchModalProps) {
  const [query, setQuery] = React.useState("");

  // Keyboard shortcut listener ⌘K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const results = React.useMemo(() => {
    if (!query.trim()) return catalogNavigation;
    return catalogNavigation.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 sm:max-w-lg overflow-hidden border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="p-4 border-b border-border/60 pb-3">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-sm font-bold font-accent flex items-center gap-2">
              <IconSearch className="size-4 text-primary" />
              Cerca nel catalogo Sirio
            </DialogTitle>
            <KbdShortcut value="⌘K" className="text-[0.6rem]" />
          </div>
          <div className="mt-3">
            <SearchField
              placeholder="Cerca componenti (es. Button, Modal, Spinner)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery("")}
              className="w-full text-xs"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nessun componente trovato per &quot;{query}&quot;
            </div>
          ) : (
            <SearchResults>
              {results.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/40 hover:bg-accent/60 transition-all duration-150 text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <item.icon className="size-4" />
                    </div>
                    <span className="font-semibold font-accent text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <Badge variant="outline" size="sm" className="text-[0.65rem] opacity-70">
                    {item.category}
                  </Badge>
                </Link>
              ))}
            </SearchResults>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
