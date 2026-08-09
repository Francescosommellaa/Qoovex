import Link from "next/link";
import { buttonVariants } from "@qoovex/ui/components/button";
import { cn } from "@qoovex/ui/lib/utils";
import { requireAccountRole } from "@shared/server/account-role-service";
import { AuthPageShell, AuthStage } from "@/views/auth/AuthPageShell";

export default async function AccountInvitationsPage() {
  await requireAccountRole("PROFESSIONAL");
  return (
    <AuthPageShell
      description={<p>Un Professionista entra nei cantieri solo tramite invito. Apri il link ricevuto per accettare l'accesso compatibile con il tuo account.</p>}
      kicker="Accesso Professionista"
      title="In attesa di invito"
      titleId="professional-invitation-title"
    >
      <AuthStage>
        <Link className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full")} href="/account/security">Gestisci sicurezza account</Link>
      </AuthStage>
    </AuthPageShell>
  );
}
