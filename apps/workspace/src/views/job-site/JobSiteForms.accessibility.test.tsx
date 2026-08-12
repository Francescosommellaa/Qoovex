import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentType, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  AgreementForm,
  AttachmentForm,
  AuthorityGrantForm,
  CollaboratorInviteForm,
  CreateJobSiteForm,
  DisputeForm,
  InviteClientForm,
  LegalHoldForm,
  LinkPropertyForm,
  ParticipantForm,
  PaymentDeclarationForm,
  PaymentProfileForm,
  PaymentRequestForm,
  PaymentReviewForm,
  PostClosureForm,
  PropertyForm,
  ProposalCounterForm,
  ProposalForm,
  RecordTransitionForm,
  ReopeningForm,
  RequestForm,
  StepForm,
  TimelineForm,
} from "./JobSiteForms";
import { JobSiteSearch } from "./JobSiteSearch";
import { NotificationPreferencesForm } from "./NotificationPreferencesForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

function OperationalFormsFixture() {
  const endpoint = "/api/test";
  return <>
    <CreateJobSiteForm organizationId="org-1" />
    <TimelineForm endpoint={endpoint} revision={1} />
    <TimelineForm client endpoint={endpoint} revision={1} />
    <InviteClientForm endpoint={endpoint} revision={1} />
    <AgreementForm address={null} description={null} endpoint={endpoint} name="Cantiere" participants={[]} revision={1} />
    <StepForm endpoint={endpoint} revision={1} />
    <ProposalForm endpoint={endpoint} revision={1} side="ORGANIZATION_MEMBER" />
    <DisputeForm endpoint={endpoint} revision={1} />
    <RequestForm endpoint={endpoint} revision={1} />
    <AttachmentForm endpoint={endpoint} revision={1} />
    <AttachmentForm client endpoint={endpoint} relatedTargets={[{ category: "REQUEST", id: "request-1", label: "Richiesta" }]} revision={1} />
    <PropertyForm />
    <LinkPropertyForm jobSites={[{ id: "job-site-1", label: "Cantiere" }]} propertyId="property-1" />
    <PaymentProfileForm endpoint={endpoint} revision={1} />
    <PostClosureForm endpoint={endpoint} revision={1} />
    <ReopeningForm endpoint={endpoint} revision={1} />
    <CollaboratorInviteForm endpoint={endpoint} />
    <ParticipantForm endpoint={endpoint} memberships={[{ id: "membership-1", label: "Mario Rossi" }]} />
    <PaymentRequestForm endpoint={endpoint} paymentProfileId="profile-1" revision={1} />
    <PaymentDeclarationForm amountMinor="10000" endpoint={endpoint} paymentRequestId="payment-1" receiptAttachments={[{ id: "attachment-1", label: "Ricevuta" }]} revision={1} />
    <PaymentReviewForm endpoint={endpoint} paymentRequestId="payment-1" revision={1} />
    <AuthorityGrantForm endpoint={endpoint} participants={[{ id: "participant-1", label: "Mario Rossi" }]} revision={1} />
    <RecordTransitionForm actions={[{ label: "Conferma", value: "CONFIRM" }]} endpoint={endpoint} revision={1} />
    <ProposalCounterForm currentVersion={1} endpoint={endpoint} revision={1} />
    <LegalHoldForm endpoint={endpoint} />
    <JobSiteSearch endpoint={endpoint} />
    <NotificationPreferencesForm organizations={[{ id: "organization-1", name: "Edilizia Rossi" }]} />
  </>;
}

function attribute(attributes: string, name: string) {
  return attributes.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1] ?? null;
}

function controlAttributes(html: string, name: string) {
  const match = [...html.matchAll(/<(button|input|select|span|textarea)\b([^>]*)>/g)]
    .find(([, , attributes]) => attribute(attributes, "name") === name);
  return match?.[2] ?? "";
}

function fieldControlAttributes(html: string, name: string) {
  const match = [...html.matchAll(/<(button|input|select|span|textarea)\b([^>]*)>/g)]
    .find(([, , attributes]) => attribute(attributes, "data-field-name") === name);
  return match?.[2] ?? controlAttributes(html, name);
}

describe("accessibilità dei form operativi del cantiere", () => {
  it("associa una label visibile e un id univoco a ogni controllo", () => {
    const html = renderToStaticMarkup(<OperationalFormsFixture />);
    const customControlNames = new Set([...html.matchAll(/<(button|input|select|span|textarea)\b([^>]*)>/g)]
      .map(([, , attributes]) => attribute(attributes, "data-field-name"))
      .filter((name): name is string => Boolean(name)));
    const controls = [...html.matchAll(/<(button|input|select|span|textarea)\b([^>]*)>/g)]
      .filter(([, , attributes]) => {
        const name = attribute(attributes, "name");
        const customName = attribute(attributes, "data-field-name");
        return attribute(attributes, "type") !== "hidden" && Boolean(customName || (name && !customControlNames.has(name)));
      })
      .map(([, tag, attributes]) => ({
        id: attribute(attributes, "id"),
        labelledBy: attribute(attributes, "aria-labelledby"),
        name: attribute(attributes, "data-field-name") ?? attribute(attributes, "name"),
        tag,
      }));
    const labelTargets = new Set([...html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)].map((match) => match[1]));
    const ids = controls.map((control) => control.id).filter((id): id is string => id !== null);

    expect(controls.length).toBeGreaterThan(0);
    expect(controls.filter((control) => !((control.id && labelTargets.has(control.id)) || (control.labelledBy && html.includes(`id="${control.labelledBy}"`)))), "controlli senza label associata").toEqual([]);
    expect(new Set(ids).size, "gli id dei controlli devono essere univoci").toBe(ids.length);
  });

  it("rende gli errori locali per input, textarea, select, checkbox e file input", async () => {
    const jobSiteForms = await import("./JobSiteForms") as unknown as Record<string, unknown>;
    const ErrorProvider = jobSiteForms.FormErrorProvider as ComponentType<{ children: ReactNode; fieldErrors: Record<string, string[]> }> | undefined;
    const TestInputField = jobSiteForms.InputField as ComponentType<Record<string, unknown>> | undefined;
    const TestTextareaField = jobSiteForms.TextareaField as ComponentType<Record<string, unknown>> | undefined;
    const TestSelectField = jobSiteForms.SelectField as ComponentType<Record<string, unknown>> | undefined;
    const TestCheckboxGroupField = jobSiteForms.CheckboxGroupField as ComponentType<Record<string, unknown>> | undefined;

    expect(ErrorProvider).toBeTypeOf("function");
    expect(TestInputField).toBeTypeOf("function");
    expect(TestTextareaField).toBeTypeOf("function");
    expect(TestSelectField).toBeTypeOf("function");
    expect(TestCheckboxGroupField).toBeTypeOf("function");
    if (!ErrorProvider || !TestInputField || !TestTextareaField || !TestSelectField || !TestCheckboxGroupField) return;

    const html = renderToStaticMarkup(
      <ErrorProvider fieldErrors={{
        capabilities: ["Seleziona almeno un permesso economico."],
        file: ["Scegli un file valido."],
        reason: ["Inserisci una motivazione valida."],
        title: ["Inserisci un titolo valido."],
        type: ["Seleziona un tipo di richiesta valido."],
      }}>
        <TestInputField label="Titolo" name="title" />
        <TestTextareaField description="Spiega la scelta." label="Motivazione" name="reason" />
        <TestSelectField label="Tipo" name="type" options={[{ label: "Chiarimento", value: "CLARIFICATION" }]} />
        <TestCheckboxGroupField description="Scegli i permessi da concedere." legend="Permessi" name="capabilities" options={[{ label: "Negoziare", value: "COMMERCIAL_NEGOTIATE" }]} />
        <TestInputField label="File" name="file" type="file" />
      </ErrorProvider>,
    );

    const errorIds: string[] = [];
    for (const name of ["title", "reason", "type", "capabilities", "file"]) {
      const attributes = fieldControlAttributes(html, name);
      const describedBy = attribute(attributes, "aria-describedby");
      expect(attribute(attributes, "aria-invalid"), `${name} deve essere invalido`).toBe("true");
      expect(describedBy, `${name} deve descrivere l'errore`).toBeTruthy();
      const describedIds = describedBy?.split(" ") ?? [];
      expect(describedIds.some((id) => id.endsWith("-error")), `${name} deve includere l'errore`).toBe(true);
      errorIds.push(...describedIds.filter((id) => id.endsWith("-error")));
      for (const id of describedIds) expect(html, `${name} deve puntare a contenuto esistente`).toContain(`id="${id}"`);
    }
    expect(html.match(/role="alert"/g)).toHaveLength(5);
    expect(new Set(errorIds).size).toBe(5);
  });

  it("compone select e checkbox canonici, con copy umano e stato file comprensibile", async () => {
    const jobSiteForms = await import("./JobSiteForms") as unknown as Record<string, unknown>;
    const selectedFileDescription = jobSiteForms.selectedFileDescription as ((fileName: string | null) => string) | undefined;
    expect(selectedFileDescription).toBeTypeOf("function");
    if (!selectedFileDescription) return;

    const html = renderToStaticMarkup(<OperationalFormsFixture />);
    expect(html).not.toMatch(/<select\b/);
    expect(html.match(/data-slot="select-trigger"/g)?.length).toBeGreaterThanOrEqual(14);
    expect(html.match(/data-slot="checkbox"/g)?.length).toBe(6);
    expect(html).toContain("PDF, immagini JPG, PNG o WebP e video MP4, WebM o MOV, fino a 4 MB.");
    expect(html).toContain("Nessun file selezionato.");
    expect(selectedFileDescription("capitolato.pdf")).toBe("File selezionato: capitolato.pdf");
    expect(html).toContain("Se selezionata, la chiusura resta sospesa finch");
    expect(html).toContain("Questi permessi autorizzano la persona a compiere le azioni selezionate per il cantiere.");

    for (const technicalValue of ["NO_PRICE_CHANGE", "CLARIFICATION_REQUIRED", "COMMERCIAL_NEGOTIATE"]) {
      expect(html).not.toContain(`>${technicalValue}<`);
    }
  });

  it("propaga disabled ai controlli canonici durante operazioni non disponibili", async () => {
    const jobSiteForms = await import("./JobSiteForms") as unknown as Record<string, unknown>;
    const TestInputField = jobSiteForms.InputField as ComponentType<Record<string, unknown>> | undefined;
    const TestSelectField = jobSiteForms.SelectField as ComponentType<Record<string, unknown>> | undefined;
    const TestCheckboxGroupField = jobSiteForms.CheckboxGroupField as ComponentType<Record<string, unknown>> | undefined;
    expect(TestInputField).toBeTypeOf("function");
    expect(TestSelectField).toBeTypeOf("function");
    expect(TestCheckboxGroupField).toBeTypeOf("function");
    if (!TestInputField || !TestSelectField || !TestCheckboxGroupField) return;

    const html = renderToStaticMarkup(<>
      <TestInputField disabled label="File" name="file" type="file" />
      <TestSelectField disabled label="Tipo" name="type" options={[{ label: "Chiarimento", value: "CLARIFICATION" }]} />
      <TestCheckboxGroupField disabled legend="Permessi" name="capabilities" options={[{ label: "Negoziare", value: "COMMERCIAL_NEGOTIATE" }]} />
    </>);

    expect(fieldControlAttributes(html, "file")).toContain("disabled");
    expect(fieldControlAttributes(html, "type")).toContain("disabled");
    expect(fieldControlAttributes(html, "capabilities")).toContain("disabled");
  });

  it("distingue un errore di campo da un errore generale e focalizza solo il primo campo invalido", async () => {
    const jobSiteForms = await import("./JobSiteForms") as unknown as Record<string, unknown>;
    const resolveFailure = jobSiteForms.resolveMutationFailure as ((form: HTMLFormElement | null, failure: { message: string; fieldErrors?: Record<string, string[]> }) => { error: string | null; fieldErrors: Record<string, string[]>; firstFieldName: string | null }) | undefined;
    const focusField = jobSiteForms.focusFormField as ((form: HTMLFormElement | null, name: string | null) => void) | undefined;
    expect(resolveFailure).toBeTypeOf("function");
    expect(focusField).toBeTypeOf("function");
    if (!resolveFailure || !focusField) return;

    const focus = vi.fn();
    const bodyFocus = vi.fn();
    const form = { elements: [{ focus, name: "title" }, { focus: bodyFocus, name: "body" }] } as unknown as HTMLFormElement;
    const fieldFailure = resolveFailure(form, { message: "Controlla i campi indicati.", fieldErrors: { body: ["Too small: expected string"], title: ["Too small: expected string"] } });
    expect(fieldFailure).toEqual({ error: null, fieldErrors: { title: ["Inserisci un titolo valido."], body: ["Inserisci i dettagli richiesti."] }, firstFieldName: "title" });
    focusField(form, fieldFailure.firstFieldName);
    expect(focus).toHaveBeenCalledOnce();
    expect(bodyFocus).not.toHaveBeenCalled();

    const generalFailure = resolveFailure(form, { message: "Operazione non disponibile." });
    expect(generalFailure).toEqual({ error: "Operazione non disponibile.", fieldErrors: {}, firstFieldName: null });
    focus.mockClear();
    focusField(form, generalFailure.firstFieldName);
    expect(focus).not.toHaveBeenCalled();

    const unattributedFailure = resolveFailure(form, { message: "Controlla i campi indicati.", fieldErrors: { payload: ["Invalid input"] } });
    expect(unattributedFailure).toEqual({ error: "Controlla i dati inseriti e riprova.", fieldErrors: {}, firstFieldName: null });
    expect(JSON.stringify(unattributedFailure)).not.toContain("payload");

    const technicalFailure = resolveFailure(form, { message: "expectedRevision non valida." });
    expect(technicalFailure.error).toBe("Non è stato possibile completare l'operazione. Aggiorna la pagina e riprova.");
  });

  it("ha un messaggio umano specifico per ogni nome di campo operativo renderizzato", async () => {
    const jobSiteForms = await import("./JobSiteForms") as unknown as Record<string, unknown>;
    const resolveFailure = jobSiteForms.resolveMutationFailure as ((form: HTMLFormElement | null, failure: { message: string; fieldErrors?: Record<string, string[]> }) => { fieldErrors: Record<string, string[]> }) | undefined;
    expect(resolveFailure).toBeTypeOf("function");
    if (!resolveFailure) return;

    const html = renderToStaticMarkup(<OperationalFormsFixture />);
    const names = [...new Set([...html.matchAll(/<(input|select|textarea)\b([^>]*)>/g)]
      .map(([, , attributes]) => attribute(attributes, "name"))
      .filter((name): name is string => Boolean(name)))];
    const form = { elements: names.map((name) => ({ focus: vi.fn(), name })) } as unknown as HTMLFormElement;
    const fieldErrors = Object.fromEntries(names.map((name) => [name, ["Raw validation error"]]));
    const resolved = resolveFailure(form, { message: "Controlla i campi indicati.", fieldErrors });

    expect(Object.keys(resolved.fieldErrors)).toEqual(names);
    expect(Object.values(resolved.fieldErrors).flat()).not.toContain("Controlla questo campo.");
    expect(JSON.stringify(resolved.fieldErrors)).not.toContain("Raw validation error");
  });
});
