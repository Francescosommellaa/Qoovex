import Link from "next/link";
import { IconAlertTriangle, IconArrowRight, IconBuilding, IconLogin2 } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardContent } from "@qoovex/ui/components/card";
import { cn } from "@qoovex/ui/lib/utils";
import { OrganizationSetupForm } from "./OrganizationSetupForm";
import styles from "./AuthPages.module.css";

function AccessStateCard({
  actions,
  children,
  description,
  icon: Icon,
  title,
  titleId,
}: {
  actions?: React.ReactNode;
  children?: React.ReactNode;
  description: string;
  icon: typeof IconLogin2;
  title: string;
  titleId: string;
}) {
  return (
    <main className={styles.accessPage}>
      <Card className={styles.accessCard}>
        <CardContent className={styles.accessCardContent}>
          <span className={styles.accessIcon}><Icon aria-hidden="true" /></span>
          <div className="grid gap-2">
            <h1 id={titleId}>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </CardContent>
      </Card>
    </main>
  );
}

export function SignInRequiredState({ callbackUrl = "/" }: { callbackUrl?: string }) {
  return (
    <AccessStateCard
      actions={(
        <>
          <Link className={cn(buttonVariants(), "h-11")} href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Accedi <IconArrowRight data-icon="inline-end" /></Link>
          <Link className={cn(buttonVariants({ variant: "outline" }), "h-11")} href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Crea account</Link>
        </>
      )}
      description="Per usare Qoovex serve un account. Dopo l’accesso potrai seguire cantieri, aggiornamenti, richieste e decisioni."
      icon={IconLogin2}
      title="Accedi al workspace"
      titleId="signin-required-title"
    />
  );
}

export function OrganizationRequiredState() {
  return (
    <AccessStateCard
      description="Crea l’Azienda con cui gestire i cantieri e collaborare con le persone coinvolte. Potrai invitarle in seguito."
      icon={IconBuilding}
      title="Configura la tua azienda"
      titleId="organization-required-title"
    >
      <OrganizationSetupForm />
    </AccessStateCard>
  );
}

export function DataConfigurationState() {
  return (
    <AccessStateCard
      description="Il workspace non può ancora leggere la configurazione dati richiesta. Nessun reset automatico viene eseguito."
      icon={IconAlertTriangle}
      title="Configurazione dati non pronta"
      titleId="data-config-title"
    >
      <Alert variant="warning"><IconAlertTriangle /><AlertTitle>Intervento tecnico richiesto</AlertTitle><AlertDescription>Verifica che le migration siano applicate sull’ambiente corretto prima di riprovare.</AlertDescription></Alert>
    </AccessStateCard>
  );
}
