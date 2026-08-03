"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  IconArrowLeft,
  IconBuilding,
  IconChevronDown,
  IconLink,
  IconLinkOff,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@qoovex/ui/components/avatar";
import { Badge } from "@qoovex/ui/components/badge";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { Field, FieldError, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import type {
  JobSiteUserAssignmentResponse,
  JobSiteWorkerAssignmentResponse,
  WorkerUserLinkResponse,
} from "@qoovex/types";
import { submitJson } from "../admin-api-client";
import { WorkspacePage, WorkspacePageHeader } from "@/views/workspace/WorkspacePrimitives";

interface AssignmentOptions {
  workers: Array<{ id: string; displayName: string; roleLabel?: string | null; status: string }>;
  jobSites: Array<{ id: string; name: string; status: string }>;
  users: Array<{ id: string; label: string; email: string; role: string }>;
}

interface AccessAssignmentsPageViewProps {
  workerUserLinks: WorkerUserLinkResponse[];
  jobSiteUserAssignments: JobSiteUserAssignmentResponse[];
  jobSiteWorkerAssignments: JobSiteWorkerAssignmentResponse[];
  options: AssignmentOptions;
  returnToDashboard?: boolean;
  canManage: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

function initials(value: string) {
  return value
    .trim()
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("it-IT");
}

function resultLabel(count: number, singular: string, plural: string) {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

function AssignmentSelect({ id, label, name, options, placeholder }: { id: string; label: string; name: string; options: SelectOption[]; placeholder: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select items={options} name={name} required>
        <SelectTrigger className="h-10 w-full" id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

function AssignmentArchiveButton({ endpoint, label }: { endpoint: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archive() {
    setPending(true);
    setError(null);
    try {
      await submitJson(endpoint, "DELETE");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Rimozione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      {error ? <FieldError className="max-w-64 sm:text-right">{error}</FieldError> : null}
      <Button aria-label={label} disabled={pending} onClick={archive} size="sm" type="button" variant="outline">
        <IconLinkOff aria-hidden="true" />
        {pending ? "Rimozione..." : "Rimuovi"}
      </Button>
    </div>
  );
}

function WorkerUserLinkForm({ options }: { options: AssignmentOptions }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workers = options.workers.map((worker) => ({ value: worker.id, label: worker.displayName }));
  const users = options.users
    .filter((user) => user.role === "WORKER")
    .map((user) => ({ value: user.id, label: `${user.label} · ${user.email}` }));

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await submitJson("/api/resource-assignments/worker-user-links", "POST", {
        workerId: formData.get("workerId"),
        userId: formData.get("userId"),
      });
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Collegamento non riuscito.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="rounded-xl border bg-muted/30 p-4">
      <FieldGroup>
        <div className="grid gap-4 lg:grid-cols-2">
          <AssignmentSelect id="worker-user-worker" label="Lavoratore" name="workerId" options={workers} placeholder="Seleziona lavoratore" />
          <AssignmentSelect id="worker-user-account" label="Account Qoovex" name="userId" options={users} placeholder="Seleziona account" />
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
        <div>
          <Button disabled={pending || !workers.length || !users.length} type="submit">
            <IconLink aria-hidden="true" />
            {pending ? "Collegamento..." : "Collega account"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

function JobSiteUserAssignmentForm({ options }: { options: AssignmentOptions }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const jobSites = options.jobSites.map((jobSite) => ({ value: jobSite.id, label: jobSite.name }));
  const users = options.users
    .filter((user) => user.role === "SITE_MANAGER")
    .map((user) => ({ value: user.id, label: `${user.label} · ${user.email}` }));

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await submitJson("/api/resource-assignments/job-site-user-assignments", "POST", {
        jobSiteId: formData.get("jobSiteId"),
        userId: formData.get("userId"),
      });
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Assegnazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="rounded-xl border bg-muted/30 p-4">
      <FieldGroup>
        <div className="grid gap-4 lg:grid-cols-2">
          <AssignmentSelect id="job-site-user-site" label="Cantiere" name="jobSiteId" options={jobSites} placeholder="Seleziona cantiere" />
          <AssignmentSelect id="job-site-user-manager" label="Responsabile cantiere" name="userId" options={users} placeholder="Seleziona responsabile" />
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
        <div>
          <Button disabled={pending || !jobSites.length || !users.length} type="submit">
            <IconShieldCheck aria-hidden="true" />
            {pending ? "Assegnazione..." : "Assegna responsabile"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

function JobSiteWorkerAssignmentForm({ options }: { options: AssignmentOptions }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const jobSites = options.jobSites.map((jobSite) => ({ value: jobSite.id, label: jobSite.name }));
  const workers = options.workers.map((worker) => ({ value: worker.id, label: worker.displayName }));

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await submitJson("/api/resource-assignments/job-site-worker-assignments", "POST", {
        jobSiteId: formData.get("jobSiteId"),
        workerId: formData.get("workerId"),
      });
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Assegnazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="rounded-xl border bg-muted/30 p-4">
      <FieldGroup>
        <div className="grid gap-4 lg:grid-cols-2">
          <AssignmentSelect id="job-site-worker-site" label="Cantiere" name="jobSiteId" options={jobSites} placeholder="Seleziona cantiere" />
          <AssignmentSelect id="job-site-worker-worker" label="Lavoratore" name="workerId" options={workers} placeholder="Seleziona lavoratore" />
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
        <div>
          <Button disabled={pending || !jobSites.length || !workers.length} type="submit">
            <IconUsers aria-hidden="true" />
            {pending ? "Assegnazione..." : "Assegna lavoratore"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

export function AccessAssignmentsPageView({
  workerUserLinks,
  jobSiteUserAssignments,
  jobSiteWorkerAssignments,
  options,
  returnToDashboard = false,
  canManage,
}: AccessAssignmentsPageViewProps) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Assegnazioni cantieri"
        description={canManage
          ? "Assegna responsabili e lavoratori ai cantieri in cui devono operare."
          : "Consulta le persone assegnate ai cantieri visibili."}
        action={returnToDashboard ? (
          <Link className={buttonVariants({ variant: "outline" })} data-link="plain" href="/dashboard">
            <IconArrowLeft aria-hidden="true" />
            Torna a Da fare
          </Link>
        ) : undefined}
      />

      <div className="grid gap-6">
        <details className="group order-last rounded-xl border bg-background">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-4 py-4 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">Associazione account al profilo</span>
              <span className="mt-1 block text-sm text-muted-foreground">Controllo avanzato riservato agli account con ruolo Lavoratore.</span>
            </span>
            <IconChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className="border-t p-3 sm:p-4">
            <Card className="border-0 shadow-none" size="sm">
              <CardHeader className="border-b">
                <div className="mb-2 grid size-9 place-items-center rounded-lg bg-muted text-foreground">
                  <IconLink aria-hidden="true" className="size-5" />
                </div>
                <CardTitle><h2>Profilo personale del lavoratore</h2></CardTitle>
                <CardDescription>Il ruolo stabilisce cosa può fare l'utente; questa associazione indica quale profilo, documenti e prove sono i suoi. Non assegna e non modifica il ruolo.</CardDescription>
                <CardAction><Badge variant="outline">{resultLabel(workerUserLinks.length, "collegamento", "collegamenti")}</Badge></CardAction>
              </CardHeader>
              <CardContent className="grid gap-5">
                {canManage ? <WorkerUserLinkForm options={options} /> : null}
                {!workerUserLinks.length ? (
                  <Empty className="min-h-40 border py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon"><IconLink aria-hidden="true" /></EmptyMedia>
                      <EmptyTitle>Nessun collegamento operativo</EmptyTitle>
                      <EmptyDescription>Non risultano account con ruolo Lavoratore associati a un profilo operativo.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <ul aria-label="Account collegati ai lavoratori" className="divide-y divide-border">
                    {workerUserLinks.map((link) => (
                      <li className="py-4 first:pt-0 last:pb-0" key={link.id}>
                        <article className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                          <Avatar size="lg"><AvatarFallback className="font-medium text-foreground">{initials(link.workerDisplayName)}</AvatarFallback></Avatar>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-medium text-foreground">{link.workerDisplayName}</h3>
                            <p className="mt-1 truncate text-sm text-muted-foreground">{link.userLabel} · {link.userEmail}</p>
                          </div>
                          {canManage ? <div className="col-start-2 sm:col-start-auto"><AssignmentArchiveButton endpoint={`/api/resource-assignments/worker-user-links/${link.id}`} label={`Rimuovi il collegamento di ${link.workerDisplayName}`} /></div> : null}
                        </article>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </details>

        <Card size="sm">
          <CardHeader className="border-b">
            <div className="mb-2 grid size-9 place-items-center rounded-lg bg-muted text-foreground">
              <IconShieldCheck aria-hidden="true" className="size-5" />
            </div>
            <CardTitle><h2>Responsabili dei cantieri</h2></CardTitle>
            <CardDescription>Assegna a ogni responsabile i cantieri che deve seguire.</CardDescription>
            <CardAction><Badge variant="outline">{resultLabel(jobSiteUserAssignments.length, "assegnazione", "assegnazioni")}</Badge></CardAction>
          </CardHeader>
          <CardContent className="grid gap-5">
            {canManage ? <JobSiteUserAssignmentForm options={options} /> : null}
            {!jobSiteUserAssignments.length ? (
              <Empty className="min-h-40 border py-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><IconShieldCheck aria-hidden="true" /></EmptyMedia>
                  <EmptyTitle>Nessun cantiere assegnato</EmptyTitle>
                  <EmptyDescription>Assegna un responsabile a un cantiere per definirne l'ambito operativo.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul aria-label="Responsabili assegnati ai cantieri" className="divide-y divide-border">
                {jobSiteUserAssignments.map((assignment) => (
                  <li className="py-4 first:pt-0 last:pb-0" key={assignment.id}>
                    <article className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                      <div aria-hidden="true" className="grid size-10 place-items-center rounded-lg bg-muted text-foreground"><IconBuilding className="size-5" /></div>
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-foreground">{assignment.jobSiteName}</h3>
                          <Badge variant="outline">Responsabile cantiere</Badge>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{assignment.userLabel} · {assignment.userEmail}</p>
                      </div>
                      {canManage ? <div className="col-start-2 sm:col-start-auto"><AssignmentArchiveButton endpoint={`/api/resource-assignments/job-site-user-assignments/${assignment.id}`} label={`Rimuovi ${assignment.userLabel} dal cantiere ${assignment.jobSiteName}`} /></div> : null}
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="border-b">
            <div className="mb-2 grid size-9 place-items-center rounded-lg bg-muted text-foreground">
              <IconUsers aria-hidden="true" className="size-5" />
            </div>
            <CardTitle><h2>Lavoratori nei cantieri</h2></CardTitle>
            <CardDescription>Collega i lavoratori ai cantieri in cui operano.</CardDescription>
            <CardAction><Badge variant="outline">{resultLabel(jobSiteWorkerAssignments.length, "assegnazione", "assegnazioni")}</Badge></CardAction>
          </CardHeader>
          <CardContent className="grid gap-5">
            {canManage ? <JobSiteWorkerAssignmentForm options={options} /> : null}
            {!jobSiteWorkerAssignments.length ? (
              <Empty className="min-h-40 border py-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><IconUsers aria-hidden="true" /></EmptyMedia>
                  <EmptyTitle>Nessun lavoratore assegnato</EmptyTitle>
                  <EmptyDescription>Assegna un lavoratore al cantiere in cui opera.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul aria-label="Lavoratori assegnati ai cantieri" className="divide-y divide-border">
                {jobSiteWorkerAssignments.map((assignment) => (
                  <li className="py-4 first:pt-0 last:pb-0" key={assignment.id}>
                    <article className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                      <Avatar size="lg"><AvatarFallback className="font-medium text-foreground">{initials(assignment.workerDisplayName)}</AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-foreground">{assignment.workerDisplayName}</h3>
                          <Badge variant="outline">{assignment.workerRoleLabel || "Mansione non indicata"}</Badge>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{assignment.jobSiteName}</p>
                      </div>
                      {canManage ? <div className="col-start-2 sm:col-start-auto"><AssignmentArchiveButton endpoint={`/api/resource-assignments/job-site-worker-assignments/${assignment.id}`} label={`Rimuovi ${assignment.workerDisplayName} dal cantiere ${assignment.jobSiteName}`} /></div> : null}
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </WorkspacePage>
  );
}
