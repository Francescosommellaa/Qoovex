import type { ReactNode } from "react";
import {
  IconFingerprint,
  IconKey,
  IconLockCheck,
  IconMailCheck,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardContent } from "@qoovex/ui/components/card";
import { cn } from "@qoovex/ui/lib/utils";
import { WorkspaceBrandMark } from "../../components/workspace-brand-mark";
import styles from "./AuthPages.module.css";

interface AuthStep {
  label: string;
}

function AuthSteps({ current, steps }: { current: number; steps: AuthStep[] }) {
  return (
    <ol aria-label={`Passaggio ${current} di ${steps.length}`} className={styles.steps}>
      {steps.map((step, index) => {
        const number = index + 1;
        const state = number < current ? "complete" : number === current ? "current" : "upcoming";
        return (
          <li aria-current={state === "current" ? "step" : undefined} data-state={state} key={step.label}>
            <span aria-hidden="true" className={styles.stepMarker}>
              {state === "complete" ? <IconShieldCheck /> : number}
            </span>
            <span>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function AuthTrustPanel() {
  const points = [
    {
      icon: IconMailCheck,
      title: "Identità verificata",
      description: "Email e credenziali vengono controllate prima dell’ingresso nel workspace.",
    },
    {
      icon: IconFingerprint,
      title: "MFA legata alla sessione",
      description: "Quando è attiva, la conferma protegge l’intera sessione di lavoro.",
    },
    {
      icon: IconKey,
      title: "Recupero senza scorciatoie",
      description: "Il recupero autorizza un nuovo fattore e non disattiva la protezione esistente.",
    },
  ];

  return (
    <aside aria-label="Protezione dell’accesso" className={styles.trustPanel}>
      <div className={styles.trustIcon}><IconLockCheck aria-hidden="true" /></div>
      <div>
        <p className={styles.trustEyebrow}>Protezione dell’account</p>
        <h2>Un accesso chiaro, senza passaggi nascosti.</h2>
        <p className={styles.trustLead}>Ogni verifica spiega cosa accade e quale sarà il passaggio successivo.</p>
      </div>
      <ul className={styles.trustList}>
        {points.map(({ icon: Icon, title, description }) => (
          <li key={title}>
            <span className={styles.trustPointIcon}><Icon aria-hidden="true" /></span>
            <span><strong>{title}</strong><small>{description}</small></span>
          </li>
        ))}
      </ul>
      <p className={styles.trustFootnote}>Credenziali, codici e segreti non compaiono nelle viste di supporto.</p>
    </aside>
  );
}

export function AuthPageShell({
  children,
  className,
  currentStep,
  description,
  footer,
  kicker = "Workspace Qoovex",
  steps,
  title,
  titleId,
}: {
  children: ReactNode;
  className?: string;
  currentStep?: number;
  description: ReactNode;
  footer?: ReactNode;
  kicker?: string;
  steps?: AuthStep[];
  title: string;
  titleId: string;
}) {
  return (
    <main className={styles.authPage}>
      <div aria-hidden="true" className={styles.authBackdrop} />
      <div className={styles.authContainer}>
        <Card className={cn(styles.authCard, className)}>
          <CardContent className={styles.authCardContent}>
            <section aria-labelledby={titleId} className={styles.authFormPanel}>
              <div className={styles.authBrandRow}>
                <WorkspaceBrandMark />
                <Badge variant="outline">{kicker}</Badge>
              </div>
              <header className={styles.authHeader}>
                <h1 id={titleId}>{title}</h1>
                <div data-link-scope="inline">{description}</div>
              </header>
              {steps && currentStep ? <AuthSteps current={currentStep} steps={steps} /> : null}
              <div className={styles.authBody}>{children}</div>
              {footer ? <footer className={styles.authFooter} data-link-scope="inline">{footer}</footer> : null}
            </section>
            <AuthTrustPanel />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function AuthStage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(styles.authStage, className)}>{children}</div>;
}

export const credentialSteps: AuthStep[] = [
  { label: "Email" },
  { label: "Verifica" },
  { label: "Credenziali" },
];

export const resetSteps: AuthStep[] = [
  { label: "Email" },
  { label: "Nuova password" },
];
