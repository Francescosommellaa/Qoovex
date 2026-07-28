"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@qoovex/ui/components/button";
import type { EvidenceSensitivity } from "@qoovex/types";
import { submitJson } from "../admin-api-client";

export function EvidenceReviewActions({ evidenceId }: { evidenceId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [sensitivity, setSensitivity] = useState<EvidenceSensitivity>("INTERNAL");
  const [error, setError] = useState<string | null>(null);

  async function review(decision: "SUBMIT" | "ACCEPT" | "REJECT") {
    setPending(true); setError(null);
    try {
      const reason = decision === "REJECT" ? window.prompt("Motivazione del rifiuto") : null;
      if (decision === "REJECT" && !reason) { setPending(false); return; }
      await submitJson(`/api/evidence/${evidenceId}/review`, "POST", { decision, sensitivity, reason });
      router.refresh();
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Revisione non riuscita."); }
    finally { setPending(false); }
  }

  return <div className="grid gap-2"><select aria-label="Classificazione prova" className="h-10 rounded-md border bg-background px-2 text-xs" disabled={pending} onChange={(event) => setSensitivity(event.target.value as EvidenceSensitivity)} value={sensitivity}><option value="INTERNAL">Interna</option><option value="SHAREABLE">Condivisibile</option><option value="RESTRICTED">Riservata</option></select><div className="flex flex-wrap gap-2"><Button disabled={pending} onClick={() => void review("SUBMIT")} size="sm" type="button" variant="outline">Invia a revisione</Button><Button disabled={pending} onClick={() => void review("ACCEPT")} size="sm" type="button">Approva</Button><Button disabled={pending} onClick={() => void review("REJECT")} size="sm" type="button" variant="outline">Rifiuta</Button></div>{error ? <p className="text-xs text-destructive">{error}</p> : null}</div>;
}
