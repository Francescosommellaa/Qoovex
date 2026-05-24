"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@qoovex/ui";
import { getSafeAuthErrorMessage } from "@shared/lib/auth-error";

interface OAuthButtonProps {
  mode: "signIn" | "signUp";
  provider?: "google" | "apple";
  disabledReason?: string;
  onError?: (message: string) => void;
}

const providerConfig = {
  google: {
    strategy: "oauth_google" as const,
    label: {
      signIn: "Google",
      signUp: "Google",
    },
    ariaLabel: {
      signIn: "Accedi con Google",
      signUp: "Registrati con Google",
    },
    logoSrc: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
    logoAlt: "Google",
  },
  apple: {
    strategy: "oauth_apple" as const,
    label: {
      signIn: "Apple",
      signUp: "Apple",
    },
    ariaLabel: {
      signIn: "Accedi con Apple",
      signUp: "Registrati con Apple",
    },
    logoSrc: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    logoAlt: "Apple",
  },
};

export function OAuthButton({
  mode,
  provider = "google",
  disabledReason,
  onError,
}: OAuthButtonProps) {
  const { signIn, fetchStatus } = useSignIn();
  const { fetchStatus: signUpFetchStatus } = useSignUp();

  const isLoading =
    mode === "signIn"
      ? fetchStatus === "fetching"
      : signUpFetchStatus === "fetching";
  const isUnavailable = !signIn || Boolean(disabledReason);
  const config = providerConfig[provider];

  async function handleOAuthAuth() {
    if (disabledReason) return;

    if (isUnavailable) {
      onError?.("Autenticazione non pronta. Riprova tra un attimo.");
      return;
    }

    try {
      await signIn.reset();

      if (mode === "signIn") {
        const { error } = await signIn.sso({
          strategy: config.strategy,
          redirectUrl: `${window.location.origin}/sso-callback`,
          redirectCallbackUrl: "/dashboard",
        });

        if (error) {
          onError?.(
            getSafeAuthErrorMessage(error, "Accesso OAuth non riuscito."),
          );
        }
        return;
      }

      const { error } = await signIn.create({
        strategy: config.strategy,
        redirectUrl: `${window.location.origin}/sso-callback`,
        actionCompleteRedirectUrl: `${window.location.origin}/dashboard`,
        signUpIfMissing: true,
      });

      if (error) {
        onError?.(
          getSafeAuthErrorMessage(error, "Registrazione OAuth non riuscita."),
        );
      }
    } catch (runtimeError: unknown) {
      onError?.(
        getSafeAuthErrorMessage(
          runtimeError,
          "Errore inatteso durante OAuth. Riprova.",
        ),
      );
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="md"
      onClick={handleOAuthAuth}
      disabled={isLoading || isUnavailable}
      loading={isLoading}
      className="auth-oauth-button w-full"
      aria-label={config.ariaLabel[mode]}
      iconLeft={
        <Image
          src={config.logoSrc}
          alt=""
          width={16}
          height={16}
          className="h-auto w-4"
          unoptimized
          aria-hidden={true}
        />
      }
    >
      {config.label[mode]}
    </Button>
  );
}
