"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconBuilding, IconCheck, IconPlus, IconUser } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Alert, AlertDescription } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Field, FieldDescription, FieldGroup } from "@qoovex/ui/components/field"
import { Label } from "@qoovex/ui/components/label"
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Textarea } from "@qoovex/ui/components/textarea";
import type { OrganizationContactResponse, OrganizationProfileResponse, OrganizationSummary } from "@qoovex/types";
import { submitJson } from "@/views/administration/admin-api-client";
import { WorkspacePage, WorkspacePageHeader } from "@/views/workspace/WorkspacePrimitives";
import { captureRefreshFocus, focusVisibleTarget, updateWithFocusGuard } from "@shared/lib/focus-management";
import { presentOrganizationContactKind } from "@shared/lib/product-state-presentation";

interface ProfileData {
  organization: OrganizationSummary;
  profile: OrganizationProfileResponse | null;
  contacts: OrganizationContactResponse[];
}

type ProfileFormValues = {
  legalName: string;
  taxCode: string;
  vatNumber: string;
  registeredOfficeAddress: string;
  operatingDescription: string;
  specializations: string;
};

const CONTACT_KIND_OPTIONS = [
  { label: "Operazioni", value: "OPERATIONS" },
  { label: "Documenti", value: "DOCUMENTS" },
  { label: "Sicurezza", value: "SAFETY" },
  { label: "Amministrazione", value: "ADMINISTRATION" },
  { label: "Altro", value: "OTHER" },
] as const;

function profileFormValues(organizationName: string, profile: OrganizationProfileResponse | null): ProfileFormValues {
  return {
    legalName: profile?.legalName ?? organizationName,
    taxCode: profile?.taxCode ?? "",
    vatNumber: profile?.vatNumber ?? "",
    registeredOfficeAddress: profile?.registeredOfficeAddress ?? "",
    operatingDescription: profile?.operatingDescription ?? "",
    specializations: profile?.specializations.join(", ") ?? "",
  };
}

export function OrganizationProfileView({ data, canUpdate }: { data: ProfileData; canUpdate: boolean }) {
  const router = useRouter();
  const [profileValues, setProfileValues] = useState(() => profileFormValues(data.organization.name, data.profile));
  const [profilePending, setProfilePending] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [contactPending, setContactPending] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const profileInFlightRef = useRef(false);
  const contactInFlightRef = useRef(false);
  const addContactTriggerRef = useRef<HTMLButtonElement>(null);
  const contactNameRef = useRef<HTMLInputElement>(null);
  const contactFormWasOpenRef = useRef(false);

  useEffect(() => {
    setProfileValues(profileFormValues(data.organization.name, data.profile));
  }, [data.organization.name, data.profile?.updatedAt]);

  useEffect(() => {
    if (showContactForm && contactNameRef.current) {
      focusVisibleTarget(contactNameRef.current);
    } else if (contactFormWasOpenRef.current && addContactTriggerRef.current) {
      focusVisibleTarget(addContactTriggerRef.current);
    }
    contactFormWasOpenRef.current = showContactForm;
  }, [showContactForm]);

  function updateProfileField(field: keyof ProfileFormValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setProfileValues((current) => ({ ...current, [field]: value }));
      setProfileError(null);
      setProfileStatus(null);
    };
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (profileInFlightRef.current) return;
    profileInFlightRef.current = true;
    const focusSnapshot = captureRefreshFocus(document, undefined, { allowOriginOnly: true });
    updateWithFocusGuard(() => setProfilePending(true), { snapshot: focusSnapshot });
    setProfileError(null);
    setProfileStatus(null);
    try {
      const savedProfile = await submitJson<OrganizationProfileResponse>("/api/organization-profile", "PATCH", {
        legalName: profileValues.legalName,
        taxCode: profileValues.taxCode,
        vatNumber: profileValues.vatNumber,
        registeredOfficeAddress: profileValues.registeredOfficeAddress,
        operatingDescription: profileValues.operatingDescription,
        specializations: profileValues.specializations.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setProfileValues(profileFormValues(savedProfile.legalName ?? data.organization.name, savedProfile));
      setProfileStatus("Profilo aziendale aggiornato.");
      router.refresh();
    } catch (submitError) {
      setProfileError(submitError instanceof Error ? submitError.message : "Salvataggio non riuscito.");
    } finally {
      profileInFlightRef.current = false;
      setProfilePending(false);
    }
  }

  async function addContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (contactInFlightRef.current) return;
    contactInFlightRef.current = true;
    const formElement = event.currentTarget;
    const focusSnapshot = captureRefreshFocus(document, undefined, { allowOriginOnly: true });
    updateWithFocusGuard(() => setContactPending(true), { snapshot: focusSnapshot });
    setContactError(null);
    setContactStatus(null);
    const form = new FormData(formElement);
    try {
      await submitJson("/api/organization-profile/contacts", "POST", {
        kind: form.get("kind"),
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        position: form.get("position"),
        isPrimary: form.get("isPrimary") === "on",
      });
      formElement.reset();
      setShowContactForm(false);
      setContactStatus("Contatto aggiunto.");
      router.refresh();
    } catch (submitError) {
      setContactError(submitError instanceof Error ? submitError.message : "Contatto non creato.");
    } finally {
      contactInFlightRef.current = false;
      setContactPending(false);
    }
  }

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Profilo azienda"
        description="Dati operativi e contatti distinti dall’identità tecnica del tenant."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2"><IconBuilding aria-hidden="true" />Dati aziendali</CardTitle>
            <CardDescription>Le informazioni alimentano requisiti e suggerimenti, mai dichiarazioni automatiche di conformità.</CardDescription>
            <CardAction>{data.profile ? <Badge variant="success"><IconCheck aria-hidden="true" />Configurato</Badge> : <Badge variant="outline">Da completare</Badge>}</CardAction>
          </CardHeader>
          <CardContent>
            <form aria-busy={profilePending} className="grid gap-5" onSubmit={saveProfile}>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="profile-legal-name" required>Ragione sociale</Label>
                  <Input autoComplete="organization" disabled={!canUpdate || profilePending} id="profile-legal-name" maxLength={160} minLength={2} name="legalName" onChange={updateProfileField("legalName")} required value={profileValues.legalName} />
                </Field>
                <Field>
                  <Label htmlFor="profile-tax-code">Codice fiscale</Label>
                  <Input disabled={!canUpdate || profilePending} id="profile-tax-code" maxLength={32} name="taxCode" onChange={updateProfileField("taxCode")} value={profileValues.taxCode} />
                </Field>
                <Field>
                  <Label htmlFor="profile-vat">Partita IVA</Label>
                  <Input disabled={!canUpdate || profilePending} id="profile-vat" maxLength={32} name="vatNumber" onChange={updateProfileField("vatNumber")} value={profileValues.vatNumber} />
                </Field>
                <Field>
                  <Label htmlFor="profile-office">Sede legale</Label>
                  <Input autoComplete="street-address" disabled={!canUpdate || profilePending} id="profile-office" maxLength={500} name="registeredOfficeAddress" onChange={updateProfileField("registeredOfficeAddress")} value={profileValues.registeredOfficeAddress} />
                </Field>
                <Field className="sm:col-span-2">
                  <Label htmlFor="profile-description">Attività</Label>
                  <Textarea disabled={!canUpdate || profilePending} id="profile-description" maxLength={4000} name="operatingDescription" onChange={updateProfileField("operatingDescription")} rows={4} value={profileValues.operatingDescription} />
                </Field>
                <Field className="sm:col-span-2">
                  <Label htmlFor="profile-specializations">Specializzazioni</Label>
                  <Input aria-describedby="profile-specializations-description" disabled={!canUpdate || profilePending} id="profile-specializations" name="specializations" onChange={updateProfileField("specializations")} value={profileValues.specializations} />
                  <FieldDescription id="profile-specializations-description">Separa le specializzazioni con una virgola.</FieldDescription>
                </Field>
              </FieldGroup>
              {profileError ? <Alert variant="destructive"><AlertDescription>{profileError}</AlertDescription></Alert> : null}
              {profileStatus ? <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">{profileStatus}</p> : null}
              {canUpdate ? (
                <div className="flex justify-end">
                  <Button className="h-11" disabled={profilePending} type="submit"><IconCheck aria-hidden="true" />{profilePending ? "Salvataggio…" : "Salva profilo"}</Button>
                </div>
              ) : <p className="text-sm text-muted-foreground">Profilo in sola lettura per il ruolo corrente.</p>}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2"><IconUser aria-hidden="true" />Contatti operativi</CardTitle>
            <CardDescription>Responsabilità tipizzate e contatto primario per area.</CardDescription>
            <CardAction><Badge variant="outline">{data.contacts.length}</Badge></CardAction>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.contacts.length ? (
              <ul className="grid gap-2">
                {data.contacts.map((contact) => (
                  <li className="rounded-lg border p-3" key={contact.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-sm">{contact.name}</strong>
                        <p className="mt-1 text-xs text-muted-foreground">{contact.position || presentOrganizationContactKind(contact.kind).label}</p>
                        {contact.email || contact.phone ? <p className="mt-1 text-xs text-muted-foreground">{[contact.email, contact.phone].filter(Boolean).join(" · ")}</p> : null}
                      </div>
                      {contact.isPrimary ? <Badge>Primario</Badge> : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Nessun contatto operativo.</div>}
            {contactError ? <Alert variant="destructive"><AlertDescription>{contactError}</AlertDescription></Alert> : null}
            {contactStatus ? <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">{contactStatus}</p> : null}
            {canUpdate && !showContactForm ? (
              <Button className="h-11" onClick={() => { setContactError(null); setContactStatus(null); setShowContactForm(true); }} ref={addContactTriggerRef} type="button" variant="outline"><IconPlus aria-hidden="true" />Aggiungi contatto</Button>
            ) : null}
            {showContactForm ? (
              <form aria-busy={contactPending} className="grid gap-3 rounded-lg border p-3" onSubmit={addContact}>
                <Field>
                  <Label htmlFor="contact-name" required>Nome</Label>
                  <Input autoComplete="name" disabled={contactPending} id="contact-name" maxLength={160} minLength={2} name="name" ref={contactNameRef} required />
                </Field>
                <Field>
                  <Label htmlFor="contact-kind">Tipo</Label>
                  <Select defaultValue="OPERATIONS" disabled={contactPending} items={CONTACT_KIND_OPTIONS} name="kind">
                    <SelectTrigger className="h-11 w-full" disabled={contactPending} id="contact-kind"><SelectValue /></SelectTrigger>
                    <SelectContent align="start"><SelectGroup>{CONTACT_KIND_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent>
                  </Select>
                </Field>
                <Field>
                  <Label htmlFor="contact-position">Responsabilità</Label>
                  <Input disabled={contactPending} id="contact-position" maxLength={160} name="position" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input autoComplete="email" disabled={contactPending} id="contact-email" maxLength={320} name="email" type="email" />
                  </Field>
                  <Field>
                    <Label htmlFor="contact-phone">Telefono</Label>
                    <Input autoComplete="tel" disabled={contactPending} id="contact-phone" maxLength={80} name="phone" type="tel" />
                  </Field>
                </div>
                <Field>
                  <div className="flex items-center gap-2">
                    <Checkbox aria-describedby="contact-primary-description" disabled={contactPending} id="contact-primary" name="isPrimary" />
                    <Label htmlFor="contact-primary">Contatto primario</Label>
                  </div>
                  <FieldDescription id="contact-primary-description">Identifica questo contatto come riferimento principale dell’Azienda.</FieldDescription>
                </Field>
                <div className="flex justify-end gap-2">
                  <Button disabled={contactPending} onClick={() => { setContactError(null); setShowContactForm(false); }} type="button" variant="ghost">Annulla</Button>
                  <Button disabled={contactPending} type="submit">{contactPending ? "Salvataggio…" : "Salva contatto"}</Button>
                </div>
              </form>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </WorkspacePage>
  );
}
