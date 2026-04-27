import type { InputHTMLAttributes } from "react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  id: string;
}

export function AuthField({ label, error, hint, id, ...props }: AuthFieldProps) {
  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="auth-field__input"
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="auth-field__error" role="alert">
          {error}
        </span>
      )}
      {hint && !error && (
        <span id={`${id}-hint`} className="auth-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
}