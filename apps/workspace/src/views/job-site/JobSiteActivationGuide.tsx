import Link from "next/link";
import {
  IconArrowRight,
  IconCircle,
  IconCircleCheck,
  IconClock,
} from "@tabler/icons-react";
import { buttonVariants } from "@qoovex/ui/components/button";
import type { JobSiteStatus } from "@qoovex/types";
import { presentJobSiteStatus } from "@shared/lib/product-state-presentation";
import { WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";

type InitialAgreementStatus = "DRAFT" | "PENDING_CLIENT_CONFIRMATION" | "CONFIRMED" | "SUPERSEDED";
type ActivationStepState = "complete" | "current" | "waiting" | "upcoming";

type ActivationStep = {
  description: string;
  state: ActivationStepState;
  title: string;
};

type ActivationGuide = {
  action?: { href: string; label: string };
  description: string;
  steps: readonly ActivationStep[];
};

const stepPresentation = {
  complete: { Icon: IconCircleCheck, label: "Completato" },
  current: { Icon: IconArrowRight, label: "Da fare" },
  waiting: { Icon: IconClock, label: "In attesa del cliente" },
  upcoming: { Icon: IconCircle, label: "Passaggio successivo" },
} as const;

export function getJobSiteActivationGuide(
  status: JobSiteStatus,
  agreementStatus: InitialAgreementStatus | null,
): ActivationGuide | null {
  const created: ActivationStep = {
    title: "Cantiere creato",
    state: "complete",
    description: "Il cantiere è pronto per coinvolgere il cliente.",
  };

  switch (status) {
    case "DRAFT":
      return {
        description: "Per avviare il cantiere con il cliente, invia prima l'invito al cliente principale.",
        action: { href: "#client-invitation-form", label: "Invita il cliente" },
        steps: [
          created,
          { title: "Coinvolgi il cliente", state: "current", description: "Inserisci l'email del cliente principale e invia l'invito." },
          { title: "Conferma il riepilogo iniziale", state: "upcoming", description: "Dopo l'accettazione dell'invito, il cliente confermerà il riepilogo iniziale." },
        ],
      };
    case "WAITING_FOR_CLIENT":
      return {
        description: "L'invito è stato inviato. Il prossimo passaggio spetta al cliente.",
        steps: [
          created,
          { title: "Coinvolgi il cliente", state: "waiting", description: "Il cliente deve accettare l'invito ricevuto." },
          { title: "Conferma il riepilogo iniziale", state: "upcoming", description: "Dopo l'accettazione dell'invito, potrai pubblicare il riepilogo iniziale." },
        ],
      };
    case "PENDING_INITIAL_CONFIRMATION": {
      const summaryIsAwaitingClient = agreementStatus === "PENDING_CLIENT_CONFIRMATION";
      return {
        description: summaryIsAwaitingClient
          ? "Il riepilogo iniziale è pronto: il prossimo passaggio spetta al cliente."
          : "Il cliente ha accettato l'invito. Ora prepara il riepilogo iniziale da sottoporre alla sua conferma.",
        ...(summaryIsAwaitingClient ? {} : { action: { href: "#initial-agreement-form", label: "Pubblica il riepilogo iniziale" } }),
        steps: [
          created,
          { title: "Coinvolgi il cliente", state: "complete", description: "Il cliente ha accettato l'invito e può verificare il riepilogo iniziale." },
          summaryIsAwaitingClient
            ? { title: "Conferma il riepilogo iniziale", state: "waiting", description: "Il riepilogo è stato pubblicato e il cliente deve confermarlo." }
            : { title: "Conferma il riepilogo iniziale", state: "current", description: "Pubblica il riepilogo iniziale; il cliente potrà poi confermarlo o richiedere correzioni." },
        ],
      };
    }
    default:
      return null;
  }
}

export function JobSiteActivationGuide({
  agreementStatus,
  status,
}: {
  agreementStatus: InitialAgreementStatus | null;
  status: JobSiteStatus;
}) {
  const guide = getJobSiteActivationGuide(status, agreementStatus);
  if (!guide) return null;

  return <WorkspacePanel title="Attivazione del cantiere" description={guide.description}>
    <div className="space-y-4">
      <WorkspaceState state={presentJobSiteStatus(status)} />
      <ol className="grid gap-3 md:grid-cols-3">
        {guide.steps.map((step, index) => {
          const presentation = stepPresentation[step.state];
          const StepIcon = presentation.Icon;
          return <li aria-current={step.state === "current" ? "step" : undefined} className="flex gap-3 rounded-md border p-3" key={step.title}>
            <StepIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <div className="min-w-0"><p className="text-sm font-medium">{index + 1}. {step.title}</p><p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">{presentation.label}:</span> {step.description}</p></div>
          </li>;
        })}
      </ol>
      {guide.action ? <Link className={buttonVariants({ variant: "outline" })} href={guide.action.href}>{guide.action.label}<IconArrowRight aria-hidden="true" /></Link> : null}
    </div>
  </WorkspacePanel>;
}
