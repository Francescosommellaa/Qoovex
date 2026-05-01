"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@qoovex/ui";
import { getSafeAuthErrorMessage } from "@shared/lib/auth-error";

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
  const { fetchStatus: signUpFetchStatus } = useSignUp();

  const isLoading =
    mode === "signIn"
      ? fetchStatus === "fetching"
      : signUpFetchStatus === "fetching";
  const isUnavailable = !signIn;
  const config = providerConfig[provider];

  async function handleOAuthAuth() {
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
          redirectCallbackUrl: "/complete-profile",
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
        actionCompleteRedirectUrl: `${window.location.origin}/complete-profile`,
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
      className="w-full"
      aria-label={config.label[mode]}
      iconLeft={
        <Image
          src={config.logoSrc}
          alt=""
          width={16}
          height={16}
          unoptimized
          aria-hidden={true}
        />
      }
    >
      {config.label[mode]}
    </Button>
  );
}
