import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  WorkQueueItem,
  WorkQueueItemContent,
  WorkQueueItemDescription,
  WorkQueueItemTitle,
} from "@qoovex/ui/components/work-queue-item";
import { Avatar, AvatarBadge, AvatarFallback } from "@qoovex/ui/components/avatar";
import { Spinner } from "@qoovex/ui/components/spinner";
import { WorkspaceState } from "./WorkspacePrimitives";

describe("ridondanza semantica degli stati Workspace", () => {
  it("affianca alla label umana un indicatore non cromatico senza duplicarla per gli screen reader", () => {
    const states = [
      { label: "Operazione non riuscita", tone: "danger" },
      { label: "Richiede attenzione", tone: "warning" },
      { label: "Aggiornamento disponibile", tone: "info" },
      { label: "Operazione completata", tone: "good" },
    ] as const;

    const html = renderToStaticMarkup(<>{states.map((state) => <WorkspaceState key={state.tone} state={state} />)}</>);

    for (const state of states) expect(html).toContain(state.label);
    expect(html.match(/data-slot="workspace-state-icon"/g)).toHaveLength(states.length);
    const stateIcons = html.match(/<svg[^>]*data-slot="workspace-state-icon"[^>]*>/g) ?? [];
    expect(stateIcons).toHaveLength(states.length);
    expect(stateIcons.every((icon) => icon.includes('aria-hidden="true"'))).toBe(true);
  });

  it("rende esplicite le priorita attenzione e bloccante della work queue", () => {
    const html = renderToStaticMarkup(<>
      <WorkQueueItem priority="attention">
        <WorkQueueItemContent>
          <WorkQueueItemTitle>Conferma richiesta</WorkQueueItemTitle>
          <WorkQueueItemDescription>Il cliente deve controllare la proposta.</WorkQueueItemDescription>
        </WorkQueueItemContent>
      </WorkQueueItem>
      <WorkQueueItem priority="blocking">
        <WorkQueueItemContent>
          <WorkQueueItemTitle>Attivita bloccata</WorkQueueItemTitle>
          <WorkQueueItemDescription>Serve un intervento prima di continuare.</WorkQueueItemDescription>
        </WorkQueueItemContent>
      </WorkQueueItem>
    </>);

    expect(html).toContain("Richiede attenzione");
    expect(html).toContain("Bloccante");
    expect(html.match(/data-slot="work-queue-item-priority"/g)).toHaveLength(2);
    const priorityIcons = html.match(/<svg[^>]*data-slot="work-queue-item-priority-icon"[^>]*>/g) ?? [];
    expect(priorityIcons).toHaveLength(2);
    expect(priorityIcons.every((icon) => icon.includes('aria-hidden="true"'))).toBe(true);
  });

  it("distingue gli stati di presenza dell'avatar anche senza il colore", () => {
    const statuses = ["online", "away", "busy", "offline"] as const;
    const html = renderToStaticMarkup(<>{statuses.map((status) => (
      <Avatar key={status}>
        <AvatarFallback>MR</AvatarFallback>
        <AvatarBadge status={status} />
      </Avatar>
    ))}</>);

    for (const label of ["Online", "Assente", "Occupato", "Offline"]) {
      expect(html).toContain(`aria-label="${label}"`);
    }
    expect(html.match(/data-slot="avatar-status-icon"/g)).toHaveLength(statuses.length);
  });

  it("annuncia l'esito reale dello spinner invece del caricamento", () => {
    const html = renderToStaticMarkup(<>
      <Spinner status="success" />
      <Spinner status="error" />
    </>);

    expect(html).toContain('aria-label="Operazione completata"');
    expect(html).toContain('aria-label="Operazione non riuscita"');
    expect(html.match(/data-slot="spinner-status-icon"/g)).toHaveLength(2);
  });
});
