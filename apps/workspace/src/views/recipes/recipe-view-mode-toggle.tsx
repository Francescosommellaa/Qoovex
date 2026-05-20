"use client";

import * as React from "react";
import { ListBullets, SquaresFour } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Toggle } from "@qoovex/ui";
import type { RecipeViewMode } from "@shared/lib/workspace-types";

export function RecipeViewModeToggle({ view }: { view: RecipeViewMode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [checked, setChecked] = React.useState(view === "list");

  React.useEffect(() => {
    setChecked(view === "list");
  }, [view]);

  function handleChange(nextChecked: boolean) {
    setChecked(nextChecked);
    const params = new URLSearchParams(searchParams.toString());

    if (nextChecked) {
      params.set("view", "list");
    } else {
      params.delete("view");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Toggle
      checked={checked}
      onCheckedChange={handleChange}
      label={checked ? "Lista" : "Card"}
      description="Cambia vista"
      iconChecked={<ListBullets size={12} weight="bold" aria-hidden="true" />}
      iconUnchecked={<SquaresFour size={12} weight="bold" aria-hidden="true" />}
      aria-label="Cambia vista ricette"
    />
  );
}
