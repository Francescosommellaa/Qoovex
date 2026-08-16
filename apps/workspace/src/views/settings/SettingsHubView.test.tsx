import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { WorkspaceCapabilities } from "@/views/workspace/workspace-records";
import { SettingsHubView } from "./SettingsHubView";

function capabilities(role: WorkspaceCapabilities["role"]): WorkspaceCapabilities {
  return {
    role,
    accessPreset: null,
    canManageCore: role === "OWNER",
    canCreateWorkers: false,
    canCreateJobSites: false,
    canReadAssignments: false,
    canManageAssignments: false,
    canReadMembers: true,
    canManageMembers: role === "OWNER",
    canReadNotifications: true,
    canReadAudit: role === "OWNER",
    canReadDataControl: role === "OWNER",
    canReadOrganizationProfile: true,
    canUpdateOrganizationProfile: role === "OWNER",
  };
}

describe("SettingsHubView", () => {
  it("rende il profilo pagamento raggiungibile dall'hub per il Titolare", () => {
    const html = renderToStaticMarkup(<SettingsHubView capabilities={capabilities("OWNER")} />);

    expect(html).toContain('href="/payment-profile"');
    expect(html).toContain("Profilo pagamento");
    expect(html).toContain("La modifica richiede MFA");
    expect(html).toContain("Azienda e impostazioni");
    expect(html).toContain("Collaboratori e inviti");
    expect(html).toContain("Account personale");
    expect(html).toContain("Dati e controllo");
    expect(html).toContain('href="/account/notifications"');
    expect(html).not.toContain('href="/notifications"');
  });

  it("non propone una configurazione non accessibile al Collaboratore", () => {
    const html = renderToStaticMarkup(<SettingsHubView capabilities={capabilities("COLLABORATOR")} />);

    expect(html).not.toContain('href="/payment-profile"');
    expect(html).not.toContain("Dati e controllo");
    expect(html).toContain("Account personale");
  });
});
