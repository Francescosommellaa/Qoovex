import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  icon?: ReactNode;
}

export function Button({ variant = "primary", icon, children, className = "", ...props }: ButtonProps) {
  return <button className={`qv-button ${className}`.trim()} data-variant={variant} {...props}>{icon}{children}</button>;
}

export function IconButton({ "aria-label": label, ...props }: ButtonProps & { "aria-label": string }) {
  return <Button className="qv-icon-button" aria-label={label} {...props} />;
}

interface FieldFrameProps { label: string; hint?: string; error?: string; children: ReactNode }
function FieldFrame({ label, hint, error, children }: FieldFrameProps) {
  return <label className="qv-field" data-invalid={Boolean(error)}><span>{label}</span>{children}{error ? <small role="alert">{error}</small> : hint ? <small>{hint}</small> : null}</label>;
}

export function TextField({ label, hint, error, ...props }: InputHTMLAttributes<HTMLInputElement> & Omit<FieldFrameProps, "children">) {
  return <FieldFrame label={label} hint={hint} error={error}><input {...props} /></FieldFrame>;
}

export function NumberField({ label, hint, error, ...props }: InputHTMLAttributes<HTMLInputElement> & Omit<FieldFrameProps, "children">) {
  return <FieldFrame label={label} hint={hint} error={error}><input inputMode="decimal" {...props} /></FieldFrame>;
}

export function TextAreaField({ label, hint, error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & Omit<FieldFrameProps, "children">) {
  return <FieldFrame label={label} hint={hint} error={error}><textarea {...props} /></FieldFrame>;
}

export function SelectField({ label, hint, error, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & Omit<FieldFrameProps, "children">) {
  return <FieldFrame label={label} hint={hint} error={error}><select {...props}>{children}</select></FieldFrame>;
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "ready" | "attention" | "critical"; children: ReactNode }) {
  return <span className="qv-badge" data-tone={tone}>{children}</span>;
}

export function InlineAlert({ tone = "attention", icon, title, children }: { tone?: "attention" | "critical"; icon?: ReactNode; title: string; children: ReactNode }) {
  return <div className="qv-alert" data-tone={tone} role={tone === "critical" ? "alert" : "status"}>{icon}<div><strong>{title}</strong><p>{children}</p></div></div>;
}

export function StatusControl({ checked, onChange, label, detail }: { checked: boolean; onChange: (checked: boolean) => void; label: string; detail?: string }) {
  return <label className="qv-team-row"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} /><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</label>;
}
