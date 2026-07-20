"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import itLocale from "@fullcalendar/react/locales/it";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import monarchTheme from "@fullcalendar/react/themes/monarch";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/monarch/theme.css";
import "@fullcalendar/react/themes/monarch/palettes/blue.css";
import { IconCalendarDue, IconCalendarPlus, IconFlag, IconUsers } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import styles from "./calendar-proof.module.css";

const today = new Date();
const day = (offset: number, hour = 9) => {
  const value = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour);
  return value.toISOString();
};

export function CalendarProof() {
  return <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Badge variant="outline">Dati dimostrativi</Badge><h1 className="mt-3 text-3xl font-semibold tracking-tight">Calendario operativo</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Proof Sirio delle viste mese, settimana, giorno e agenda, con scadenze, priorita e assegnazioni.</p></div><Button><IconCalendarPlus />Nuovo impegno</Button></header>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[[IconCalendarPlus, "Impegni", "8"], [IconCalendarDue, "Scadenze", "3"], [IconFlag, "Priorita alte", "2"], [IconUsers, "Persone", "4"]].map(([Icon, label, value]) => <Card key={String(label)}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Icon />{label as string}</CardTitle></CardHeader><CardContent><strong className="text-2xl">{value as string}</strong></CardContent></Card>)}
    </section>
    <Card className="overflow-hidden"><CardHeader className="border-b bg-muted/20"><CardTitle>Agenda operativa</CardTitle></CardHeader><CardContent className="p-3 md:p-4"><div className={styles.calendar}><FullCalendar allDayText="Tutto il giorno" dayMaxEvents={3} editable events={[
      { title: "Verifica documenti cantiere", start: day(0, 9), end: day(0, 11), backgroundColor: "var(--primary)", borderColor: "var(--primary)" },
      { title: "Scadenza attestazione", start: day(1, 0).slice(0, 10), allDay: true, backgroundColor: "var(--info)", borderColor: "var(--info)" },
      { title: "Task urgente · Mario Rossi", start: day(2, 14), end: day(2, 16), backgroundColor: "var(--destructive)", borderColor: "var(--destructive)" },
      { title: "Sopralluogo", start: day(4, 8), end: day(4, 12), backgroundColor: "var(--warning)", borderColor: "var(--warning)" },
    ]} firstDay={1} headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek" }} height="auto" locale={itLocale} nowIndicator plugins={[monarchTheme, dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]} selectable slotMaxTime="22:00:00" slotMinTime="06:00:00" /></div></CardContent></Card>
  </main>;
}
