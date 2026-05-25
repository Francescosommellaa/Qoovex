"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ChartLineUp,
  EnvelopeSimple,
  ShieldCheck,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import {
  AuthShell as DsAuthShell,
  Badge,
  Box,
  Button,
  Icon,
  Stack,
  Text,
  useTheme,
} from "@qoovex/ui";

interface AuthShellProps {
  title: string;
  subtitle?: ReactNode;
  steps?: { current: number; total: number };
  onBack?: () => void;
  children: ReactNode;
}

function AuthPreviewPanel() {
  return (
    <div className="auth-preview-panel">
      <Stack gap="5">
        <div className="auth-preview-header">
          <Text family="display" size="2xl" weight="semibold" leading="tight">
            Accesso pulito, workspace protetto.
          </Text>
          <Text size="sm" tone="muted" leading="relaxed">
            Qoovex prepara ricette, menu e piani di lavoro senza mettere attrito
            tra lo chef e la dashboard.
          </Text>
        </div>
        <div className="auth-preview-window">
          <div className="auth-preview-window__bar">
            <span />
            <span />
            <span />
          </div>
          <Stack gap="4" className="auth-preview-window__body">
            <div className="auth-preview-stat">
              <Icon icon={ShieldCheck} size="md" weight="duotone" />
              <div>
                <Text size="sm" weight="semibold">
                  A2F pronta al login
                </Text>
                <Text size="xs" tone="muted">
                  TOTP, backup code e sessione verificata.
                </Text>
              </div>
              <Badge tone="success">attiva</Badge>
            </div>
            <div className="auth-preview-stat">
              <Icon icon={EnvelopeSimple} size="md" weight="duotone" />
              <div>
                <Text size="sm" weight="semibold">
                  Codici via email
                </Text>
                <Text size="xs" tone="muted">
                  Verifica, reset e sicurezza con Resend.
                </Text>
              </div>
              <Badge tone="primary">6 cifre</Badge>
            </div>
            <div className="auth-preview-chart">
              <div>
                <Icon icon={ChartLineUp} size="md" weight="duotone" />
                <Text size="sm" weight="semibold">
                  Dashboard pronta
                </Text>
              </div>
              <div className="auth-preview-bars">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </Stack>
        </div>
      </Stack>
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
      variant="split"
      title={title}
      subtitle={subtitle}
      steps={steps}
      aside={<AuthPreviewPanel />}
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
