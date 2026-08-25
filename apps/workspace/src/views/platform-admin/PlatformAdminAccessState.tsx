import Link from "next/link";
import { linkVariants } from "@qoovex/ui/components/link";
import { WorkspaceAccessState } from "@/views/workspace/WorkspacePrimitives";

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
  return <Link className={linkVariants({ variant: "primary" })} href="/qoovex-admin">Torna alla console</Link>;
}
