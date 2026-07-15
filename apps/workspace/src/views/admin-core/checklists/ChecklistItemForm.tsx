"use client";

import type { ChecklistItemStatus } from "@qoovex/types";
import { checklistItemStatuses } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, nullableFormValue, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { checklistItemStatusLabels } from "@/views/workspace/workspace-format";
import type { WorkspaceChecklistItemRecord } from "@/views/workspace/workspace-records";

interface ChecklistItemFormProps {
  checklistId: string;
  mode: "create" | "update";
  item?: WorkspaceChecklistItemRecord;
  disabled?: boolean;
}

export function ChecklistItemForm({ checklistId, mode, item, disabled }: ChecklistItemFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      label: formValue(formData, "label"),
      description: nullableFormValue(formData, "description"),
      status: formValue(formData, "status") ?? "OPEN",
    };

    try {
      await submitJson(mode === "create" ? `/api/checklists/${checklistId}/items` : `/api/checklists/${checklistId}/items/${item?.id}`, mode === "create" ? "POST" : "PATCH", payload);
      router.refresh();
      if (mode === "create") event.currentTarget.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Operazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <div className={styles.fieldGrid}>
        {mode === "update" ? <label className={styles.field}>
          <span>Etichetta voce</span>
          <input defaultValue={item?.label ?? ""} disabled={disabled || pending} maxLength={160} minLength={2} name="label" required />
        </label> : null}
        <label className={styles.field}>
          <span>Stato voce</span>
          <select defaultValue={item?.status ?? "OPEN"} disabled={disabled || pending} name="status">
            {checklistItemStatuses.filter((status): status is Exclude<ChecklistItemStatus, "ARCHIVED"> => status !== "ARCHIVED").map((status) => (
              <option key={status} value={status}>{checklistItemStatusLabels[status]}</option>
            ))}
          </select>
        </label>
      </div>
      <label className={styles.field}>
        <span>Descrizione</span>
        <textarea defaultValue={item?.description ?? ""} disabled={disabled || pending} maxLength={4000} name="description" />
      </label>
      <button className={styles.button} disabled={disabled || pending} type="submit">
        {pending ? "Salvataggio..." : mode === "create" ? "Aggiungi voce" : "Aggiorna voce"}
      </button>
    </form>
  );
}
