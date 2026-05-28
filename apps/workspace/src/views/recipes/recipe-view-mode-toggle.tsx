"use client";

import * as React from "react";
import { ListBullets, SquaresFour } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@qoovex/ui";
import type { RecipeViewMode } from "@shared/lib/workspace-types";

export function RecipeViewModeToggle({ view }: { view: RecipeViewMode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  function setView(nextView: RecipeViewMode) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextView === "list") {
      params.set("view", "list");
    } else {
      params.delete("view");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="inline-flex rounded-(--radius-full) border border-(--color-border) bg-(--color-surface-offset) p-0.5" aria-label="Cambia vista ricette">
      <Button
        type="button"
        variant={view === "cards" ? "secondary" : "ghost"}
        size="xs"
        iconLeft={<SquaresFour size={13} weight="bold" aria-hidden="true" />}
        onClick={() => setView("cards")}
      >
        Card
      </Button>
      <Button
        type="button"
        variant={view === "list" ? "secondary" : "ghost"}
        size="xs"
        iconLeft={<ListBullets size={13} weight="bold" aria-hidden="true" />}
        onClick={() => setView("list")}
      >
        Lista
      </Button>
    </div>
  );
}
