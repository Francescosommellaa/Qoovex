"use client";

import FullCalendar, {
  type CalendarRef,
  type DateSelectInfo,
  type EventClickInfo,
  type EventDropInfo,
  type EventInput,
  type EventResizeDoneInfo,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import itLocale from "@fullcalendar/react/locales/it";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import monarchTheme from "@fullcalendar/react/themes/monarch";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/monarch/theme.css";
import "@fullcalendar/react/themes/monarch/palettes/blue.css";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArchive,
  IconCalendarDue,
  IconCalendarPlus,
  IconChevronLeft,
  IconChevronRight,
  IconChecklist,
  IconClock,
  IconDownload,
  IconFilter,
  IconLink,
  IconUpload,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@qoovex/ui/components/dialog";
import { Input } from "@qoovex/ui/components/input";
import { Label } from "@qoovex/ui/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@qoovex/ui/components/select";
import { Textarea } from "@qoovex/ui/components/textarea";
import { Spinner } from "@qoovex/ui/components/spinner";
import { cn } from "@qoovex/ui/lib/utils";
import { submitJson } from "../admin-api-client";
import { WorkspacePage, WorkspacePageHeader } from "@/views/workspace/WorkspacePrimitives";
import type {
  WorkspaceCalendarEventRecord,
  WorkspaceCalendarParticipant,
  WorkspaceCapabilities,
  WorkspaceDeadlineRecord,
  WorkspaceJobSiteRecord,
} from "@/views/workspace/workspace-records";
import { hasActiveCalendarFilters, type CalendarFilter } from "./calendar-filter-state";
import styles from "./CalendarPageView.module.css";

type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

interface EventDraft {
  id?: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  kind: "EVENT" | "TASK";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PLANNED" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  assignedToId: string;
  jobSiteId: string;
}

const priorityLabels = { LOW: "Bassa", MEDIUM: "Media", HIGH: "Alta", URGENT: "Urgente" } as const;
const statusLabels = { PLANNED: "Pianificato", IN_PROGRESS: "In corso", DONE: "Completato", CANCELLED: "Annullato" } as const;
const kindLabels = { EVENT: "Evento", TASK: "Attività" } as const;
const roleLabels = { OWNER: "Owner", ADMIN: "Admin", SAFETY_CONSULTANT: "Consulente", SITE_MANAGER: "Responsabile cantiere", WORKER: "Lavoratore" } as const;
const calendarViews: { label: string; value: CalendarView }[] = [
  { label: "Mese", value: "dayGridMonth" },
  { label: "Settimana", value: "timeGridWeek" },
  { label: "Giorno", value: "timeGridDay" },
  { label: "Agenda", value: "listWeek" },
];

function toLocalInput(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toLocalDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addLocalDays(value: string, amount: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year!, month! - 1, day! + amount);
  return toLocalDate(date);
}

function localDateStart(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year!, month! - 1, day!).toISOString();
}

function emptyDraft(
  start = new Date(),
  end = new Date(Date.now() + 3600000),
  allDay = false,
): EventDraft {
  const startDate = toLocalDate(start);
  const exclusiveEndDate = toLocalDate(end);
  return {
    title: "",
    description: "",
    startAt: allDay ? startDate : toLocalInput(start),
    endAt: allDay
      ? addLocalDays(exclusiveEndDate, -1) < startDate
        ? startDate
        : addLocalDays(exclusiveEndDate, -1)
      : toLocalInput(end),
    allDay,
    kind: "EVENT",
    priority: "MEDIUM",
    status: "PLANNED",
    assignedToId: "",
    jobSiteId: "",
  };
}

function eventDraft(event: WorkspaceCalendarEventRecord): EventDraft {
  const startDate = toLocalDate(event.startAt);
  const inclusiveEndDate = addLocalDays(toLocalDate(event.endAt), -1);
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? "",
    startAt: event.allDay ? startDate : toLocalInput(event.startAt),
    endAt: event.allDay && inclusiveEndDate >= startDate
      ? inclusiveEndDate
      : event.allDay
        ? startDate
        : toLocalInput(event.endAt),
    allDay: event.allDay,
    kind: event.kind,
    priority: event.priority,
    status: event.status === "ARCHIVED" ? "CANCELLED" : event.status,
    assignedToId: event.assignedToId ?? "",
    jobSiteId: event.jobSiteId ?? "",
  };
}

function addDay(value: string) {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function eventColors(priority: WorkspaceCalendarEventRecord["priority"]) {
  if (priority === "URGENT") return { backgroundColor: "var(--destructive)", borderColor: "var(--destructive)", textColor: "var(--destructive-foreground)" };
  if (priority === "HIGH") return { backgroundColor: "var(--warning)", borderColor: "var(--warning)", textColor: "var(--warning-foreground)" };
  if (priority === "LOW") return { backgroundColor: "var(--muted)", borderColor: "var(--border)", textColor: "var(--foreground)" };
  return { backgroundColor: "var(--primary)", borderColor: "var(--primary)", textColor: "var(--primary-foreground)" };
}

function SelectField({ label, displayValue, value, onValueChange, children, disabled }: { label: string; displayValue: string; value: string; onValueChange: (value: string) => void; children: React.ReactNode; disabled?: boolean }) {
  const controlId = useId();
  return <div className="grid gap-2"><Label htmlFor={controlId}>{label}</Label><Select disabled={disabled} onValueChange={(value) => onValueChange(value ?? "")} value={value}><SelectTrigger className="h-10 w-full" id={controlId}><span className="flex flex-1 text-left">{displayValue}</span></SelectTrigger><SelectContent><SelectGroup><SelectLabel>{label}</SelectLabel>{children}</SelectGroup></SelectContent></Select></div>;
}

export function CalendarPageView({
  initialEvents,
  deadlines,
  participants,
  jobSites,
  capabilities,
  initialFilter = "all",
}: {
  initialEvents: WorkspaceCalendarEventRecord[];
  deadlines: WorkspaceDeadlineRecord[];
  participants: WorkspaceCalendarParticipant[];
  jobSites: WorkspaceJobSiteRecord[];
  capabilities: WorkspaceCapabilities;
  initialFilter?: CalendarFilter;
}) {
  const router = useRouter();
  const calendarRef = useRef<CalendarRef>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [events, setEvents] = useState(initialEvents);
  const [filter, setFilter] = useState<CalendarFilter>(initialFilter);
  const [participant, setParticipant] = useState("all");
  const [activeView, setActiveView] = useState<CalendarView>("dayGridMonth");
  const [calendarTitle, setCalendarTitle] = useState("");
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<WorkspaceDeadlineRecord | null>(null);
  const [integrationOpen, setIntegrationOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => setEvents(initialEvents), [initialEvents]);

  const canEditDraft = capabilities.canManageCalendar || Boolean(draft?.id && participants.length === 1 && events.find((item) => item.id === draft.id)?.assignedToId === participants[0]?.id);

  const calendarEvents = useMemo<EventInput[]>(() => {
    const ownEvents = events
      .filter((event) => participant === "all" || event.assignedToId === participant)
      .filter((event) => filter !== "tasks" || event.kind === "TASK")
      .filter((event) => filter !== "priority" || event.priority === "HIGH" || event.priority === "URGENT")
      .filter(() => filter !== "deadlines")
      .map((event) => ({
        id: `event:${event.id}`,
        title: event.title,
        start: event.startAt,
        end: event.endAt,
        allDay: event.allDay,
        editable: capabilities.canManageCalendar,
        extendedProps: { recordType: "event", recordId: event.id, priority: event.priority, kind: event.kind, assignee: event.assignedTo?.label },
        ...eventColors(event.priority),
      }));
    const deadlineEvents = deadlines
      .filter(() => participant === "all")
      .filter(() => filter !== "tasks" && filter !== "priority")
      .map((deadline) => ({
        id: `deadline:${deadline.id}`,
        title: deadline.title,
        start: deadline.dueDate.slice(0, 10),
        end: addDay(deadline.dueDate),
        allDay: true,
        editable: false,
        backgroundColor: "var(--info)",
        borderColor: "var(--info)",
        textColor: "var(--info-foreground)",
        extendedProps: { recordType: "deadline", recordId: deadline.id },
      }));
    return [...ownEvents, ...deadlineEvents];
  }, [capabilities.canManageCalendar, deadlines, events, filter, participant]);

  const urgentCount = events.filter((event) => event.priority === "HIGH" || event.priority === "URGENT").length;
  const taskCount = events.filter((event) => event.kind === "TASK").length;
  const activeViewIndex = calendarViews.findIndex((view) => view.value === activeView);
  const hasActiveFilters = hasActiveCalendarFilters(filter, participant);

  function openCreate(selection?: DateSelectInfo) {
    if (!capabilities.canManageCalendar) return;
    const next = emptyDraft(
      selection?.start ?? new Date(),
      selection?.end ?? new Date(Date.now() + 3600000),
      selection?.allDay ?? false,
    );
    setError(null);
    setDraft(next);
  }

  function changeCalendarView(view: CalendarView) {
    calendarRef.current?.getApi().changeView(view);
    setActiveView(view);
  }

  function resetFilters() {
    setFilter("all");
    setParticipant("all");
  }

  function moveCalendar(direction: "prev" | "next") {
    calendarRef.current?.getApi()[direction]();
  }

  function centerToday() {
    calendarRef.current?.getApi().today();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const todayDate = toLocalDate(new Date());
        const today = calendarContainerRef.current?.querySelector<HTMLElement>(
          `[role="gridcell"][data-date="${todayDate}"]`,
        ) ?? calendarContainerRef.current?.querySelector<HTMLElement>(`[data-date="${todayDate}"]`);
        today?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "center",
          inline: "center",
        });
      });
    });
  }

  function toggleAllDay(allDay: boolean) {
    if (!draft || draft.allDay === allDay) return;
    if (allDay) {
      const startDate = draft.startAt.slice(0, 10);
      const endDate = draft.endAt.slice(0, 10);
      setDraft({ ...draft, allDay: true, startAt: startDate, endAt: endDate < startDate ? startDate : endDate });
      return;
    }
    const startDate = draft.startAt.slice(0, 10);
    const endDate = draft.endAt.slice(0, 10);
    setDraft({
      ...draft,
      allDay: false,
      startAt: `${startDate}T09:00`,
      endAt: `${endDate}T${endDate === startDate ? "10:00" : "17:00"}`,
    });
  }

  function handleEventClick(info: EventClickInfo) {
    const recordType = info.event.extendedProps.recordType as "event" | "deadline";
    const recordId = info.event.extendedProps.recordId as string;
    if (recordType === "deadline") {
      setSelectedDeadline(deadlines.find((item) => item.id === recordId) ?? null);
      return;
    }
    const event = events.find((item) => item.id === recordId);
    if (event) setDraft(eventDraft(event));
  }

  async function persistMove(info: EventDropInfo | EventResizeDoneInfo) {
    const recordId = info.event.extendedProps.recordId as string;
    if (info.event.extendedProps.recordType !== "event" || !info.event.start || !info.event.end) return;
    try {
      const updated = await submitJson<WorkspaceCalendarEventRecord>(`/api/calendar/events/${recordId}`, "PATCH", {
        startAt: info.event.start.toISOString(),
        endAt: info.event.end.toISOString(),
        allDay: info.event.allDay,
      });
      setEvents((current) => current.map((event) => event.id === updated.id ? updated : event));
    } catch (moveError) {
      info.revert();
      setNotice(moveError instanceof Error ? moveError.message : "Spostamento non riuscito.");
    }
  }

  async function saveDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setError(null);
    const startAt = draft.allDay ? localDateStart(draft.startAt) : new Date(draft.startAt).toISOString();
    const endAt = draft.allDay
      ? localDateStart(addLocalDays(draft.endAt, 1))
      : new Date(draft.endAt).toISOString();
    if (new Date(endAt) <= new Date(startAt)) {
      setError("La fine deve essere successiva all'inizio.");
      return;
    }
    setPending(true);
    try {
      const payload = {
        title: draft.title,
        description: draft.description || null,
        startAt,
        endAt,
        allDay: draft.allDay,
        kind: draft.kind,
        priority: draft.priority,
        status: draft.status,
        assignedToId: draft.assignedToId || null,
        jobSiteId: draft.jobSiteId || null,
      };
      const saved = await submitJson<WorkspaceCalendarEventRecord>(draft.id ? `/api/calendar/events/${draft.id}` : "/api/calendar/events", draft.id ? "PATCH" : "POST", capabilities.canManageCalendar ? payload : { status: draft.status });
      setEvents((current) => draft.id ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
      setDraft(null);
      setNotice(draft.id ? "Impegno aggiornato." : "Impegno aggiunto al calendario.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Salvataggio non riuscito.");
    } finally {
      setPending(false);
    }
  }

  async function archiveDraft() {
    if (!draft?.id || !capabilities.canManageCalendar) return;
    setPending(true);
    setError(null);
    try {
      await submitJson(`/api/calendar/events/${draft.id}`, "DELETE", {});
      setEvents((current) => current.filter((event) => event.id !== draft.id));
      setDraft(null);
      setNotice("Impegno archiviato dal calendario.");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Archiviazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  async function importCalendar(file: File) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/calendar/import", { method: "POST", headers: { "Content-Type": "text/calendar; charset=utf-8" }, body: await file.text() });
      const payload = await response.json() as { imported?: number; skipped?: number; message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Importazione non riuscita.");
      setIntegrationOpen(false);
      setNotice(`${payload.imported ?? 0} eventi importati${payload.skipped ? `, ${payload.skipped} duplicati ignorati` : ""}.`);
      router.refresh();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Importazione non riuscita.");
    } finally {
      setPending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Calendario"
        description="La vista generale del lavoro nel tempo: eventi, attività assegnate e scadenze registrate, senza duplicare i record di origine."
        action={<div className="flex flex-wrap gap-2">
          <Button onClick={() => setIntegrationOpen(true)} variant="outline"><IconLink />Calendari esterni</Button>
          <Link className={cn(buttonVariants({ variant: "outline" }))} href="/deadlines"><IconCalendarDue />Scadenze</Link>
          {capabilities.canManageCalendar ? <Button onClick={() => openCreate()}><IconCalendarPlus />Nuovo impegno</Button> : null}
        </div>}
      />

      {notice ? <Alert><IconCalendarDue /><AlertTitle>Aggiornamento calendario</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert> : null}

      <Card aria-label="Riepilogo calendario" size="sm">
        <CardContent className="grid grid-cols-2 gap-y-4 sm:grid-cols-4 sm:divide-x sm:divide-border">
          <div className="sm:pr-4"><p className="text-xs font-medium text-muted-foreground">Impegni</p><strong className="mt-1 block text-2xl font-semibold tabular-nums">{events.length}</strong></div>
          <div className="border-l border-border pl-4 sm:border-l-0"><p className="text-xs font-medium text-muted-foreground">Attività</p><strong className="mt-1 block text-2xl font-semibold tabular-nums">{taskCount}</strong></div>
          <div className="sm:pl-4"><p className="text-xs font-medium text-muted-foreground">Scadenze</p><strong className="mt-1 block text-2xl font-semibold tabular-nums">{deadlines.length}</strong></div>
          <div className="border-l border-border pl-4"><p className="text-xs font-medium text-muted-foreground">Priorità alte</p><strong className="mt-1 block text-2xl font-semibold tabular-nums">{urgentCount}</strong></div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="gap-4 border-b bg-muted/15">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div><CardTitle>Agenda operativa</CardTitle><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Seleziona uno spazio libero per pianificare. Gli impegni autorizzati si possono aprire, trascinare e ridimensionare.</p></div>
            <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1" aria-label="Filtri calendario">
              {([['all', 'Tutto'], ['deadlines', 'Scadenze'], ['tasks', 'Attività'], ['priority', 'Priorità']] as const).map(([value, label]) => <Button aria-pressed={filter === value} key={value} onClick={() => setFilter(value)} size="sm" variant={filter === value ? "default" : "ghost"}>{value === "all" ? <IconFilter /> : null}{label}</Button>)}
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t pt-4 lg:flex-row lg:items-end lg:justify-between">
            {participants.length > 1 ? <div className="w-full max-w-sm"><SelectField displayValue={participant === "all" ? "Tutta l'azienda" : participants.find((item) => item.id === participant)?.label ?? "Tutta l'azienda"} label="Calendario persona" onValueChange={setParticipant} value={participant}><SelectItem value="all">Tutta l'azienda</SelectItem>{participants.map((item) => <SelectItem key={item.id} value={item.id}>{item.label} · {roleLabels[item.role]}</SelectItem>)}</SelectField></div> : <p className="text-xs text-muted-foreground">La visibilità segue il ruolo e gli ambiti assegnati dal server.</p>}
            <div aria-label="Legenda calendario" className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Evento</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" />Priorità alta</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-info" />Scadenza</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {hasActiveFilters && !calendarEvents.length ? (
            <div className={styles.emptyState} role="status">
              <span className={styles.emptyStateIcon}><IconFilter /></span>
              <div className="min-w-0">
                <strong className="block text-sm">Nessun risultato con i filtri attivi</strong>
                <span className="text-sm text-muted-foreground">La selezione corrente non contiene elementi. Azzera i filtri per tornare al calendario completo.</span>
              </div>
              <Button className={styles.emptyStateAction} onClick={resetFilters} size="sm" variant="outline"><IconFilter />Azzera filtri</Button>
            </div>
          ) : null}
          <div className={styles.calendar} data-empty={calendarEvents.length === 0 ? "true" : "false"} ref={calendarContainerRef}>
            <div className={styles.calendarToolbar}>
              <div className={styles.calendarNavigation}>
                <Button aria-label="Periodo precedente" onClick={() => moveCalendar("prev")} size="icon" type="button" variant="ghost"><IconChevronLeft /></Button>
                <Button aria-label="Periodo successivo" onClick={() => moveCalendar("next")} size="icon" type="button" variant="ghost"><IconChevronRight /></Button>
                <Button onClick={centerToday} type="button" variant="outline">Oggi</Button>
              </div>
              <h3 aria-live="polite" className={styles.calendarTitle}>{calendarTitle}</h3>
              <div aria-label="Vista calendario" className={styles.viewSwitcher} role="group" style={{ "--calendar-view-offset": `${Math.max(activeViewIndex, 0) * 100}%` } as React.CSSProperties}>
                <span aria-hidden="true" className={styles.viewIndicator} />
                {calendarViews.map((view) => (
                  <button
                    aria-pressed={activeView === view.value}
                    className={styles.viewButton}
                    key={view.value}
                    onClick={() => changeCalendarView(view.value)}
                    type="button"
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            </div>
            <div aria-label={`Calendario, vista ${calendarViews.find((view) => view.value === activeView)?.label ?? "Mese"}`} id="workspace-calendar-grid">
            <FullCalendar
              allDayText="Tutto il giorno"
              datesSet={(info) => {
                setCalendarTitle(info.view.title);
                if (calendarViews.some((view) => view.value === info.view.type)) {
                  setActiveView(info.view.type as CalendarView);
                }
              }}
              dayMaxEvents={3}
              editable={capabilities.canManageCalendar}
              eventClick={handleEventClick}
              eventDrop={persistMove}
              eventResize={persistMove}
              events={calendarEvents}
              firstDay={1}
              headerToolbar={false}
              height="auto"
              initialView="dayGridMonth"
              locale={itLocale}
              nowIndicator
              plugins={[monarchTheme, dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              select={openCreate}
              selectable={capabilities.canManageCalendar}
              selectMirror
              slotDuration="00:30:00"
              slotMaxTime="22:00:00"
              slotMinTime="06:00:00"
              weekends
              ref={calendarRef}
            />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog onOpenChange={(open) => { if (!open) setDraft(null); }} open={Boolean(draft)}>
        <DialogContent className="max-h-[min(92vh,54rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{draft?.id ? "Modifica impegno" : "Pianifica un impegno"}</DialogTitle><DialogDescription>Indica prima cosa deve accadere e quando. Responsabile, cantiere e note restano facoltativi.</DialogDescription></DialogHeader>
          {draft ? <form className="grid gap-5" onSubmit={saveDraft}>
            {error ? <Alert variant="destructive"><AlertTitle>Operazione non riuscita</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
            <section aria-labelledby="calendar-what-heading" className="grid gap-4">
              <div><h3 className="text-sm font-semibold" id="calendar-what-heading">Impegno</h3><p className="text-xs text-muted-foreground">Un titolo breve rende il calendario più facile da leggere.</p></div>
              <div className="grid gap-2"><Label htmlFor="calendar-title">Titolo</Label><Input autoFocus disabled={!canEditDraft || pending} id="calendar-title" maxLength={160} minLength={2} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Es. Sopralluogo sicurezza" required value={draft.title} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField disabled={!capabilities.canManageCalendar || pending} displayValue={kindLabels[draft.kind]} label="Tipo" onValueChange={(value) => setDraft({ ...draft, kind: value as EventDraft['kind'] })} value={draft.kind}><SelectItem value="EVENT">Evento</SelectItem><SelectItem value="TASK">Attività</SelectItem></SelectField>
                <SelectField disabled={!capabilities.canManageCalendar || pending} displayValue={priorityLabels[draft.priority]} label="Priorità" onValueChange={(value) => setDraft({ ...draft, priority: value as EventDraft['priority'] })} value={draft.priority}>{Object.entries(priorityLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectField>
              </div>
            </section>

            <section aria-labelledby="calendar-when-heading" className="grid gap-4 rounded-xl border bg-muted/15 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-2.5"><IconClock className="mt-0.5 size-4 text-muted-foreground" /><div><h3 className="text-sm font-semibold" id="calendar-when-heading">Quando</h3><p className="text-xs text-muted-foreground">Scegli un intervallo chiaro; il calendario controlla che le date siano coerenti.</p></div></div>
                <div className="flex min-h-10 items-center gap-2 rounded-lg border bg-background px-3">
                  <Checkbox checked={draft.allDay} disabled={!capabilities.canManageCalendar || pending} id="calendar-all-day" onCheckedChange={(checked) => toggleAllDay(checked === true)} />
                  <Label className="cursor-pointer" htmlFor="calendar-all-day">Giornata intera</Label>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="calendar-start">{draft.allDay ? "Dal giorno" : "Inizio"}</Label><Input disabled={!capabilities.canManageCalendar || pending} id="calendar-start" onChange={(event) => { const value = event.target.value; setDraft({ ...draft, startAt: value, endAt: draft.allDay && draft.endAt < value ? value : draft.endAt }); }} required type={draft.allDay ? "date" : "datetime-local"} value={draft.startAt} /></div>
                <div className="grid gap-2"><Label htmlFor="calendar-end">{draft.allDay ? "Fino al giorno" : "Fine"}</Label><Input disabled={!capabilities.canManageCalendar || pending} id="calendar-end" min={draft.startAt} onChange={(event) => setDraft({ ...draft, endAt: event.target.value })} required type={draft.allDay ? "date" : "datetime-local"} value={draft.endAt} /></div>
              </div>
              <p className="text-xs text-muted-foreground">{draft.allDay ? "Gli orari sono disattivati: l'impegno coprirà tutte le giornate selezionate." : "Gli orari sono espressi nel fuso locale del workspace."}</p>
            </section>

            <section aria-labelledby="calendar-context-heading" className="grid gap-4">
              <div><h3 className="text-sm font-semibold" id="calendar-context-heading">Contesto operativo</h3><p className="text-xs text-muted-foreground">Collega solo le informazioni utili a chi dovrà agire.</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField disabled={!capabilities.canManageCalendar || pending} displayValue={draft.assignedToId ? participants.find((item) => item.id === draft.assignedToId)?.label ?? "Nessun assegnatario" : "Nessun assegnatario"} label="Assegnato a" onValueChange={(value) => setDraft({ ...draft, assignedToId: value === "none" ? "" : value })} value={draft.assignedToId || "none"}><SelectItem value="none">Nessun assegnatario</SelectItem>{participants.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectField>
                <SelectField disabled={!capabilities.canManageCalendar || pending} displayValue={draft.jobSiteId ? jobSites.find((item) => item.id === draft.jobSiteId)?.name ?? "Nessun cantiere" : "Nessun cantiere"} label="Cantiere" onValueChange={(value) => setDraft({ ...draft, jobSiteId: value === "none" ? "" : value })} value={draft.jobSiteId || "none"}><SelectItem value="none">Nessun cantiere</SelectItem>{jobSites.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectField>
                {draft.id ? <SelectField disabled={!canEditDraft || pending} displayValue={statusLabels[draft.status]} label="Stato" onValueChange={(value) => setDraft({ ...draft, status: value as EventDraft['status'] })} value={draft.status}>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectField> : null}
                <div className={cn("grid gap-2", draft.id ? "" : "sm:col-span-2")}><Label htmlFor="calendar-description">Note <span className="font-normal text-muted-foreground">(facoltative)</span></Label><Textarea disabled={!capabilities.canManageCalendar || pending} id="calendar-description" maxLength={4000} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Indicazioni, luogo o materiale necessario" rows={draft.id ? 3 : 4} value={draft.description} /></div>
              </div>
            </section>
            <DialogFooter>
              {draft.id && capabilities.canManageCalendar ? <Button disabled={pending} onClick={archiveDraft} type="button" variant="destructive"><IconArchive />Archivia</Button> : null}
              <DialogClose render={<Button disabled={pending} type="button" variant="outline" />}>Annulla</DialogClose>
              {canEditDraft ? <Button disabled={pending} type="submit">{pending ? <><Spinner />Salvataggio…</> : draft.id ? "Salva modifiche" : "Aggiungi al calendario"}</Button> : null}
            </DialogFooter>
          </form> : null}
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={(open) => { if (!open) setSelectedDeadline(null); }} open={Boolean(selectedDeadline)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedDeadline?.title}</DialogTitle><DialogDescription>Scadenza registrata, mostrata automaticamente nel calendario.</DialogDescription></DialogHeader>
          {selectedDeadline ? <div className="grid gap-3"><Badge variant="info">Scadenza</Badge><p className="text-sm">Data: <strong>{new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(new Date(selectedDeadline.dueDate))}</strong></p><p className="text-sm text-muted-foreground">Le scadenze restano separate dagli eventi per conservare origine documentale, reminder e audit.</p></div> : null}
          <DialogFooter><DialogClose render={<Button variant="outline" />}>Chiudi</DialogClose><Link className={cn(buttonVariants())} href="/deadlines">Apri scadenze</Link></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={(open) => { setIntegrationOpen(open); setError(null); }} open={integrationOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Calendari esterni</DialogTitle><DialogDescription>Importa un file iCalendar oppure esporta gli impegni Qoovex. La sincronizzazione Google/Outlook bidirezionale richiede una configurazione OAuth separata.</DialogDescription></DialogHeader>
          {error ? <Alert variant="destructive"><AlertTitle>Operazione non riuscita</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
          <div className="grid gap-3">
            {capabilities.canManageCalendar ? <Button disabled={pending} onClick={() => fileInputRef.current?.click()} variant="outline"><IconUpload />Importa file .ics</Button> : null}
            <input accept=".ics,text/calendar" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importCalendar(file); }} ref={fileInputRef} type="file" />
            <a className={cn(buttonVariants({ variant: "outline" }))} href="/api/calendar/export"><IconDownload />Esporta calendario .ics</a>
            <Alert><IconChecklist /><AlertTitle>Connessione sicura</AlertTitle><AlertDescription>L'importazione legge un file scelto da te; Qoovex non contatta URL esterni e non memorizza credenziali provider.</AlertDescription></Alert>
          </div>
          <DialogFooter><DialogClose render={<Button variant="outline" />}>Chiudi</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
