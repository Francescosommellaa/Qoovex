"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArrowLeft, IconArrowRight, IconCheck, IconMail } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardContent } from "@qoovex/ui/components/card";
import { Field, FieldError, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import type { OrganizationRole } from "@qoovex/types";
import { submitJson } from "@/views/admin-core/admin-api-client";
import { WorkspacePage, WorkspacePageHeader } from "@/views/workspace/WorkspacePrimitives";

type InviteRole = Exclude<OrganizationRole, "OWNER" | "WORKER">;
const options: Array<{ value: InviteRole; label: string; description: string }> = [
  { value: "ADMIN", label: "Amministratore", description: "Gestisce l'azienda e il lavoro quotidiano." },
  { value: "SAFETY_CONSULTANT", label: "Consulente sicurezza", description: "Collabora su documenti, controlli e pacchetti." },
  { value: "SITE_MANAGER", label: "Responsabile cantiere", description: "Vedra solo i cantieri assegnati dopo l'accettazione." },
];

export function InvitePersonView({ invitableRoles }: { invitableRoles: InviteRole[] }) {
  const router = useRouter();
  const visible = options.filter((item) => invitableRoles.includes(item.value));
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole | null>(visible[0]?.value ?? null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = visible.find((item) => item.value === role);

  function next() {
    setError(null);
    if (step === 0 && !email.includes("@")) return setError("Inserisci una email valida.");
    if (step === 1 && !role) return setError("Seleziona il ruolo.");
    setStep((current) => Math.min(2, current + 1));
  }
  async function invite() {
    if (!role) return;
    setPending(true); setError(null);
    try { await submitJson("/api/organization/invitations", "POST", { email, role }); router.push("/people/access?result=invitation-sent"); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Invito non riuscito."); setPending(false); }
  }

  return <WorkspacePage><WorkspacePageHeader title="Invita una persona" description="Crea un accesso a Qoovex. I lavoratori si invitano esclusivamente dal loro profilo operativo." action={<Link className={buttonVariants({ variant: "outline" })} data-link="plain" href="/people/access">Annulla</Link>} /><Card><CardContent className="mx-auto grid max-w-2xl gap-5"><ol className="grid grid-cols-3 gap-2">{["Email", "Ruolo", "Conferma"].map((label, index) => <li key={label}><div className={`h-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} /><p className="mt-2 text-xs text-muted-foreground">{index + 1}. {label}</p></li>)}</ol>{error ? <FieldError>{error}</FieldError> : null}{step === 0 ? <Field><FieldLabel htmlFor="people-invite-email">Email</FieldLabel><Input autoComplete="email" autoFocus id="people-invite-email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></Field> : null}{step === 1 ? <div className="grid gap-3">{visible.map((option) => <button className={`rounded-xl border p-4 text-left transition-colors ${role === option.value ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40"}`} key={option.value} onClick={() => setRole(option.value)} type="button"><strong className="block text-sm">{option.label}</strong><span className="mt-1 block text-sm text-muted-foreground">{option.description}</span></button>)}</div> : null}{step === 2 ? <div className="grid gap-4"><dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Email</dt><dd className="mt-1 text-sm font-medium">{email}</dd></div><div><dt className="text-xs text-muted-foreground">Ruolo</dt><dd className="mt-1 text-sm font-medium">{selected?.label}</dd></div></dl>{role === "SITE_MANAGER" ? <Alert><IconMail aria-hidden="true" /><AlertTitle>Assegnazione cantieri dopo l'accettazione</AlertTitle><AlertDescription>Per mantenere un unico flusso affidabile, Qoovex inviera prima l'invito. L'area Accessi segnalera la configurazione incompleta e guidera l'assegnazione dei cantieri.</AlertDescription></Alert> : null}</div> : null}<div className="flex flex-col-reverse justify-between gap-2 border-t pt-4 sm:flex-row"><Button disabled={pending || step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} type="button" variant="outline"><IconArrowLeft aria-hidden="true" />Indietro</Button>{step < 2 ? <Button disabled={pending || !visible.length} onClick={next} type="button">Continua<IconArrowRight aria-hidden="true" /></Button> : <Button disabled={pending || !role} onClick={() => void invite()} type="button"><IconCheck aria-hidden="true" />{pending ? "Invio..." : "Invia invito"}</Button>}</div></CardContent></Card></WorkspacePage>;
}
