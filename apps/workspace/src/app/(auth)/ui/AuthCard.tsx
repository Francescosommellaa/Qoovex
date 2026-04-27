import Link from "next/link";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Indicatore step per il multi-step sign-up. Es: { current: 1, total: 2 } */
  steps?: { current: number; total: number };
  /** Callback per tornare allo step precedente */
  onBack?: () => void;
}

export function AuthCard({
  title,
  subtitle,
  children,
  steps,
  onBack,
}: AuthCardProps) {
  return (
    <div className="auth-shell">
      <div className="auth-card">

        {/* Back button — visibile solo se onBack è definito */}
        {onBack && (
          <button type="button" onClick={onBack} className="auth-back-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 256 256"
              fill="currentColor"
              aria-hidden="true"
            >
              {/* Phosphor ArrowLeft */}
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
            </svg>
            Indietro
          </button>
        )}

        {/* Step dots — visibili solo nel multi-step */}
        {steps && (
          <div className="auth-steps" aria-label={`Step ${steps.current} di ${steps.total}`}>
            {Array.from({ length: steps.total }, (_, i) => (
              <span
                key={i}
                className="auth-step-dot"
                data-active={i + 1 === steps.current ? "true" : undefined}
                data-done={i + 1 < steps.current ? "true" : undefined}
              />
            ))}
          </div>
        )}

        {/* Header */}
        <div className="auth-header">
          {/* Logo SVG inline — asset brand */}
          <Link href="https://qoovex.com" aria-label="Torna al sito Qoovex">
            <svg
              className="auth-logo"
              viewBox="0 0 40 40"
              fill="none"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="40" height="40" rx="10" fill="currentColor" opacity="0.08" />
              <text
                x="50%"
                y="54%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontWeight="700"
                fontSize="18"
                fill="currentColor"
              >
                Q
              </text>
            </svg>
          </Link>

          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>

        {/* Contenuto della pagina (form, bottoni, etc.) */}
        {children}

      </div>
    </div>
  );
}