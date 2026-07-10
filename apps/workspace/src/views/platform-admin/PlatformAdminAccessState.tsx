import Link from "next/link";
import { WorkspaceAccessState } from "@/views/workspace/WorkspacePrimitives";
import styles from "./PlatformAdmin.module.css";

export function PlatformAdminAccessState({ mfaRequired = false }: { mfaRequired?: boolean }) {
  if (!mfaRequired) return <WorkspaceAccessState title="Console non disponibile" description="Questa sezione e riservata agli operatori Qoovex." />;
  return (
    <WorkspaceAccessState
      title="Conferma MFA richiesta"
      description="Completa o conferma l'autenticazione a due fattori dalla panoramica della Console Qoovex."
    />
  );
}

export function PlatformAdminBackLink() {
  return <Link className={styles.linkButton} href="/qoovex-admin">Torna alla console</Link>;
}
