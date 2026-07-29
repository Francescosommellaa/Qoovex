"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  IconAlertTriangle,
  IconCheck,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@qoovex/ui/components/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@qoovex/ui/components/empty";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@qoovex/ui/components/select";
import { Skeleton } from "@qoovex/ui/components/skeleton";
import { Spinner } from "@qoovex/ui/components/spinner";
import type { DashboardContextKind, OrganizationAccessPreset, OrganizationPermission } from "@qoovex/types";

interface AssignmentOptions {
  users: Array<{ id: string; label: string; email: string; role: "COLLABORATOR"; preset: OrganizationAccessPreset | null; permissionKeys: OrganizationPermission[] }>;
}

interface WorkerUserLink {
  userId: string;
}

interface DashboardAssignmentDialogProps {
  contextId: string;
  contextKind: Extract<DashboardContextKind, "WORKER" | "JOB_SITE">;
  contextLabel: string;
  excludedUserIds?: string[];
  primaryAction?: boolean;
  responsibilityLabel: string;
  triggerLabel?: string;
}

async function responseError(response: Response) {
  const payload = await response.json().catch(() => null) as { message?: string } | null;
  return payload?.message ?? "Operazione non disponibile. Riprova.";
}

export function DashboardAssignmentDialog({
  contextId,
  contextKind,
  contextLabel,
  excludedUserIds = [],
  primaryAction = false,
  responsibilityLabel,
  triggerLabel = "Assegna",
}: DashboardAssignmentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<AssignmentOptions | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const excludedUsers = new Set(excludedUserIds);
  const assignees = options?.users.filter((user) => user.role === "COLLABORATOR" && (contextKind === "WORKER" ? user.preset === "LIMITED_UPLOAD" : user.permissionKeys.includes("jobSites:read")) && !excludedUsers.has(user.id)) ?? [];
  const personLabel = contextKind === "WORKER" ? "Collaboratore collegato" : "Collaboratore del cantiere";
  const dialogTitle = contextKind === "JOB_SITE" ? "Assegna un collaboratore al cantiere" : "Collega un collaboratore";
  const completionTitle = contextKind === "JOB_SITE" ? "Collaboratore assegnato" : "Collaboratore collegato";

  async function loadOptions() {
    setLoading(true);
    setError(null);
    try {
      const [optionsResponse, workerLinksResponse] = await Promise.all([
        fetch("/api/resource-assignments/options", { cache: "no-store" }),
        contextKind === "WORKER"
          ? fetch("/api/resource-assignments/worker-user-links", { cache: "no-store" })
          : Promise.resolve(null),
      ]);
      if (!optionsResponse.ok) throw new Error(await responseError(optionsResponse));
      if (workerLinksResponse && !workerLinksResponse.ok) {
        throw new Error(await responseError(workerLinksResponse));
      }

      const nextOptions = await optionsResponse.json() as AssignmentOptions;
      const workerLinks = workerLinksResponse
        ? await workerLinksResponse.json() as WorkerUserLink[]
        : [];
      const unavailableWorkerUsers = new Set(workerLinks.map((link) => link.userId));
      setOptions({
        ...nextOptions,
        users: contextKind === "WORKER"
          ? nextOptions.users.filter((user) => !unavailableWorkerUsers.has(user.id))
          : nextOptions.users,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Non riusciamo a caricare le persone disponibili.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && !options && !loading) void loadOptions();
    if (!nextOpen) {
      setError(null);
      setCompleted(false);
      setSelectedUserId(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;
    setSubmitting(true);
    setError(null);
    const endpoint = contextKind === "WORKER"
      ? "/api/resource-assignments/worker-user-links"
      : "/api/resource-assignments/job-site-user-assignments";
    const payload = contextKind === "WORKER"
      ? { workerId: contextId, userId: selectedUserId }
      : { jobSiteId: contextId, userId: selectedUserId };
    try {
      const response = await fetch(endpoint, {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) throw new Error(await responseError(response));
      setCompleted(true);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Assegnazione non riuscita.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger render={<Button size="sm" variant={primaryAction ? "default" : "outline"} />}>{triggerLabel}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {contextKind === "JOB_SITE" ? "Scegli chi avrà l'incarico operativo su " : "Scegli l'account da collegare a "}
            <strong className="font-medium text-foreground">{contextLabel}</strong>.
          </DialogDescription>
        </DialogHeader>

        {completed ? (
          <Alert role="status" variant="success">
            <IconCheck />
            <AlertTitle>{completionTitle}</AlertTitle>
            <AlertDescription>La coda viene aggiornata con il nuovo collaboratore.</AlertDescription>
          </Alert>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={submit}>
            <div className="rounded-lg bg-muted/60 p-3 text-sm">
              <span className="block text-xs font-medium text-muted-foreground">Responsabilità attuale</span>
              <span className="mt-1 block font-medium">{responsibilityLabel}</span>
            </div>

            {loading && !options ? (
              <div aria-label="Caricamento collaboratori" className="flex flex-col gap-2" role="status">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : null}

            {error ? (
              <Alert variant="destructive">
                <IconAlertTriangle />
                <AlertTitle>Assegnazione non disponibile</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {options && assignees.length === 0 ? (
              <Empty className="min-h-48 border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><IconUsers /></EmptyMedia>
                  <EmptyTitle>Nessuna persona disponibile</EmptyTitle>
                  <EmptyDescription>Invita un Collaboratore con il profilo di accesso richiesto prima di assegnarlo.</EmptyDescription>
                </EmptyHeader>
                <Link className={buttonVariants({ size: "sm", variant: "outline" })} data-link="plain" href="/settings/people">Gestisci persone</Link>
              </Empty>
            ) : null}

            {options && assignees.length > 0 ? (
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`responsible-${contextKind.toLowerCase()}-${contextId}`}>{personLabel}</FieldLabel>
                  <Select
                    items={assignees.map((user) => ({ label: `${user.label} · ${user.email}`, value: user.id }))}
                    onValueChange={(value) => setSelectedUserId(value)}
                    value={selectedUserId}
                  >
                    <SelectTrigger className="w-full" id={`responsible-${contextKind.toLowerCase()}-${contextId}`}>
                      <SelectValue placeholder="Seleziona una persona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {assignees.map((user) => <SelectItem key={user.id} value={user.id}>{user.label} · {user.email}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>L’accesso ai dati resta limitato dai permessi e dal contesto assegnato.</FieldDescription>
                </Field>
              </FieldGroup>
            ) : null}

            {!options && error ? <Button onClick={() => void loadOptions()} type="button" variant="outline">Riprova</Button> : null}

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Annulla</DialogClose>
              <Button disabled={!selectedUserId || submitting || !assignees.length} type="submit">
                {submitting ? <><Spinner /> Assegnazione…</> : <><IconUserCheck data-icon="inline-start" />{contextKind === "JOB_SITE" ? "Assegna collaboratore" : "Collega collaboratore"}</>}
              </Button>
            </DialogFooter>
          </form>
        )}

        {completed ? (
          <DialogFooter>
            <Link className={buttonVariants({ variant: "outline" })} data-link="plain" href="/access?from=dashboard">Gestisci assegnazioni</Link>
            <DialogClose render={<Button />}>Chiudi</DialogClose>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
