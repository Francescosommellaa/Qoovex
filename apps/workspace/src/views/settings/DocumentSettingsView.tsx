"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Checkbox } from "@qoovex/ui";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import { DocumentRequirementsPanel } from "@/views/admin-core/documents/DocumentRequirementsPanel";
import { submitJson } from "@/views/admin-core/admin-api-client";
import type { WorkspaceDocumentTypeRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";
import styles from "@/views/admin-core/AdminCore.module.css";

const appliesToLabels = { ORGANIZATION: "Azienda", WORKER: "Lavoratori", JOB_SITE: "Cantieri", EVIDENCE: "Prove", OTHER: "Altro" } as const;

export function DocumentSettingsView({ canManage, documentTypes, jobSites }: { canManage: boolean; documentTypes: WorkspaceDocumentTypeRecord[]; jobSites: WorkspaceJobSiteRecord[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createType(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await submitJson("/api/document-types", "POST", {
        name: formData.get("name"),
        appliesTo: formData.get("appliesTo"),
        requiresExpiryDate: formData.get("requiresExpiryDate") === "on",
      });
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Creazione tipo documento non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Impostazioni documenti" description="Definisci le categorie operative e ciò che viene richiesto nei diversi contesti." />
      <WorkspacePanel title="Tipi documento" description="I tipi aiutano a precompilare il collegamento e indicano quando chiedere una scadenza.">
        <div className={styles.list}>
          {!documentTypes.length ? <WorkspaceEmptyState title="Nessun tipo documento" description="Aggiungi un tipo per rendere più rapido il caricamento dei documenti ricorrenti." /> : documentTypes.map((type) => (
            <article className={styles.record} key={type.id}>
              <div className={styles.recordMain}><strong>{type.name}</strong><span>Richiesto per: {appliesToLabels[type.appliesTo]}</span><small>{type.requiresExpiryDate ? "Scadenza richiesta" : "Scadenza facoltativa"}</small></div>
            </article>
          ))}
        </div>
        {canManage ? (
          <details className={styles.details}>
            <summary>Aggiungi tipo documento</summary>
            <form action={createType} className={styles.form}>
              {error ? <p className={styles.formError}>{error}</p> : null}
              <div className={styles.fieldGrid}>
                <label className={styles.field}><span>Nome</span><input name="name" required /></label>
                <label className={styles.field}><span>Richiesto per</span><select name="appliesTo"><option value="ORGANIZATION">Azienda</option><option value="WORKER">Lavoratori</option><option value="JOB_SITE">Cantieri</option><option value="EVIDENCE">Prove</option><option value="OTHER">Altro</option></select></label>
              </div>
              <label className={styles.checkboxField}><Checkbox name="requiresExpiryDate" /><span>Chiedi una scadenza per questo tipo</span></label>
              <button className={styles.button} disabled={pending} type="submit">{pending ? "Salvataggio..." : "Salva tipo"}</button>
            </form>
          </details>
        ) : null}
      </WorkspacePanel>
      <WorkspacePanel title="Requisiti documentali" description="Configura le mancanze operative da mostrare nei contesti corretti."><DocumentRequirementsPanel canManage={canManage} documentTypes={documentTypes} jobSites={jobSites} /></WorkspacePanel>
    </WorkspacePage>
  );
}
