import "server-only";

import { AuthCodeError } from "@shared/server/auth-code-service";
import { AuthCredentialsError } from "@shared/server/auth-credentials-service";
import { PasswordValidationError } from "@shared/server/auth-password";
import { MfaError } from "@shared/server/mfa-service";
import { RateLimitExceededError } from "@shared/server/rate-limit";
import { UsernameValidationError } from "@shared/server/username-service";

function isConfigurationLeak(message: string) {
  const normalized = message.toLowerCase();
  return (
    message.includes("QOOVEX_") ||
    message.includes("AUTH_SECRET") ||
    message.includes("NEXTAUTH_SECRET") ||
    normalized.includes("segreto") ||
    normalized.includes("secret") ||
    normalized.includes("non configurat")
  );
}

function safeDomainMessage(message: string, fallback: string) {
  return isConfigurationLeak(message) ? fallback : message;
}

export function getSafeAuthActionMessage(error: unknown, fallback: string) {
  if (
    error instanceof AuthCredentialsError ||
    error instanceof RateLimitExceededError ||
    error instanceof UsernameValidationError
  ) {
    return safeDomainMessage(error.message, fallback);
  }

  if (
    error instanceof AuthCodeError ||
    error instanceof PasswordValidationError ||
    error instanceof MfaError
  ) {
    return safeDomainMessage(error.message, fallback);
  }

  return fallback;
}
