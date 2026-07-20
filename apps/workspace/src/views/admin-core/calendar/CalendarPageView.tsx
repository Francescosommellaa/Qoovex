"use client";

import FullCalendar, {
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
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconCalendarDue,
  IconCalendarPlus,
  IconChecklist,
  IconDownload,
  IconFilter,
  IconFlag,
  IconLink,
  IconUpload,
  IconUsers,
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
  SelectValue,
} from "@qoovex/ui/components/select";
import { Textarea } from "@qoovex/ui/components/textarea";
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
import styles from "./CalendarPageView.module.css";

type CalendarFilter = "all" | "deadlines" | "tasks" | "priority";

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
const roleLabels = { OWNER: "Owner", ADMIN: "Admin", SAFETY_CONSULTANT: "Consulente", SITE_MANAGER: "Capocantiere", WORKER: "Lavoratore" } as const;

function toLocalInput(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function emptyDraft(start = new Date(), end = new Date(Date.now() + 3600000)): EventDraft {
  return {
    title: "",
    description: "",
    startAt: toLocalInput(start),
    endAt: toLocalInput(end),
    allDay: false,
    kind: "EVENT",
    priority: "MEDIUM",
    status: "PLANNED",
    assignedToId: "",
    jobSiteId: "",
  };
}

function eventDraft(event: WorkspaceCalendarEventRecord): EventDraft {
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? "",
    startAt: toLocalInput(event.startAt),
    endAt: toLocalInput(event.endAt),
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

function SelectField({ label, value, onValueChange, children, disabled }: { label: string; value: string; onValueChange: (value: string) => void; children: React.ReactNode; disabled?: boolean }) {
  return <div className="grid gap-2"><Label>{label}</Label><Select disabled={disabled} onValueChange={(value) => onValueChange(value ?? "")} value={value}><SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectLabel>{label}</SelectLabel>{children}</SelectGroup></SelectContent></Select></div>;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [events, setEvents] = useState(initialEvents);
  const [filter, setFilter] = useState<CalendarFilter>(initialFilter);
  const [participant, setParticipant] = useState("all");
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
  const assignedCount = new Set(events.map((event) => event.assignedToId).filter(Boolean)).size;

  function openCreate(selection?: DateSelectInfo) {
    if (!capabilities.canManageCalendar) return;
    const next = emptyDraft(selection?.start ?? new Date(), selection?.end ?? new Date(Date.now() + 3600000));
    if (selection) next.allDay = selection.allDay;
    setError(null);
    setDraft(next);
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
    setPending(true);
    setError(null);
    try {
      const payload = {
        title: draft.title,
        description: draft.description || null,
        startAt: new Date(draft.startAt).toISOString(),
        endAt: new Date(draft.endAt).toISOString(),
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
      setNotice("Impegno eliminato dal calendario.");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Eliminazione non riuscita.");
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
        description="Organizza eventi, task e scadenze registrate. Le priorita sono operative e configurate dall'Azienda."
        action={<div className="flex flex-wrap gap-2">
          <Button onClick={() => setIntegrationOpen(true)} variant="outline"><IconLink />Calendari esterni</Button>
          {capabilities.canCreateDeadlines ? <Link className={cn(buttonVariants({ variant: "outline" }))} href="/deadlines/new"><IconCalendarDue />Scadenza</Link> : null}
          {capabilities.canManageCalendar ? <Button onClick={() => openCreate()}><IconCalendarPlus />Nuovo impegno</Button> : null}
        </div>}
      />

      {notice ? <Alert><IconCalendarDue /><AlertTitle>Aggiornamento calendario</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert> : null}

      <section aria-label="Riepilogo calendario" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><IconCalendarPlus />Impegni</CardTitle></CardHeader><CardContent><strong className="text-2xl">{events.length}</strong><p className="text-xs text-muted-foreground">Eventi e task attivi</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><IconCalendarDue />Scadenze</CardTitle></CardHeader><CardContent><strong className="text-2xl">{deadlines.length}</strong><p className="text-xs text-muted-foreground">Subito visibili nel calendario</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><IconFlag />Priorita alte</CardTitle></CardHeader><CardContent><strong className="text-2xl">{urgentCount}</strong><p className="text-xs text-muted-foreground">Alte o urgenti</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><IconUsers />Persone</CardTitle></CardHeader><CardContent><strong className="text-2xl">{assignedCount}</strong><p className="text-xs text-muted-foreground">Con impegni assegnati</p></CardContent></Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="gap-4 border-b bg-muted/20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div><CardTitle>Agenda operativa</CardTitle><p className="mt-1 text-sm text-muted-foreground">Apri o trascina un impegno; seleziona uno spazio libero per pianificare le ore.</p></div>
            <div className="flex flex-wrap gap-2" aria-label="Filtri calendario">
              {([['all', 'Tutto'], ['deadlines', 'Scadenze'], ['tasks', 'Task'], ['priority', 'Priorita']] as const).map(([value, label]) => <Button key={value} onClick={() => setFilter(value)} size="sm" variant={filter === value ? "default" : "outline"}>{value === "all" ? <IconFilter /> : null}{label}</Button>)}
            </div>
          </div>
          {participants.length > 1 ? <SelectField label="Calendario persona" onValueChange={setParticipant} value={participant}><SelectItem value="all">Tutta l'Azienda</SelectItem>{participants.map((item) => <SelectItem key={item.id} value={item.id}>{item.label} · {roleLabels[item.role]}</SelectItem>)}</SelectField> : null}
        </CardHeader>
        <CardContent className="p-0">
          <div className={styles.calendar} data-empty={calendarEvents.length === 0 ? "true" : "false"}>
            <FullCalendar
              allDayText="Tutto il giorno"
              dayMaxEvents={3}
              editable={capabilities.canManageCalendar}
              eventClick={handleEventClick}
              eventDrop={persistMove}
              eventResize={persistMove}
              events={calendarEvents}
              firstDay={1}
              headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek" }}
              height="auto"
              initialView={initialFilter === "deadlines" ? "listMonth" : "dayGridMonth"}
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
            />
            {!calendarEvents.length ? <div className={styles.emptyOverlay}><IconCalendarDue /><strong>Nessun elemento per questo filtro</strong><span>Cambia filtro o aggiungi un nuovo impegno.</span></div> : null}
          </div>
        </CardContent>
      </Card>

      <Dialog onOpenChange={(open) => { if (!open) setDraft(null); }} open={Boolean(draft)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{draft?.id ? "Dettagli impegno" : "Nuovo impegno"}</DialogTitle><DialogDescription>Definisci orari, priorita, assegnatario e contesto operativo.</DialogDescription></DialogHeader>
          {draft ? <form className="grid gap-4" onSubmit={saveDraft}>
            {error ? <Alert variant="destructive"><AlertTitle>Operazione non riuscita</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2"><Label htmlFor="calendar-title">Titolo</Label><Input disabled={!canEditDraft || pending} id="calendar-title" maxLength={160} minLength={2} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required value={draft.title} /></div>
              <div className="grid gap-2"><Label htmlFor="calendar-start">Inizio</Label><Input disabled={!capabilities.canManageCalendar || pending} id="calendar-start" onChange={(event) => setDraft({ ...draft, startAt: event.target.value })} required type="datetime-local" value={draft.startAt} /></div>
              <div className="grid gap-2"><Label htmlFor="calendar-end">Fine</Label><Input disabled={!capabilities.canManageCalendar || pending} id="calendar-end" onChange={(event) => setDraft({ ...draft, endAt: event.target.value })} required type="datetime-local" value={draft.endAt} /></div>
              <SelectField disabled={!capabilities.canManageCalendar || pending} label="Tipo" onValueChange={(value) => setDraft({ ...draft, kind: value as EventDraft['kind'] })} value={draft.kind}><SelectItem value="EVENT">Evento</SelectItem><SelectItem value="TASK">Task</SelectItem></SelectField>
              <SelectField disabled={!capabilities.canManageCalendar || pending} label="Priorita" onValueChange={(value) => setDraft({ ...draft, priority: value as EventDraft['priority'] })} value={draft.priority}>{Object.entries(priorityLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectField>
              <SelectField disabled={!canEditDraft || pending} label="Stato" onValueChange={(value) => setDraft({ ...draft, status: value as EventDraft['status'] })} value={draft.status}>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectField>
              <SelectField disabled={!capabilities.canManageCalendar || pending} label="Assegnato a" onValueChange={(value) => setDraft({ ...draft, assignedToId: value === "none" ? "" : value })} value={draft.assignedToId || "none"}><SelectItem value="none">Nessun assegnatario</SelectItem>{participants.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectField>
              <SelectField disabled={!capabilities.canManageCalendar || pending} label="Cantiere" onValueChange={(value) => setDraft({ ...draft, jobSiteId: value === "none" ? "" : value })} value={draft.jobSiteId || "none"}><SelectItem value="none">Nessun cantiere</SelectItem>{jobSites.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectField>
              <div className="flex items-center gap-2 self-end pb-2"><Checkbox checked={draft.allDay} disabled={!capabilities.canManageCalendar || pending} id="calendar-all-day" onCheckedChange={(checked) => setDraft({ ...draft, allDay: checked === true })} /><Label htmlFor="calendar-all-day">Giornata intera</Label></div>
              <div className="grid gap-2 sm:col-span-2"><Label htmlFor="calendar-description">Descrizione</Label><Textarea disabled={!capabilities.canManageCalendar || pending} id="calendar-description" maxLength={4000} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={4} value={draft.description} /></div>
            </div>
            <DialogFooter>
              {draft.id && capabilities.canManageCalendar ? <Button disabled={pending} onClick={archiveDraft} type="button" variant="destructive">Elimina</Button> : null}
              <DialogClose render={<Button disabled={pending} type="button" variant="outline" />}>Annulla</DialogClose>
              {canEditDraft ? <Button disabled={pending} type="submit">{pending ? "Salvataggio..." : "Salva"}</Button> : null}
            </DialogFooter>
          </form> : null}
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={(open) => { if (!open) setSelectedDeadline(null); }} open={Boolean(selectedDeadline)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedDeadline?.title}</DialogTitle><DialogDescription>Scadenza registrata, mostrata automaticamente nel calendario.</DialogDescription></DialogHeader>
          {selectedDeadline ? <div className="grid gap-3"><Badge variant="info">Scadenza</Badge><p className="text-sm">Data: <strong>{new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(new Date(selectedDeadline.dueDate))}</strong></p><p className="text-sm text-muted-foreground">Le scadenze restano separate dagli eventi per conservare origine documentale, reminder e audit.</p></div> : null}
          <DialogFooter><DialogClose render={<Button variant="outline" />}>Chiudi</DialogClose>{capabilities.canCreateDeadlines ? <Link className={cn(buttonVariants())} href="/deadlines?mode=deadlines">Apri scadenze</Link> : null}</DialogFooter>
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
