"use client";

import { useMemo, useState } from "react";
import { IconAlertTriangle, IconCheck, IconClipboard, IconExternalLink, IconLock } from "@tabler/icons-react";
import type { ConfirmDocumentPackageShareProposalResponse, DocumentPackageShareProposalDto } from "@qoovex/types";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Field, FieldDescription, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Spinner } from "@qoovex/ui/components/spinner";
import { buildSharedDocumentPackagePath } from "@shared/lib/workspace-link-routes";

function defaultExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

async function postJson<T>(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json() as T | { message?: string };
  const errorPayload = payload && typeof payload === "object" ? payload as { message?: string } : {};
  if (!response.ok) throw new Error(errorPayload.message ?? "Operazione non riuscita.");
  return payload as T;
}

export function DocumentPackageShareReview({ packageId, initialProposals }: { packageId: string; initialProposals: DocumentPackageShareProposalDto[] }) {
  const [targetKind, setTargetKind] = useState<"NAMED_RECIPIENT" | "LINK_PURPOSE">("NAMED_RECIPIENT");
  const [recipientLabel, setRecipientLabel] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expiresAt, setExpiresAt] = useState(defaultExpiry);
  const [allowDownload, setAllowDownload] = useState(false);
  const [proposal, setProposal] = useState<DocumentPackageShareProposalDto | null>(initialProposals.find((item) => item.status === "READY_FOR_REVIEW" || item.status === "BLOCKED") ?? null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sharePath = createdToken ? buildSharedDocumentPackagePath(createdToken) : null;
  const groups = useMemo(() => {
    if (!proposal) return null;
    const items = proposal.revision.items;
    return {
      included: items.filter((item) => item.included),
      excluded: items.filter((item) => !item.included),
      blocking: proposal.revision.issues.filter((item) => item.severity === "BLOCKING"),
      attention: proposal.revision.issues.filter((item) => item.severity === "ATTENTION"),
    };
  }, [proposal]);

  async function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setCreatedToken(null);
    try {
      const next = await postJson<DocumentPackageShareProposalDto>(`/api/document-packages/${packageId}/share-proposals`, {
        targetKind,
        ...(targetKind === "NAMED_RECIPIENT" ? { recipientLabel, purpose: purpose || null } : { purpose }),
        expiresAt: new Date(expiresAt).toISOString(),
        allowDownload,
      });
      setProposal(next);
    } catch (prepareError) {
      setError(prepareError instanceof Error ? prepareError.message : "Preparazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  async function confirm() {
    if (!proposal) return;
    setPending(true);
    setError(null);
    try {
      const response = await postJson<ConfirmDocumentPackageShareProposalResponse>(`/api/document-packages/${packageId}/share-proposals/${proposal.id}/confirm`, { confirmation: "APPROVE_AND_CREATE", fingerprint: proposal.revision.fingerprint });
      setProposal(response.proposal);
      setCreatedToken(response.token);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Conferma non riuscita.");
    } finally {
      setPending(false);
    }
  }

  async function copyLink() {
    if (!sharePath || !navigator.clipboard) return;
    await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`);
  }

  return (
    <div className="grid gap-5">
      {error ? <Alert variant="destructive"><IconAlertTriangle /><AlertTitle>Condivisione non disponibile</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {!proposal || proposal.status === "PUBLISHED" ? (
        <form className="grid gap-4" onSubmit={prepare}>
          <Field><FieldLabel htmlFor="share-target-kind">Destinazione</FieldLabel><select className="h-9 rounded-lg border bg-background px-3 text-sm" id="share-target-kind" onChange={(event) => setTargetKind(event.target.value as typeof targetKind)} value={targetKind}><option value="NAMED_RECIPIENT">Destinatario nominativo</option><option value="LINK_PURPOSE">Finalità del link</option></select></Field>
          {targetKind === "NAMED_RECIPIENT" ? <Field><FieldLabel htmlFor="share-recipient">Destinatario</FieldLabel><Input id="share-recipient" maxLength={160} onChange={(event) => setRecipientLabel(event.target.value)} required value={recipientLabel} /></Field> : null}
          <Field><FieldLabel htmlFor="share-purpose">Finalità{targetKind === "NAMED_RECIPIENT" ? " (facoltativa)" : ""}</FieldLabel><Input id="share-purpose" maxLength={500} onChange={(event) => setPurpose(event.target.value)} required={targetKind === "LINK_PURPOSE"} value={purpose} /></Field>
          <Field><FieldLabel htmlFor="share-expiry">Scadenza obbligatoria</FieldLabel><Input id="share-expiry" onChange={(event) => setExpiresAt(event.target.value)} required type="datetime-local" value={expiresAt} /></Field>
          <Field orientation="horizontal"><Checkbox checked={allowDownload} id="share-download" onCheckedChange={(checked) => setAllowDownload(checked === true)} /><div><FieldLabel htmlFor="share-download">Consenti download</FieldLabel><FieldDescription>Disattivato per impostazione predefinita. L’apertura resta in sola consultazione.</FieldDescription></div></Field>
          <Button disabled={pending} type="submit">{pending ? <><Spinner /> Preparazione</> : "Prepara revisione"}</Button>
        </form>
      ) : null}
      {proposal && proposal.status !== "PUBLISHED" && groups ? (
        <Card><CardHeader><CardTitle>Review completa</CardTitle><CardDescription>Revisione {proposal.revision.revisionNumber} · fingerprint {proposal.revision.fingerprint.slice(0, 12)}…</CardDescription></CardHeader><CardContent className="grid gap-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Target / finalità</dt><dd className="font-medium">{proposal.recipientLabel ?? proposal.purpose}</dd></div><div><dt className="text-muted-foreground">Scadenza</dt><dd className="font-medium">{new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(proposal.expiresAt))}</dd></div><div><dt className="text-muted-foreground">Download</dt><dd className="font-medium">{proposal.allowDownload ? "Consentito" : "Non consentito"}</dd></div><div><dt className="text-muted-foreground">Stato</dt><dd><Badge variant={proposal.status === "BLOCKED" ? "destructive" : "warning"}>{proposal.status.replace(/_/g, " ")}</Badge></dd></div></dl>
          <section><h3 className="text-sm font-medium">Inclusi ({groups.included.length})</h3><ul className="mt-2 grid gap-2">{groups.included.map((item) => <li className="rounded-lg border p-3 text-sm" key={item.id}><strong>{item.title ?? item.itemType}</strong><span className="block text-xs text-muted-foreground">{item.status ?? "Riferimento verificato"}{item.hasFile ? " · file disponibile" : ""}</span></li>)}</ul></section>
          {groups.excluded.length ? <section><h3 className="text-sm font-medium">Esclusi ({groups.excluded.length})</h3><ul className="mt-2 grid gap-2">{groups.excluded.map((item) => <li className="rounded-lg border border-destructive/30 p-3 text-sm" key={item.id}><strong>{item.title ?? item.itemType}</strong><span className="block text-xs text-muted-foreground">{item.exclusionReason}</span></li>)}</ul></section> : null}
          {proposal.revision.issues.length ? <section><h3 className="text-sm font-medium">Mancanti, scaduti o da verificare</h3><ul className="mt-2 grid gap-2">{proposal.revision.issues.map((issue, index) => <li className="flex gap-2 rounded-lg border p-3 text-sm" key={`${issue.code}:${issue.sourceItemId}:${index}`}><IconAlertTriangle className="mt-0.5 size-4 shrink-0" /><div><strong>{issue.title}</strong><span className="block text-xs text-muted-foreground">{issue.severity === "BLOCKING" ? "Bloccante" : "Richiede attenzione"}</span></div></li>)}</ul></section> : null}
          <Alert><IconLock /><AlertTitle>Conferma umana obbligatoria</AlertTitle><AlertDescription>Qoovex non pubblica automaticamente. Una modifica successiva richiederà una nuova revisione.</AlertDescription></Alert>
          <Button disabled={pending || !proposal.canConfirm || groups.blocking.length > 0} onClick={confirm} type="button">{pending ? <><Spinner /> Conferma</> : <><IconCheck /> Approva e crea link</>}</Button>
        </CardContent></Card>
      ) : null}
      {sharePath ? <Alert variant="success"><IconExternalLink /><AlertTitle>Link creato: copialo ora</AlertTitle><AlertDescription className="grid gap-3"><code className="overflow-x-auto rounded bg-muted px-2 py-1 text-xs">{sharePath}</code><Button className="w-fit" onClick={copyLink} size="sm" variant="outline"><IconClipboard /> Copia link</Button><span>Per sicurezza il token non verrà mostrato di nuovo.</span></AlertDescription></Alert> : null}
    </div>
  );
}
