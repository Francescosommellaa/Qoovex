"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OperationalDecisionDto, OperationalExceptionDto, OperationalStepDto } from "@qoovex/types";
import { Alert, AlertDescription } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@qoovex/ui/components/dialog";
import { Field, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Textarea } from "@qoovex/ui/components/textarea";

async function postJson(path: string, body?: unknown) {
  const response = await fetch(path, { method: "POST", headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Operazione non disponibile.");
}

export function DecisionAction({ decision }: { decision: OperationalDecisionDto }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [optionKey, setOptionKey] = useState(decision.proposedOptionKey ?? decision.options[0]?.key ?? "");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  if (!decision.canResolve) return null;
  const submit = () => startTransition(async () => {
    setError(null);
    try {
      await postJson(`/api/operations/decisions/${decision.id}/resolve`, decision.type === "CONFIRM_EXPIRY_DATE"
        ? { kind: "CONFIRM_DATE", optionKey: "enter-date", value, reason: reason || undefined }
        : { kind: "SELECT_OPTION", optionKey, reason: reason || undefined });
      setOpen(false);
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Operazione non disponibile."); }
  });
  return <Dialog onOpenChange={setOpen} open={open}>
    <DialogTrigger render={<Button size="sm" />}>Rispondi</DialogTrigger>
    <DialogContent>
      <DialogHeader><DialogTitle>{decision.question}</DialogTitle><DialogDescription>{decision.explanation}</DialogDescription></DialogHeader>
      <div className="grid gap-4">
        <Field><FieldLabel htmlFor={`decision-${decision.id}`}>Risposta</FieldLabel><Select items={decision.options.map((item) => ({ label: item.label, value: item.key }))} onValueChange={(next) => next && setOptionKey(next)} value={optionKey}><SelectTrigger className="w-full" id={`decision-${decision.id}`}><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{decision.options.map((option) => <SelectItem key={option.key} value={option.key}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
        {decision.type === "CONFIRM_EXPIRY_DATE" ? <Field><FieldLabel htmlFor={`decision-value-${decision.id}`}>Data confermata</FieldLabel><Input id={`decision-value-${decision.id}`} onChange={(event) => setValue(event.target.value)} required type="date" value={value} /></Field> : null}
        <Field><FieldLabel htmlFor={`decision-reason-${decision.id}`}>Nota opzionale</FieldLabel><Textarea id={`decision-reason-${decision.id}`} maxLength={1000} onChange={(event) => setReason(event.target.value)} rows={3} value={reason} /></Field>
        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      </div>
      <DialogFooter><DialogClose render={<Button variant="outline" />}>Annulla</DialogClose><Button disabled={pending || !optionKey || (decision.type === "CONFIRM_EXPIRY_DATE" && !value)} onClick={submit}>{pending ? <><Spinner />Registrazione…</> : "Conferma"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}

export function ExceptionAction({ exception }: { exception: OperationalExceptionDto }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  if (!exception.canResolve) return null;
  const submit = () => startTransition(async () => {
    setError(null);
    try { await postJson(`/api/operations/exceptions/${exception.id}/resolve`, { kind: "MANUAL_EXCEPTION_RESOLUTION", reason }); setOpen(false); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Operazione non disponibile."); }
  });
  return <Dialog onOpenChange={setOpen} open={open}><DialogTrigger render={<Button size="sm" variant="outline" />}>Risolvi</DialogTrigger><DialogContent>
    <DialogHeader><DialogTitle>Motiva la risoluzione</DialogTitle><DialogDescription>Solo questa tipologia di eccezione consente una chiusura manuale. Le condizioni oggettive restano chiuse dal processo.</DialogDescription></DialogHeader>
    <Field><FieldLabel htmlFor={`exception-${exception.id}`}>Motivazione</FieldLabel><Textarea id={`exception-${exception.id}`} maxLength={1000} minLength={3} onChange={(event) => setReason(event.target.value)} required rows={4} value={reason} /></Field>
    {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
    <DialogFooter><DialogClose render={<Button variant="outline" />}>Annulla</DialogClose><Button disabled={pending || reason.trim().length < 3} onClick={submit}>{pending ? <><Spinner />Registrazione…</> : "Registra risoluzione"}</Button></DialogFooter>
  </DialogContent></Dialog>;
}

export function RetryStepAction({ step }: { step: OperationalStepDto }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  if (!step.canRetry) return null;
  const retry = () => startTransition(async () => {
    setError(null);
    try { await postJson(`/api/operations/steps/${step.id}/retry`, { kind: "RETRY_TECHNICAL_STEP" }); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Retry non disponibile."); }
  });
  return <div className="grid justify-items-end gap-1"><Button disabled={pending} onClick={retry} size="sm" variant="outline">{pending ? <><Spinner />Retry…</> : "Riprova step"}</Button>{error ? <p className="text-xs text-destructive">{error}</p> : null}</div>;
}
