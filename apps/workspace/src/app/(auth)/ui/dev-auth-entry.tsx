"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@qoovex/ui";
import { getSafeRedirectPath } from "@shared/lib/auth-flow";

const DEV_AUTH_KEY = "D";

export function DevAuthEntry() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const callbackUrl = getSafeRedirectPath(
    searchParams.get("callbackUrl") ?? searchParams.get("redirect_url"),
  );

  React.useEffect(() => {
    async function handleKeyDown(event: KeyboardEvent) {
      if (!event.ctrlKey || !event.shiftKey || event.key.toUpperCase() !== DEV_AUTH_KEY) {
        return;
      }

      event.preventDefault();
      const response = await fetch(
        `/api/dev-auth?redirect_url=${encodeURIComponent(callbackUrl)}`,
        { method: "POST" },
      );

      if (!response.ok) {
        toast({
          variant: "error",
          title: "Accesso sviluppo non disponibile",
          description: "Verifica host locale e DEV_AUTH_SECRET.",
        });
        return;
      }

      const payload = (await response.json().catch(() => null)) as {
        destination?: unknown;
      } | null;
      window.location.assign(
        typeof payload?.destination === "string" ? payload.destination : "/dashboard",
      );
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callbackUrl, toast]);

  return null;
}
