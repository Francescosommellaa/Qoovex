import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
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
    <main className="auth-shell">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <Image
            src="/logo-icon/qoovex-icona-nera-sfondo-quadrato.svg"
            alt="Qoovex"
            width={40}
            height={40}
            className="auth-logo"
            priority
          />
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {steps && steps.total > 1 && (
            <div className="auth-steps" aria-label={`Step ${steps.current} di ${steps.total}`}>
              {Array.from({ length: steps.total }).map((_, i) => (
                <span
                  key={i}
                  className="auth-step-dot"
                  data-active={i === steps.current - 1 ? "true" : undefined}
                  data-done={i < steps.current - 1 ? "true" : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Back */}
        {onBack && (
          <button type="button" className="auth-back-btn" onClick={onBack}>
            <ArrowLeft size={14} weight="bold" aria-hidden="true" />
            Indietro
          </button>
        )}

        <div className="auth-form-scope">{children}</div>
      </div>
    </main>
  );
}