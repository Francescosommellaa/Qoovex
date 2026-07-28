import Link from "next/link";
import {
  IconArrowRight,
  IconAt,
  IconBriefcase,
  IconCalendarDue,
  IconFileAlert,
  IconPhone,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@qoovex/ui/components/avatar";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
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
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@qoovex/ui/components/empty";
import { Input } from "@qoovex/ui/components/input";
import { cn } from "@qoovex/ui/lib/utils";
import { WorkerCreateDialog } from "./WorkerCreateDialog";
import {
  WorkspacePage,
  WorkspacePageHeader,
  WorkspaceState,
} from "@/views/workspace/WorkspacePrimitives";
import {
  formatDate,
  recordStatusLabels,
  statusTone,
} from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities } from "@/views/workspace/workspace-records";

interface DirectoryWorker {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  roleLabel: string | null;
  status: "ACTIVE" | "ARCHIVED";
  accessState:
    | "NO_ACCESS_REQUIRED"
    | "INVITATION_PENDING"
    | "INVITATION_EXPIRED"
    | "ACCESS_ACTIVE"
    | "ACCESS_SETUP_REQUIRED"
    | "ACCESS_REVOKED";
  documentAttentionCount: number;
  assignmentCount: number;
  jobSites: Array<{ id: string; name: string }>;
  nextDeadline: {
    id: string;
    title: string;
    dueDate: string;
    status: string;
  } | null;
  nextAction: { label: string; href: string };
}

interface DirectoryResponse {
  items: DirectoryWorker[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
  filters: { q: string; status: string; attention: string; access: string };
}

const accessLabels: Record<DirectoryWorker["accessState"], string> = {
  NO_ACCESS_REQUIRED: "Nessun accesso richiesto",
  INVITATION_PENDING: "Invito in attesa",
  INVITATION_EXPIRED: "Invito scaduto",
  ACCESS_ACTIVE: "Accesso attivo",
  ACCESS_SETUP_REQUIRED: "Accesso da completare",
  ACCESS_REVOKED: "Accesso revocato",
};

function initials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("it-IT");
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function pageHref(filters: DirectoryResponse["filters"], page: number) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.attention) params.set("attention", filters.attention);
  if (filters.access) params.set("access", filters.access);
  if (page > 1) params.set("page", String(page));
  return `/workers${params.size ? `?${params}` : ""}`;
}

export function WorkersPageView({
  directory,
  capabilities,
  initialCreateOpen = false,
  jobSites,
}: {
  directory: DirectoryResponse;
  capabilities: WorkspaceCapabilities;
  initialCreateOpen?: boolean;
  jobSites: Array<{ id: string; name: string }>;
}) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title={capabilities.accessPreset === "LIMITED_UPLOAD" ? "Il mio profilo" : "Lavoratori"}
        description="Rubrica operativa con documenti da verificare, cantieri, accesso a Qoovex e prossima azione."
        action={
          capabilities.canCreateWorkers ? (
            <WorkerCreateDialog
              className="h-10 w-full sm:h-8 sm:w-auto"
              initialOpen={initialCreateOpen}
              jobSites={jobSites}
            />
          ) : undefined
        }
      />

      {capabilities.accessPreset !== "LIMITED_UPLOAD" ? (
        <Card size="sm">
          <CardContent>
            <form
              className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto_auto_auto]"
              method="get"
            >
              <label className="relative">
                <span className="sr-only">Cerca lavoratore</span>
                <IconSearch
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  className="pl-9"
                  defaultValue={directory.filters.q}
                  name="q"
                  placeholder="Nome, email o mansione"
                />
              </label>
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                defaultValue={directory.filters.attention}
                name="attention"
              >
                <option value="">Tutti i documenti</option>
                <option value="document">Documenti da verificare</option>
              </select>
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                defaultValue={directory.filters.access}
                name="access"
              >
                <option value="">Tutti gli accessi</option>
                {Object.entries(accessLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button className={buttonVariants({ size: "sm" })} type="submit">
                Applica filtri
              </button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {!directory.items.length ? (
        <Card>
          <CardContent>
            <Empty className="min-h-64 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconUsers aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Nessun lavoratore trovato</EmptyTitle>
                <EmptyDescription>
                  Modifica i filtri oppure aggiungi il primo profilo operativo.
                </EmptyDescription>
              </EmptyHeader>
              {capabilities.canCreateWorkers ? (
                <EmptyContent>
                  <WorkerCreateDialog jobSites={jobSites} />
                </EmptyContent>
              ) : null}
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle>
              <h2>Rubrica operativa</h2>
            </CardTitle>
            <CardDescription>
              I contatti restano nascosti ai responsabili di cantiere.
            </CardDescription>
            <CardAction>
              <Badge variant="outline">
                {countLabel(directory.pagination.total, "lavoratore", "lavoratori")}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul aria-label="Lavoratori disponibili" className="divide-y divide-border">
              {directory.items.map((worker) => (
                <li className="py-4 first:pt-0 last:pb-0" key={worker.id}>
                  <article className="grid gap-4 lg:grid-cols-[auto_minmax(0,1.1fr)_minmax(0,1fr)_auto] lg:items-center">
                    <Avatar size="lg">
                      <AvatarFallback>{initials(worker.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-medium">{worker.displayName}</h3>
                        <WorkspaceState
                          label={recordStatusLabels[worker.status]}
                          tone={statusTone(worker.status)}
                        />
                        <WorkspaceState
                          label={accessLabels[worker.accessState]}
                          tone={
                            worker.accessState === "ACCESS_ACTIVE"
                              ? "good"
                              : worker.accessState === "ACCESS_SETUP_REQUIRED" ||
                                  worker.accessState === "INVITATION_EXPIRED"
                                ? "warning"
                                : "neutral"
                          }
                        />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {worker.roleLabel || "Mansione non indicata"}
                      </p>
                      {worker.email || worker.phone ? (
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {worker.email ? (
                            <span className="flex items-center gap-1">
                              <IconAt className="size-3.5" />
                              {worker.email}
                            </span>
                          ) : null}
                          {worker.phone ? (
                            <span className="flex items-center gap-1">
                              <IconPhone className="size-3.5" />
                              {worker.phone}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <div className="grid gap-2 text-sm">
                      <p className="flex items-center gap-2">
                        <IconFileAlert
                          aria-hidden="true"
                          className="size-4 text-muted-foreground"
                        />
                        {worker.documentAttentionCount
                          ? `${countLabel(worker.documentAttentionCount, "documento", "documenti")} da verificare`
                          : "Documenti in ordine"}
                      </p>
                      <p className="flex items-center gap-2">
                        <IconBriefcase
                          aria-hidden="true"
                          className="size-4 text-muted-foreground"
                        />
                        {worker.assignmentCount
                          ? `${countLabel(worker.assignmentCount, "cantiere", "cantieri")} ${worker.assignmentCount === 1 ? "assegnato" : "assegnati"}`
                          : "Nessun cantiere assegnato"}
                      </p>
                      {worker.nextDeadline ? (
                        <p className="flex items-center gap-2">
                          <IconCalendarDue
                            aria-hidden="true"
                            className="size-4 text-muted-foreground"
                          />
                          {worker.nextDeadline.title} · {formatDate(worker.nextDeadline.dueDate)}
                        </p>
                      ) : null}
                    </div>
                    <Link
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full lg:w-auto",
                      )}
                      data-link="plain"
                      href={worker.nextAction.href}
                    >
                      {worker.nextAction.label}
                      <IconArrowRight aria-hidden="true" />
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {directory.pagination.pageCount > 1 ? (
        <nav aria-label="Paginazione lavoratori" className="flex items-center justify-between">
          <Link
            aria-disabled={directory.pagination.page <= 1}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            data-link="plain"
            href={pageHref(directory.filters, Math.max(1, directory.pagination.page - 1))}
          >
            Precedente
          </Link>
          <span className="text-sm text-muted-foreground">
            Pagina {directory.pagination.page} di {directory.pagination.pageCount}
          </span>
          <Link
            aria-disabled={directory.pagination.page >= directory.pagination.pageCount}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            data-link="plain"
            href={pageHref(
              directory.filters,
              Math.min(directory.pagination.pageCount, directory.pagination.page + 1),
            )}
          >
            Successiva
          </Link>
        </nav>
      ) : null}
    </WorkspacePage>
  );
}
