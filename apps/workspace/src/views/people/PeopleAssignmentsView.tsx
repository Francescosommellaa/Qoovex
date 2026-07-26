"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconBuildingCommunity, IconLinkOff } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@qoovex/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@qoovex/ui/components/empty";
import { Field, FieldError, FieldLabel } from "@qoovex/ui/components/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@qoovex/ui/components/select";
import { submitJson } from "@/views/admin-core/admin-api-client";
import { WorkspacePage, WorkspacePageHeader } from "@/views/workspace/WorkspacePrimitives";

interface AssignmentOverview {
  jobSites: Array<{
    id: string;
    name: string;
    status: string;
    userAssignments: Array<{
      id: string;
      userId: string;
      user: { name: string | null; email: string };
    }>;
    workerAssignments: Array<{
      id: string;
      workerId: string;
      worker: { displayName: string; roleLabel: string | null };
    }>;
  }>;
  options: {
    workers: Array<{ id: string; displayName: string; roleLabel: string | null }>;
    siteManagers: Array<{ id: string; label: string; email: string }>;
  };
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function AssignmentRemoveButton({ endpoint }: { endpoint: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    setPending(true);
    try {
      await submitJson(endpoint, "DELETE");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      aria-label="Rimuovi assegnazione"
      disabled={pending}
      onClick={() => void remove()}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <IconLinkOff aria-hidden="true" />
    </Button>
  );
}

function AssignmentForm({
  jobSiteId,
  kind,
  overview,
}: {
  jobSiteId: string;
  kind: "manager" | "worker";
  overview: AssignmentOverview;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const options =
    kind === "manager"
      ? overview.options.siteManagers.map((item) => ({
          value: item.id,
          label: `${item.label} · ${item.email}`,
        }))
      : overview.options.workers.map((item) => ({
          value: item.id,
          label: item.roleLabel
            ? `${item.displayName} · ${item.roleLabel}`
            : item.displayName,
        }));

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const endpoint =
        kind === "manager"
          ? "/api/resource-assignments/job-site-user-assignments"
          : "/api/resource-assignments/job-site-worker-assignments";
      await submitJson(endpoint, "POST", {
        jobSiteId,
        [kind === "manager" ? "userId" : "workerId"]: formData.get("personId"),
      });
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Assegnazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      action={submit}
      className="grid gap-2 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
    >
      <Field>
        <FieldLabel htmlFor={`${kind}-${jobSiteId}`}>
          {kind === "manager" ? "Responsabile" : "Lavoratore"}
        </FieldLabel>
        <Select items={options} name="personId" required>
          <SelectTrigger id={`${kind}-${jobSiteId}`}>
            <SelectValue placeholder="Seleziona persona" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Button disabled={pending || !options.length} type="submit">
        {pending ? "Assegno..." : "Assegna"}
      </Button>
      {error ? <FieldError className="sm:col-span-2">{error}</FieldError> : null}
    </form>
  );
}

export function PeopleAssignmentsView({
  overview,
  canManage,
}: {
  overview: AssignmentOverview;
  canManage: boolean;
}) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Assegnazioni"
        description={
          canManage
            ? "Organizza per cantiere i responsabili e i lavoratori che possono operare nel relativo ambito."
            : "Consulta responsabili e lavoratori assegnati ai cantieri."
        }
      />
      {!overview.jobSites.length ? (
        <Card>
          <CardContent>
            <Empty className="min-h-64">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconBuildingCommunity aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Nessun cantiere attivo</EmptyTitle>
                <EmptyDescription>
                  Crea prima un cantiere per poter assegnare le persone.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5">
          {overview.jobSites.map((site) => {
            const count = site.userAssignments.length + site.workerAssignments.length;
            return (
              <Card key={site.id} size="sm">
                <CardHeader className="border-b">
                  <CardTitle>
                    <h2>{site.name}</h2>
                  </CardTitle>
                  <CardDescription>
                    {countLabel(
                      site.userAssignments.length,
                      "responsabile",
                      "responsabili",
                    )}{" "}
                    · {countLabel(site.workerAssignments.length, "lavoratore", "lavoratori")}
                  </CardDescription>
                  <CardAction>
                    <Badge variant="outline">
                      {countLabel(count, "assegnazione", "assegnazioni")}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <div className="grid gap-5 lg:grid-cols-2">
                    <section>
                      <h3 className="text-sm font-medium">Responsabili cantiere</h3>
                      {site.userAssignments.length ? (
                        <ul className="mt-2 divide-y divide-border">
                          {site.userAssignments.map((assignment) => (
                            <li
                              className="flex items-center justify-between gap-3 py-2"
                              key={assignment.id}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm">
                                  {assignment.user.name?.trim() || assignment.user.email}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {assignment.user.email}
                                </p>
                              </div>
                              {canManage ? (
                                <AssignmentRemoveButton
                                  endpoint={`/api/resource-assignments/job-site-user-assignments/${assignment.id}`}
                                />
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Nessun responsabile assegnato.
                        </p>
                      )}
                    </section>
                    <section>
                      <h3 className="text-sm font-medium">Lavoratori</h3>
                      {site.workerAssignments.length ? (
                        <ul className="mt-2 divide-y divide-border">
                          {site.workerAssignments.map((assignment) => (
                            <li
                              className="flex items-center justify-between gap-3 py-2"
                              key={assignment.id}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm">
                                  {assignment.worker.displayName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {assignment.worker.roleLabel || "Mansione non indicata"}
                                </p>
                              </div>
                              {canManage ? (
                                <AssignmentRemoveButton
                                  endpoint={`/api/resource-assignments/job-site-worker-assignments/${assignment.id}`}
                                />
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Nessun lavoratore assegnato.
                        </p>
                      )}
                    </section>
                  </div>
                  {canManage ? (
                    <div className="grid gap-3 border-t pt-5 lg:grid-cols-2">
                      <AssignmentForm jobSiteId={site.id} kind="manager" overview={overview} />
                      <AssignmentForm jobSiteId={site.id} kind="worker" overview={overview} />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </WorkspacePage>
  );
}
