"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconBuilding, IconCheck, IconPlus, IconUser } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Textarea } from "@qoovex/ui/components/textarea";
import type { OrganizationContactResponse, OrganizationProfileResponse, OrganizationSummary } from "@qoovex/types";
import { submitJson } from "@/views/administration/admin-api-client";
import { WorkspacePage, WorkspacePageHeader } from "@/views/workspace/WorkspacePrimitives";

interface ProfileData { organization: OrganizationSummary; profile: OrganizationProfileResponse | null; contacts: OrganizationContactResponse[]; }

export function OrganizationProfileView({ data, canUpdate }: { data: ProfileData; canUpdate: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/organization-profile", "PATCH", {
        legalName: form.get("legalName"), taxCode: form.get("taxCode"), vatNumber: form.get("vatNumber"),
        registeredOfficeAddress: form.get("registeredOfficeAddress"), operatingDescription: form.get("operatingDescription"),
        specializations: String(form.get("specializations") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
      });
      router.refresh();
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Salvataggio non riuscito."); }
    finally { setPending(false); }
  }

  async function addContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/organization-profile/contacts", "POST", { kind: form.get("kind"), name: form.get("name"), email: form.get("email"), phone: form.get("phone"), position: form.get("position"), isPrimary: form.get("isPrimary") === "on" });
      setShowContactForm(false); router.refresh();
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Contatto non creato."); }
    finally { setPending(false); }
  }

  return <WorkspacePage>
    <WorkspacePageHeader title="Profilo azienda" description="Dati operativi e contatti distinti dall’identita tecnica del tenant." />
    {error ? <FieldError>{error}</FieldError> : null}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
      <Card><CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><IconBuilding aria-hidden="true" />Dati aziendali</CardTitle><CardDescription>Le informazioni alimentano requisiti e suggerimenti, mai dichiarazioni automatiche di conformita.</CardDescription><CardAction>{data.profile ? <Badge variant="success"><IconCheck aria-hidden="true" />Configurato</Badge> : <Badge variant="outline">Da completare</Badge>}</CardAction></CardHeader><CardContent><form className="grid gap-5" onSubmit={saveProfile}><FieldGroup className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="profile-legal-name">Ragione sociale</FieldLabel><Input defaultValue={data.profile?.legalName ?? data.organization.name} disabled={!canUpdate || pending} id="profile-legal-name" maxLength={160} name="legalName" /></Field><Field><FieldLabel htmlFor="profile-tax-code">Codice fiscale</FieldLabel><Input defaultValue={data.profile?.taxCode ?? ""} disabled={!canUpdate || pending} id="profile-tax-code" maxLength={32} name="taxCode" /></Field><Field><FieldLabel htmlFor="profile-vat">Partita IVA</FieldLabel><Input defaultValue={data.profile?.vatNumber ?? ""} disabled={!canUpdate || pending} id="profile-vat" maxLength={32} name="vatNumber" /></Field><Field><FieldLabel htmlFor="profile-office">Sede legale</FieldLabel><Input defaultValue={data.profile?.registeredOfficeAddress ?? ""} disabled={!canUpdate || pending} id="profile-office" maxLength={500} name="registeredOfficeAddress" /></Field><Field className="sm:col-span-2"><FieldLabel htmlFor="profile-description">Attivita</FieldLabel><Textarea defaultValue={data.profile?.operatingDescription ?? ""} disabled={!canUpdate || pending} id="profile-description" maxLength={4000} name="operatingDescription" rows={4} /></Field><Field className="sm:col-span-2"><FieldLabel htmlFor="profile-specializations">Specializzazioni</FieldLabel><Input defaultValue={data.profile?.specializations.join(", ") ?? ""} disabled={!canUpdate || pending} id="profile-specializations" name="specializations" /><FieldDescription>Separa le specializzazioni con una virgola.</FieldDescription></Field></FieldGroup>{canUpdate ? <div className="flex justify-end"><Button className="h-11" disabled={pending} type="submit"><IconCheck aria-hidden="true" />{pending ? "Salvataggio..." : "Salva profilo"}</Button></div> : <p className="text-sm text-muted-foreground">Profilo in sola lettura per il ruolo corrente.</p>}</form></CardContent></Card>
      <Card><CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><IconUser aria-hidden="true" />Contatti operativi</CardTitle><CardDescription>Responsabilita tipizzate e contatto primario per area.</CardDescription><CardAction><Badge variant="outline">{data.contacts.length}</Badge></CardAction></CardHeader><CardContent className="grid gap-3">{data.contacts.length ? <ul className="grid gap-2">{data.contacts.map((contact) => <li className="rounded-lg border p-3" key={contact.id}><div className="flex items-start justify-between gap-2"><div><strong className="text-sm">{contact.name}</strong><p className="mt-1 text-xs text-muted-foreground">{contact.position || contact.kind.replace(/_/g, " ")}</p>{contact.email || contact.phone ? <p className="mt-1 text-xs text-muted-foreground">{[contact.email, contact.phone].filter(Boolean).join(" · ")}</p> : null}</div>{contact.isPrimary ? <Badge>Primario</Badge> : null}</div></li>)}</ul> : <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Nessun contatto operativo.</div>}{canUpdate && !showContactForm ? <Button className="h-11" onClick={() => setShowContactForm(true)} type="button" variant="outline"><IconPlus aria-hidden="true" />Aggiungi contatto</Button> : null}{showContactForm ? <form className="grid gap-3 rounded-lg border p-3" onSubmit={addContact}><Field><FieldLabel htmlFor="contact-name">Nome</FieldLabel><Input id="contact-name" maxLength={160} name="name" required /></Field><Field><FieldLabel htmlFor="contact-kind">Tipo</FieldLabel><select className="h-11 rounded-md border bg-background px-3 text-sm" defaultValue="OPERATIONS" id="contact-kind" name="kind"><option value="OPERATIONS">Operazioni</option><option value="DOCUMENTS">Documenti</option><option value="SAFETY">Sicurezza</option><option value="ADMINISTRATION">Amministrazione</option><option value="OTHER">Altro</option></select></Field><Field><FieldLabel htmlFor="contact-position">Responsabilita</FieldLabel><Input id="contact-position" maxLength={160} name="position" /></Field><div className="grid gap-3 sm:grid-cols-2"><Field><FieldLabel htmlFor="contact-email">Email</FieldLabel><Input id="contact-email" maxLength={320} name="email" type="email" /></Field><Field><FieldLabel htmlFor="contact-phone">Telefono</FieldLabel><Input id="contact-phone" maxLength={80} name="phone" type="tel" /></Field></div><label className="flex items-center gap-2 text-sm"><input className="size-4" name="isPrimary" type="checkbox" />Contatto primario</label><div className="flex justify-end gap-2"><Button disabled={pending} onClick={() => setShowContactForm(false)} type="button" variant="ghost">Annulla</Button><Button disabled={pending} type="submit">Salva contatto</Button></div></form> : null}</CardContent></Card>
    </div>
  </WorkspacePage>;
}
