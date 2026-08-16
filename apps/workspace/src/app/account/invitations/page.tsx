import Link from "next/link";
import { IconBuilding, IconLink, IconMail } from "@tabler/icons-react";
import { buttonVariants } from "@qoovex/ui/components/button";
import { cn } from "@qoovex/ui/lib/utils";
import { requireAccountRole } from "@shared/server/account-role-service";
import { AuthPageShell, AuthStage } from "@/views/auth/AuthPageShell";

export default async function AccountInvitationsPage() {
  const professional = await requireAccountRole("PROFESSIONAL");

  const invitationSteps = [
    {
      title: "L’Azienda ti invita",
      description: <>L’invito deve essere inviato a <strong className="font-medium text-foreground [overflow-wrap:anywhere]">{professional.email}</strong>.</>,
      icon: IconBuilding,
    },
    {
      title: "Apri il link ricevuto",
      description: <>Nel link vedrai quale Azienda ti invita e potrai accettare l’accesso.</>,
      icon: IconMail,
    },
    {
      title: "Entra nei lavori assegnati",
      description: <>Dopo l’accettazione e un nuovo accesso, vedrai soltanto i lavori e le funzioni inclusi nell’invito.</>,
      icon: IconLink,
    },
  ] as const;

  return (
    <AuthPageShell
      as="div"
      description={<p>Non vedi ancora lavori perché il tuo account Professionista non è collegato a un’Azienda. L’accesso si attiva quando accetti un invito.</p>}
      kicker="Accesso Professionista"
      title="Il tuo accesso parte da un invito"
      titleId="professional-invitation-title"
    >
      <AuthStage className="space-y-6">
        <section aria-labelledby="professional-invitation-steps-title" className="min-w-0">
          <h2 className="font-medium" id="professional-invitation-steps-title">Come entrerai in un lavoro</h2>
          <ol className="mt-4 space-y-4">
            {invitationSteps.map(({ description, icon: Icon, title }, index) => (
              <li className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3" key={title}>
                <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-medium"><span className="sr-only">Passaggio {index + 1}: </span>{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="professional-invitation-help-title" className="border-t pt-5">
          <h2 className="font-medium" id="professional-invitation-help-title">Non hai ricevuto l’invito?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Controlla anche la posta indesiderata. Se il messaggio non arriva, chiedi all’Azienda di verificare l’indirizzo
            <strong className="font-medium text-foreground [overflow-wrap:anywhere]"> {professional.email}</strong> e di inviare nuovamente l’invito.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Per accettarlo serve il link contenuto nel messaggio: Qoovex non permette di cercare o richiedere lavori liberamente.</p>
        </section>

        <div className="border-t pt-5">
          <Link className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full")} href="/account/security">Sicurezza account</Link>
        </div>
      </AuthStage>
    </AuthPageShell>
  );
}
