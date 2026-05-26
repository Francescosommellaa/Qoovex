"use client";

import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import {
  AuthShell as DsAuthShell,
  Box,
  Button,
  Icon,
  Text,
  useTheme,
} from "@qoovex/ui";
import type { AuthShellSteps } from "@qoovex/ui";

interface AuthShellProps {
  title: string;
  subtitle?: ReactNode;
  steps?: AuthShellSteps;
  onBack?: () => void;
  children: ReactNode;
}

const STEP_DESCRIPTIONS: Record<string, string> = {
  Account: "Indica l'account da verificare.",
  Codice: "Inserisci il codice ricevuto.",
  Credenziali: "Scegli username e password.",
  Email: "Inserisci l'email da verificare.",
  Google: "Autenticati con Google.",
  Username: "Completa il nome nel workspace.",
  Workspace: "Apri il tuo spazio operativo.",
};

function getStepLabel(label: ReactNode, index: number) {
  if (typeof label === "string" && label.trim()) return label;
  if (typeof label === "number") return String(label);

  return `Step ${index + 1}`;
}

function getPreviewSteps(steps?: AuthShellSteps) {
  if (!steps || steps.total <= 1) {
    return [];
  }

  return Array.from({ length: steps.total }).map((_, index) => {
    const stepNumber = index + 1;
    const label = getStepLabel(steps.labels?.[index], index);

    return {
      label,
      description:
        STEP_DESCRIPTIONS[label] ?? "Completa questo passaggio per proseguire.",
      state:
        stepNumber < steps.current
          ? "complete"
          : stepNumber === steps.current
            ? "current"
            : "pending",
    };
  });
}

function AuthPreviewPanel({ steps }: { steps?: AuthShellSteps }) {
  const previewSteps = getPreviewSteps(steps);

  return (
    <div className="auth-preview-panel qv-pixel-pattern-blue">
      <div className="auth-preview-content">
        <div className="auth-preview-brand">
          <Image
            src="/logo-icon/qoovex-icona-bianca-no-sfondo.svg"
            alt=""
            width={18}
            height={18}
            aria-hidden="true"
            className="auth-preview-logo"
          />
          <span>Qoovex</span>
        </div>
        <div className="auth-preview-copy">
          <Text
            as="h2"
            family="display"
            size="2xl"
            weight="semibold"
            leading="tight"
          >
            Il workspace segue il ritmo della cucina.
          </Text>
          <Text size="sm" tone="muted" leading="relaxed">
            Entra, riprendi il lavoro e porta ricette, menu e piani al servizio.
          </Text>
        </div>

        {previewSteps.length > 0 ? (
          <ol className="auth-preview-steps" aria-hidden="true">
            {previewSteps.map((step, index) => (
              <li key={`${step.label}-${index}`} data-state={step.state}>
                <span className="auth-preview-step-number">{index + 1}</span>
                <span className="auth-preview-step-body">
                  <span className="auth-preview-step-title">{step.label}</span>
                  <span className="auth-preview-step-description">
                    {step.description}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  steps,
  onBack,
  children,
}: AuthShellProps) {
  const { theme } = useTheme();
  const logoSrc =
    theme === "white"
      ? "/logo-icon/qoovex-icona-nera-no-sfondo.svg"
      : "/logo-icon/qoovex-icona-bianca-no-sfondo.svg";

  return (
    <DsAuthShell
      variant="split-open"
      title={title}
      subtitle={subtitle}
      steps={steps}
      aside={<AuthPreviewPanel steps={steps} />}
      logo={
        <Image
          src={logoSrc}
          alt="Qoovex"
          width={40}
          height={40}
          className="auth-logo"
          priority
        />
      }
      backAction={
        onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            iconLeft={<Icon icon={ArrowLeft} size="sm" weight="bold" />}
          >
            Indietro
          </Button>
        ) : undefined
      }
    >
      <Box className="auth-form-scope">{children}</Box>
    </DsAuthShell>
  );
}
