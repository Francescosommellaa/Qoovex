import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { AuthShell as DsAuthShell, Box, Button, Icon } from "@qoovex/ui";

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
  return (
    <DsAuthShell
      title={title}
      subtitle={subtitle}
      steps={steps}
      logo={
        <Image
          src="/logo-icon/qoovex-icona-nera-sfondo-quadrato.svg"
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
