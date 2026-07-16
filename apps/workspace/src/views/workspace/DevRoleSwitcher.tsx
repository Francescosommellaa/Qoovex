"use client";

import { Field, FieldDescription, FieldError, FieldLabel } from "@qoovex/ui/components/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import type { OrganizationRole } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./WorkspaceShell.module.css";

const ROLE_OPTIONS: Array<{ label: string; value: OrganizationRole }> = [
  { label: "Proprietario", value: "OWNER" },
  { label: "Amministratore", value: "ADMIN" },
  { label: "Consulente sicurezza", value: "SAFETY_CONSULTANT" },
  { label: "Responsabile cantiere", value: "SITE_MANAGER" },
  { label: "Lavoratore", value: "WORKER" },
];

export function DevRoleSwitcher({ role }: { role: OrganizationRole }) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(role);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeRole(nextRole: OrganizationRole) {
    setSelectedRole(nextRole);
    setPending(true);
    setError(null);
    const response = await fetch("/api/dev-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    }).catch(() => null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null) as { error?: string } | null;
      setSelectedRole(role);
      setPending(false);
      setError(body?.error ?? "Cambio ruolo non disponibile.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <aside className={styles.devBanner} aria-label="Simulazione ruolo di sviluppo">
      <div className={styles.devIntro}>
        <strong>Modalità sviluppo</strong>
        <span>Il ruolo è simulato solo nella sessione locale. Membership e dati persistiti non cambiano.</span>
        <small>I ruoli con scope usano le assegnazioni della prima identità attiva con lo stesso ruolo; se manca, la vista risulta vuota.</small>
      </div>
      <Field className={styles.devField} data-invalid={Boolean(error)}>
        <FieldLabel htmlFor="dev-role">Vista ruolo</FieldLabel>
        <Select items={ROLE_OPTIONS} onValueChange={(value) => void changeRole(value as OrganizationRole)} value={selectedRole}>
          <SelectTrigger aria-describedby="dev-role-status" aria-invalid={Boolean(error)} disabled={pending} id="dev-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent><SelectGroup>{ROLE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        <FieldDescription className={styles.devStatus} id="dev-role-status" aria-live="polite">
          {pending ? "Aggiornamento vista in corso" : "Dashboard, navigazione e permessi seguono questo ruolo."}
        </FieldDescription>
        {error ? <FieldError>{error}</FieldError> : null}
      </Field>
    </aside>
  );
}
