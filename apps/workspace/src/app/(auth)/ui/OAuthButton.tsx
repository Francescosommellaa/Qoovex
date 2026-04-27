"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { Button } from "@qoovex/ui";

interface OAuthButtonProps {
  mode: "signIn" | "signUp";
  provider?: "google" | "apple";
  onError?: (message: string) => void;
}

const providerConfig = {
  google: {
    strategy: "oauth_google" as const,
    label: {
      signIn: "Accedi con Google",
      signUp: "Registrati con Google",
    },
    logoSrc: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
    logoAlt: "Google",
  },
  apple: {
    strategy: "oauth_apple" as const,
    label: {
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
  onError,
}: OAuthButtonProps) {
  const { signIn, fetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();

  const isLoading =
    mode === "signIn"
      ? fetchStatus === "fetching"
      : signUpFetchStatus === "fetching";
  const isUnavailable = mode === "signIn" ? !signIn : !signUp;
  const config = providerConfig[provider];

  async function handleOAuthAuth() {
    if (isUnavailable) {
      onError?.("Autenticazione non pronta. Riprova tra un attimo.");
      return;
    }

    try {
      if (mode === "signIn") {
        const { error } = await signIn.sso({
          strategy: config.strategy,
          redirectUrl: `${window.location.origin}/sso-callback`,
          redirectCallbackUrl: "/",
        });

        if (error) {
          onError?.(error.message ?? "Accesso OAuth non riuscito.");
        }
        return;
      }

      const { error } = await signUp.sso({
        strategy: config.strategy,
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectCallbackUrl: "/",
      });

      if (error) {
        onError?.(error.message ?? "Registrazione OAuth non riuscita.");
      }
    } catch (runtimeError: unknown) {
      const message =
        runtimeError instanceof Error
          ? runtimeError.message
          : "Errore inatteso durante OAuth. Riprova.";
      onError?.(message);
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
      className="w-full"
      aria-label={config.label[mode]}
      iconLeft={
        <img src={config.logoSrc} alt={config.logoAlt} width={16} height={16} />
      }
    >
      {config.label[mode]}
    </Button>
  );
}