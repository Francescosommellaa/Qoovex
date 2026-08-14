import { describe, expect, it } from "vitest";
import type { JobSiteStatus } from "@qoovex/types";
import {
  presentAttachmentCategory,
  presentChangeProposalStatus,
  presentAuditMetadataEntry,
  presentClosureStatus,
  presentJobSiteStatus,
  presentJobSiteStepStatus,
  presentJobSiteRequestType,
  presentDisputeStatus,
  presentMfaRecoveryStatus,
  presentParticipantKind,
  presentParticipantStatus,
  presentPaymentRequestStatus,
  presentProcessStatus,
  presentSearchResultDetail,
  presentSearchResultType,
} from "./product-state-presentation";

describe("product state presentation", () => {
  it("presents file categories without exposing storage enum values", () => {
    expect(presentAttachmentCategory("EXPENSE_RECEIPT")).toEqual({ label: "Ricevuta di spesa", tone: "neutral" });
    expect(presentAttachmentCategory("PAYMENT_RECEIPT")).toEqual({ label: "Ricevuta di pagamento", tone: "neutral" });
  });

  it("describes the verified lifecycle states with human Italian labels", () => {
    expect(presentJobSiteStatus("PENDING_INITIAL_CONFIRMATION")).toMatchObject({
      label: "Attende conferma del cliente",
      tone: "warning",
    });
    expect(presentJobSiteStatus("CLOSURE_PROPOSED")).toMatchObject({
      label: "Chiusura da confermare",
      tone: "warning",
    });
    expect(presentJobSiteStepStatus("WORK_COMPLETED")).toMatchObject({
      label: "Lavoro completato, da confermare",
      tone: "warning",
    });
    expect(presentPaymentRequestStatus("TRANSFER_DECLARED")).toMatchObject({
      label: "Invio dichiarato dal cliente",
      tone: "info",
    });
  });

  it("keeps identical enum values specific to their domain", () => {
    expect(presentJobSiteStatus("ACTIVE").label).toBe("Cantiere attivo");
    expect(presentParticipantStatus("ACTIVE").label).toBe("Accesso attivo");
    expect(presentProcessStatus("COMPLETED").label).toBe("Processo completato");
    expect(presentChangeProposalStatus("DRAFT").label).toBe("Bozza di proposta");
    expect(presentClosureStatus("DRAFT").label).toBe("Bozza di chiusura");
  });

  it("distingue il problema operativo dalla segnalazione di un disaccordo", () => {
    expect(presentJobSiteRequestType("ISSUE")).toEqual({ label: "Problema operativo", tone: "warning" });
    expect(presentDisputeStatus("OPEN")).toEqual({ label: "Disaccordo aperto", tone: "danger" });
    expect(presentDisputeStatus("RESOLVED_BY_AGREEMENT")).toEqual({ label: "Accordo registrato", tone: "good" });
  });

  it("presents participant kinds as people-facing roles", () => {
    expect(presentParticipantKind("ORGANIZATION_MEMBER").label).toBe("Membro dell'Azienda");
    expect(presentParticipantKind("CLIENT").label).toBe("Cliente");
  });

  it("keeps account security states in the shared presentation contract", () => {
    expect(presentMfaRecoveryStatus("SETUP_STARTED")).toEqual({ label: "Nuova configurazione avviata", tone: "info" });
  });

  it("does not expose an unexpected technical value", () => {
    const presentation = presentJobSiteStatus("FUTURE_INTERNAL_STATE" as JobSiteStatus);
    expect(presentation).toEqual({ label: "Stato non disponibile", tone: "neutral" });
    expect(presentation.label).not.toContain("FUTURE_INTERNAL_STATE");
  });

  it("presents technical search result metadata without leaking enum values", () => {
    expect(presentSearchResultType("timeline").label).toBe("Evento della timeline");
    expect(presentSearchResultDetail("proposal", "COUNTERED")).toBe("Controproposta presente");
    expect(presentSearchResultDetail("timeline", "STEP_READY_FOR_REVIEW")).toBe("Lavoro pronto per la conferma");
    expect(presentSearchResultDetail("payment", "FUTURE_PAYMENT_STATE")).toBe("Stato non disponibile");
  });

  it("presents enum values embedded in audit metadata", () => {
    expect(presentAuditMetadataEntry("participantKind", "ORGANIZATION_MEMBER")).toEqual({
      label: "Tipo di partecipante",
      value: "Membro dell'Azienda",
    });
    expect(presentAuditMetadataEntry("nextStatus", "ARCHIVED")).toEqual({ label: "Nuovo stato", value: "Archiviato" });
    expect(presentAuditMetadataEntry("futureKey", "FUTURE_INTERNAL_STATE")).toEqual({ label: "Dettaglio", value: "Valore non disponibile" });
  });

  it("presents monetary audit metadata in euros", () => {
    expect(presentAuditMetadataEntry("amountMinor", "125000")).toEqual({ label: "Importo", value: "1.250,00 €" });
    expect(presentAuditMetadataEntry("economicDeltaMinor", "-500")).toEqual({ label: "Variazione", value: "-5,00 €" });
  });

  it("presents file audit metadata without raw bytes or MIME codes", () => {
    expect(presentAuditMetadataEntry("size", 2_500_000)).toEqual({ label: "Dimensione file", value: "2,5 MB" });
    expect(presentAuditMetadataEntry("mimeType", "application/pdf")).toEqual({ label: "Formato file", value: "PDF" });
  });

  it("does not expose an unexpected identifier from audit metadata", () => {
    expect(presentAuditMetadataEntry("futureKey", "record_abc123")).toEqual({ label: "Dettaglio", value: "Valore non disponibile" });
  });

});
