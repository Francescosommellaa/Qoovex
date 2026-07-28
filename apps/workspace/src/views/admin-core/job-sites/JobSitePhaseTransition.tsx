"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconAlertTriangle } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@qoovex/ui/components/field";
import { Textarea } from "@qoovex/ui/components/textarea";
import { jobSiteOperationalPhaseLabels } from "@qoovex/types";
import type { JobSiteOperationalPhase } from "@qoovex/types";
import { submitJson } from "../admin-api-client";

const transitions: Record<JobSiteOperationalPhase, readonly JobSiteOperationalPhase[]> = {
  DRAFT: ["PREPARATION"], PREPARATION: ["IN_PROGRESS"], IN_PROGRESS: ["PAUSED", "CLOSING"],
  PAUSED: ["IN_PROGRESS"], CLOSING: ["COMPLETED"], COMPLETED: ["PREPARATION"],
};

export function JobSitePhaseTransition({ jobSiteId, phase }: { jobSiteId: string; phase: JobSiteOperationalPhase }) {
  const router = useRouter();
  const [nextPhase, setNextPhase] = useState<JobSiteOperationalPhase>(transitions[phase][0] ?? phase);
  const [reason, setReason] = useState("");
  const [overrideConfirmed, setOverrideConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setPending(true); setError(null);
    try {
      await submitJson(`/api/job-sites/${jobSiteId}/phase`, "POST", { nextPhase, reason: reason || null, overrideConfirmed });
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Transizione non riuscita.");
    } finally { setPending(false); }
  }

  return <div className="grid gap-4 rounded-lg border p-4">
    <div><h3 className="text-sm font-medium">Transizione di fase</h3><p className="mt-1 text-xs text-muted-foreground">Qoovex verifica richieste, checklist e documenti prima di applicare il cambio.</p></div>
    {error ? <Alert variant="warning"><IconAlertTriangle aria-hidden="true" /><AlertTitle>Transizione bloccata</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
    <div className="grid gap-4 sm:grid-cols-2">
      <Field><FieldLabel htmlFor="job-site-next-phase">Nuova fase</FieldLabel><select className="h-11 rounded-md border bg-background px-3 text-sm" disabled={pending} id="job-site-next-phase" onChange={(event) => setNextPhase(event.target.value as JobSiteOperationalPhase)} value={nextPhase}>{transitions[phase].map((item) => <option key={item} value={item}>{jobSiteOperationalPhaseLabels[item]}</option>)}</select></Field>
      <Field><FieldLabel htmlFor="job-site-phase-reason">Motivazione</FieldLabel><Textarea id="job-site-phase-reason" maxLength={1000} onChange={(event) => setReason(event.target.value)} placeholder={phase === "COMPLETED" ? "Obbligatoria per la riapertura" : "Obbligatoria in caso di override"} rows={2} value={reason} /></Field>
    </div>
    <label className="flex items-start gap-3 rounded-lg border p-3 text-sm"><input checked={overrideConfirmed} className="mt-0.5 size-4" onChange={(event) => setOverrideConfirmed(event.target.checked)} type="checkbox" /><span><strong className="block font-medium">Conferma override degli elementi aperti</strong><span className="text-muted-foreground">Valido solo per Owner e con motivazione. Non chiude né modifica gli elementi bloccanti.</span></span></label>
    <FieldDescription>La riapertura da completato è sempre riservata all’Owner.</FieldDescription>
    <div className="flex justify-end"><Button className="h-11" disabled={pending || !transitions[phase].length} onClick={() => void submit()} type="button"><IconArrowRight aria-hidden="true" />{pending ? "Verifica..." : "Verifica e cambia fase"}</Button></div>
  </div>;
}
