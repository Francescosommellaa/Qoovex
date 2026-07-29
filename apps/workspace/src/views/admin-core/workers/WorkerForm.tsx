"use client";

import { IconAlertTriangle, IconCheck, IconMail } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { DialogFooter } from "@qoovex/ui/components/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Textarea } from "@qoovex/ui/components/textarea";
import type { OrganizationRole } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import type { WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import { workerDetailsHref } from "@shared/lib/worker-routes";
import { buildWorkerCollaboratorInvitation, type WorkerCollaboratorInvitation } from "./worker-collaborator-invitation";

export type WorkerAccessRole = Exclude<OrganizationRole, "OWNER">;

const accessRoleOptions: Array<{
  value: WorkerAccessRole;
  label: string;
  description: string;
}> = [
  { value: "COLLABORATOR", label: "Invita come collaboratore", description: "Riceve accesso limitato e, dopo l'accettazione, associa questo profilo al suo account." },
];

interface WorkerFormProps {
  mode: "create" | "update";
  worker?: WorkspaceWorkerRecord;
  disabled?: boolean;
  invitableRoles?: WorkerAccessRole[];
  layout?: "page" | "dialog";
  onCreated?: (worker: WorkspaceWorkerRecord) => void;
}

interface PendingInvitation {
  payload: WorkerCollaboratorInvitation;
}

export function WorkerForm({
  mode,
  worker,
  disabled,
  invitableRoles = [],
  layout = "page",
  onCreated,
}: WorkerFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdWorker, setCreatedWorker] = useState<WorkspaceWorkerRecord | null>(null);
  const [pendingInvitation, setPendingInvitation] = useState<PendingInvitation | null>(null);
  const visibleAccessRoles = accessRoleOptions.filter((option) => invitableRoles.includes(option.value));

  function completeCreation(created: WorkspaceWorkerRecord) {
    router.refresh();
    if (onCreated) onCreated(created);
    else router.push(workerDetailsHref(created));
  }

  async function sendInvitation(invitation: PendingInvitation) {
    await submitJson("/api/organization/invitations", "POST", invitation.payload);
  }

  async function retryInvitation() {
    if (!createdWorker || !pendingInvitation) return;
    setPending(true);
    setError(null);
    try {
      await sendInvitation(pendingInvitation);
      completeCreation(createdWorker);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invito non riuscito.");
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const email = nullableFormValue(formData, "email");
    const accessRole = formValue(formData, "accessRole") as WorkerAccessRole | undefined;
    const payload = {
      displayName: formValue(formData, "displayName"),
      email,
      phone: nullableFormValue(formData, "phone"),
      roleLabel: nullableFormValue(formData, "roleLabel"),
      notes: nullableFormValue(formData, "notes"),
    };

    if (mode === "create" && accessRole && !email) {
      setError("Inserisci l'email per inviare l'accesso a Qoovex.");
      setPending(false);
      return;
    }

    try {
      const response = await submitJson<WorkspaceWorkerRecord>(
        mode === "create" ? "/api/workers" : `/api/workers/${worker?.id}`,
        mode === "create" ? "POST" : "PATCH",
        payload,
      );

      if (mode === "create" && accessRole && email) {
        const invitation = { payload: buildWorkerCollaboratorInvitation(email, response.id) };
        try {
          await sendInvitation(invitation);
        } catch (cause) {
          setCreatedWorker(response);
          setPendingInvitation(invitation);
          setError(cause instanceof Error ? cause.message : "Invito non riuscito.");
          return;
        }
      }

      if (mode === "create") completeCreation(response);
      else router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Operazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  if (createdWorker && pendingInvitation) {
    const recoveryActions = (
      <>
        <Button disabled={pending} onClick={() => completeCreation(createdWorker)} type="button" variant="outline">
          Continua senza invito
        </Button>
        <Button disabled={pending} onClick={() => void retryInvitation()} type="button">
          <IconMail aria-hidden="true" />
          {pending ? "Invio..." : "Riprova invito"}
        </Button>
      </>
    );

    return (
      <div className="grid gap-4">
        <Alert variant="warning">
          <IconAlertTriangle aria-hidden="true" />
          <AlertTitle>Profilo aggiunto, invito non inviato</AlertTitle>
          <AlertDescription>{error || "Puoi riprovare senza creare un secondo lavoratore."}</AlertDescription>
        </Alert>
        {layout === "dialog" ? <DialogFooter>{recoveryActions}</DialogFooter> : <div className="flex flex-wrap justify-end gap-2">{recoveryActions}</div>}
      </div>
    );
  }

  const submitButton = (
    <Button className="w-full sm:w-auto" disabled={disabled || pending} type="submit">
      {mode === "create" ? <IconCheck aria-hidden="true" /> : null}
      {pending ? "Salvataggio..." : mode === "create" ? "Aggiungi lavoratore" : "Aggiorna lavoratore"}
    </Button>
  );

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      {error ? <FieldError>{error}</FieldError> : null}

      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${mode}-worker-name`}>Nome e cognome</FieldLabel>
            <Input autoFocus defaultValue={worker?.displayName ?? ""} disabled={disabled || pending} id={`${mode}-worker-name`} maxLength={160} minLength={2} name="displayName" required />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${mode}-worker-role-label`}>Mansione</FieldLabel>
            <Input defaultValue={worker?.roleLabel ?? ""} disabled={disabled || pending} id={`${mode}-worker-role-label`} maxLength={120} name="roleLabel" placeholder="es. Elettricista" />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${mode}-worker-email`}>Email</FieldLabel>
            <Input autoComplete="email" defaultValue={worker?.email ?? ""} disabled={disabled || pending} id={`${mode}-worker-email`} name="email" type="email" />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${mode}-worker-phone`}>Telefono</FieldLabel>
            <Input autoComplete="tel" defaultValue={worker?.phone ?? ""} disabled={disabled || pending} id={`${mode}-worker-phone`} maxLength={80} name="phone" type="tel" />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor={`${mode}-worker-notes`}>Note operative</FieldLabel>
          <Textarea defaultValue={worker?.notes ?? ""} disabled={disabled || pending} id={`${mode}-worker-notes`} maxLength={4000} name="notes" rows={3} />
        </Field>

        {mode === "create" && visibleAccessRoles.length ? (
          <FieldSet>
            <FieldLegend>Accesso a Qoovex</FieldLegend>
            <FieldDescription>Da questa scheda puoi invitare un Collaboratore e collegarlo a questo profilo operativo. Gli altri collaboratori si gestiscono da Accessi.</FieldDescription>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-checked:border-primary/40 has-checked:bg-primary/5 hover:bg-muted/60">
                <input className="mt-0.5 size-4 accent-primary" defaultChecked name="accessRole" type="radio" value="" />
                <span className="min-w-0"><strong className="block text-sm font-medium">Solo profilo operativo</strong><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Nessun invito o accesso alla piattaforma.</span></span>
              </label>
              {visibleAccessRoles.map((option) => (
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-checked:border-primary/40 has-checked:bg-primary/5 hover:bg-muted/60" key={option.value}>
                  <input className="mt-0.5 size-4 accent-primary" name="accessRole" type="radio" value={option.value} />
                  <span className="min-w-0"><strong className="block text-sm font-medium">{option.label}</strong><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{option.description}</span></span>
                </label>
              ))}
            </div>
          </FieldSet>
        ) : null}
      </FieldGroup>

      {layout === "dialog" ? <DialogFooter>{submitButton}</DialogFooter> : <div className="flex justify-end">{submitButton}</div>}
    </form>
  );
}
