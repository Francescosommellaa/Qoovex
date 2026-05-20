"use client";

import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { AuthShell as DsAuthShell, Box, Button, Icon, useTheme } from "@qoovex/ui";

interface AuthShellProps {
  title: string;
  subtitle?: ReactNode;
  steps?: { current: number; total: number };
  onBack?: () => void;
  children: ReactNode;
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
      title={title}
      subtitle={subtitle}
      steps={steps}
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
