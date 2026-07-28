"use client";

import type { DevWorkspaceView } from "@qoovex/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { useRouter } from "next/navigation";
import { useState } from "react";

const VIEW_OPTIONS: Array<{ label: string; value: DevWorkspaceView }> = [
  { label: "Owner", value: "OWNER" },
  { label: "Support Agent", value: "SUPPORT_AGENT" },
  { label: "Platform Admin", value: "PLATFORM_ADMIN" },
];

export function DevViewSwitcher({ view }: { view: DevWorkspaceView }) {
  const router = useRouter();
  const [selectedView, setSelectedView] = useState(view);
  const [pending, setPending] = useState(false);

  async function changeView(nextView: DevWorkspaceView) {
    setSelectedView(nextView);
    setPending(true);
    const response = await fetch("/api/dev-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ view: nextView }),
    }).catch(() => null);

    if (!response?.ok) {
      setSelectedView(view);
      setPending(false);
      return;
    }

    setPending(false);
    router.push(nextView === "OWNER" ? "/dashboard" : "/qoovex-admin");
    router.refresh();
  }

  return (
    <Select items={VIEW_OPTIONS} onValueChange={(value) => void changeView(value as DevWorkspaceView)} value={selectedView}>
      <SelectTrigger aria-label="Vista di sviluppo" className="h-8 w-[9.5rem] sm:w-[10.5rem]" disabled={pending}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>{VIEW_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup>
      </SelectContent>
    </Select>
  );
}
