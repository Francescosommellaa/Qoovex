import type { PasswordStrength } from "@qoovex/ui/components/password-input";

export function estimatePasswordStrength(password: string): PasswordStrength {
  if (!password) return { label: "Non valutata", value: 0 };
  if (password.length < 12) return { label: "Debole", value: 1 };

  const characterGroups = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (password.length >= 16 && characterGroups >= 3) {
    return { label: "Forte", value: 3 };
  }
  return { label: "Buona", value: 2 };
}
