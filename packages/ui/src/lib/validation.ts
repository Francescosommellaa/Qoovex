export type Validator = (value: string) => string | null;

export function validateField(
  value: string,
  ...validators: Validator[]
): string | null {
  for (const v of validators) {
    const error = v(value);
    if (error) return error;
  }
  return null;
}

export const validators = {
  required: (label: string): Validator => (v) =>
    v.trim() ? null : `${label} e obbligatorio.`,

  minLength: (min: number, label: string): Validator => (v) =>
    v.length >= min ? null : `${label} deve avere almeno ${min} caratteri.`,

  maxLength: (max: number, label: string): Validator => (v) =>
    v.length <= max ? null : `${label} non puo superare ${max} caratteri.`,

  email: (): Validator => (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Email non valida.",

  pattern: (regex: RegExp, message: string): Validator => (v) =>
    regex.test(v) ? null : message,

  matches: (otherValue: string, label: string): Validator => (v) =>
    v === otherValue ? null : `${label} non corrisponde.`,
};
