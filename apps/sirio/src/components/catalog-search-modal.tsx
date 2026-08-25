"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@qoovex/ui/components/dialog";
import { SearchField, SearchResults } from "@qoovex/ui/components/search-field";
import { Card } from "@qoovex/ui/components/card";
import { Badge } from "@qoovex/ui/components/badge";
import { KbdShortcut } from "@qoovex/ui/components/kbd-shortcut";
import {
  catalogNavigation,
  type CatalogNavigationItem,
} from "@/lib/catalog-navigation";
import {
  SlidingIndicatorContainer,
  SlidingIndicator,
  useSlidingIndicator,
} from "@qoovex/ui/components/sliding-indicator";
import { IconSearch } from "@tabler/icons-react";

export interface CatalogSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SearchResultItem({
  item,
  onSelect,
}: {
  item: CatalogNavigationItem;
  onSelect: () => void;
}) {
  const slidingCtx = useSlidingIndicator();

  return (
    <Link
      href={item.href}
      onClick={onSelect}
      onMouseEnter={(e) => slidingCtx?.moveIndicator(e.currentTarget)}
      onFocus={(e) => slidingCtx?.moveIndicator(e.currentTarget)}
      className="relative z-10 flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/40 transition-all duration-150 text-xs group"
    >
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <item.icon aria-hidden="true" className="size-4" />
        </div>
        <span className="font-semibold font-accent text-foreground group-hover:text-primary transition-colors">
          {item.name}
        </span>
      </div>
      <Badge variant="outline" size="sm" className="text-[0.65rem] opacity-70">
        {item.category}
      </Badge>
    </Link>
  );
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
      <DialogContent closeButtonProps={{ "aria-label": "Chiudi ricerca nel catalogo" }} className="p-0 gap-0 sm:max-w-lg overflow-hidden border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="p-4 border-b border-border/60 pb-3">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-sm font-bold font-accent flex items-center gap-2">
              <IconSearch aria-hidden="true" className="size-4 text-primary" />
              Cerca nel catalogo Sirio
            </DialogTitle>
            <KbdShortcut value="⌘K" className="text-[0.6rem]" />
          </div>
          <div className="mt-3">
            <SearchField
              placeholder="Cerca fondazioni, componenti e pattern..."
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
              Nessun risultato per &quot;{query}&quot;
            </div>
          ) : (
            <SearchResults>
              <SlidingIndicatorContainer className="flex flex-col gap-1" rounded="lg">
                {results.map((item) => (
                  <SearchResultItem
                    key={item.href}
                    item={item}
                    onSelect={() => onOpenChange(false)}
                  />
                ))}
              </SlidingIndicatorContainer>
            </SearchResults>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
