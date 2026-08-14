import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { presentOrganizationHomeRecentActivities } from "@shared/lib/organization-home-recent-activity";
import { OrganizationHomeRecentActivities } from "./OrganizationHomeRecentActivities";

const createdAt = new Date("2026-08-14T09:30:00.000Z");

describe("OrganizationHomeRecentActivities", () => {
  it("mostra attività timeline umane con deep link ed esclude quelle già nella work queue", () => {
    const activities = presentOrganizationHomeRecentActivities([{
      id: "attachment-internal",
      jobSiteId: "cucina",
      jobSiteName: "Ristrutturazione cucina",
      type: "EVIDENCE",
      actorKind: "CLIENT",
      title: "foto-avanzamento.jpg",
      body: null,
      payload: { attachmentId: "attachment-internal", schemaVersion: 1 },
      occurredAt: createdAt,
      createdAt,
    }, {
      id: "step-internal",
      jobSiteId: "cucina",
      jobSiteName: "Ristrutturazione cucina",
      type: "STEP_CONFIRMED",
      actorKind: "CLIENT",
      title: "Evento Qoovex",
      body: null,
      payload: { nextStatus: "CONFIRMED", previousStatus: "WORK_COMPLETED", schemaVersion: 1, stepId: "step-internal" },
      occurredAt: createdAt,
      createdAt,
    }, {
      id: "request-internal",
      jobSiteId: "cucina",
      jobSiteName: "Ristrutturazione cucina",
      type: "CLARIFICATION_REQUESTED",
      actorKind: "CLIENT",
      title: "Evento Qoovex",
      body: null,
      payload: { requestId: "request-internal", schemaVersion: 1, title: "Conferma consegna" },
      occurredAt: createdAt,
      createdAt,
    }], [{
      detail: "Conferma consegna",
      href: "/job-sites/cucina#richieste",
      id: "work-queue-request",
      jobSiteName: "Ristrutturazione cucina",
      kind: "REQUEST_NEEDS_RESPONSE",
      priority: "attention",
    }]);

    const html = renderToStaticMarkup(<OrganizationHomeRecentActivities activities={activities} />);

    expect(activities).toHaveLength(2);
    expect(activities.map((activity) => activity.href)).toEqual(["/job-sites/cucina#file", "/job-sites/cucina#step"]);
    expect(html).toContain("Attività recenti");
    expect(html).toContain("Ristrutturazione cucina");
    expect(html).toContain("Cliente");
    expect(html).toContain('href="/job-sites/cucina#file"');
    expect(html).toContain('href="/job-sites/cucina#step"');
    expect(html).not.toMatch(/EVIDENCE|STEP_CONFIRMED|CLARIFICATION_REQUESTED|attachment-internal|step-internal|request-internal/);
  });

  it("rende un empty state chiaro", () => {
    const html = renderToStaticMarkup(<OrganizationHomeRecentActivities activities={[]} />);

    expect(html).toContain("Nessuna attività recente");
    expect(html).toContain("Gli aggiornamenti dei cantieri compariranno qui");
  });
});
