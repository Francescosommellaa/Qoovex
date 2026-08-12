"use client";

import type { DevWorkspaceView } from "@qoovex/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { presentAccountRole, presentPlatformRole } from "@shared/lib/product-state-presentation";

const VIEW_OPTIONS: Array<{ label: string; value: DevWorkspaceView }> = [
  { label: presentAccountRole("BUSINESS").label, value: "BUSINESS" },
  { label: presentAccountRole("PROFESSIONAL").label, value: "PROFESSIONAL" },
  { label: presentAccountRole("CLIENT").label, value: "CLIENT" },
  { label: presentPlatformRole("SUPPORT_AGENT").label, value: "SUPPORT_AGENT" },
  { label: presentPlatformRole("PLATFORM_ADMIN").label, value: "PLATFORM_ADMIN" },
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
    router.push(nextView === "BUSINESS" || nextView === "PROFESSIONAL" ? "/" : nextView === "CLIENT" ? "/client" : "/qoovex-admin");
    router.refresh();
  }

  return (
    <Select items={VIEW_OPTIONS} onValueChange={(value) => void changeView(value as DevWorkspaceView)} value={selectedView}>
      <SelectTrigger aria-label="Vista di sviluppo" className="h-8 w-[10.5rem] sm:w-[12rem]" disabled={pending}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>{VIEW_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup>
      </SelectContent>
    </Select>
  );
}
