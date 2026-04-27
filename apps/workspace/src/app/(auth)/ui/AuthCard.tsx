import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <div className="auth-card__logo" aria-label="Qoovex">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" width="28" height="28">
            <circle cx="16" cy="16" r="14" stroke="var(--color-primary)" strokeWidth="2.5" />
            <path
              d="M10 16a6 6 0 1 1 8.485 5.485"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="3" fill="var(--color-primary)" />
          </svg>
          <span>Qoovex</span>
        </div>
        <h1 className="auth-card__title">{title}</h1>
        {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
      </div>
      <div className="auth-card__body">{children}</div>
      {footer && <div className="auth-card__footer">{footer}</div>}
    </div>
  );
}