"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrganizationRole } from "@qoovex/types";
import { submitJson } from "@/views/admin-core/admin-api-client";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import styles from "@/views/admin-core/AdminCore.module.css";

const options: Array<{ value: Exclude<OrganizationRole, "OWNER">; label: string; description: string }> = [
  { value: "ADMIN", label: "Amministratore", description: "Gestisce l'azienda e il lavoro quotidiano" },
  { value: "SAFETY_CONSULTANT", label: "Consulente", description: "Collabora su documenti, controlli e pacchetti" },
  { value: "SITE_MANAGER", label: "Responsabile cantiere", description: "Vede e aggiorna solo i cantieri assegnati" },
  { value: "WORKER", label: "Lavoratore", description: "Vede i propri elementi dopo l'associazione al profilo lavoratore" },
];

export function InvitePersonView({ invitableRoles }: { invitableRoles: Array<Exclude<OrganizationRole, "OWNER">> }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const visibleOptions = options.filter((option) => invitableRoles.includes(option.value));

  async function invite(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await submitJson("/api/organization/invitations", "POST", { email: formData.get("email"), role: formData.get("role") });
      router.push("/settings/people?result=invitation-sent");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invito non riuscito.");
      setPending(false);
    }
  }

  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Invita utente" description="L'account riceverà il ruolo scelto quando accetta l'invito. Il proprietario non può essere invitato." action={<Link className={styles.ghostButton} href="/settings/people">Annulla</Link>} />
      <WorkspacePanel title="Accesso all'azienda" description="L'invito scade dopo sette giorni.">
        <form action={invite} className={styles.form}>
          {error ? <p className={styles.formError}>{error}</p> : null}
          <label className={styles.field}><span>Email</span><input autoComplete="email" name="email" type="email" required /></label>
          <fieldset className={styles.field}><legend>Cosa deve poter fare?</legend>{visibleOptions.map((option, index) => <label className={styles.checkboxField} key={option.value}><input defaultChecked={index === 0} name="role" type="radio" value={option.value} /><span><strong>{option.label}</strong><br /><small>{option.description}</small></span></label>)}</fieldset>
          <button className={styles.button} disabled={pending || !visibleOptions.length} type="submit">{pending ? "Invio..." : "Invia invito"}</button>
        </form>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
