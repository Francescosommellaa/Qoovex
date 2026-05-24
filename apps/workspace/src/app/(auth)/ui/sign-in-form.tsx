"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Button,
  Divider,
  Form,
  FormActions,
  FormControl,
  FormField,
  Input,
  Stack,
  Text,
  useToast,
} from "@qoovex/ui";
import { registerCredentialsAction } from "@shared/actions/auth-actions";
import { getSafeRedirectPath } from "@shared/lib/auth-flow";
import { normalizeUsernameInput } from "@shared/lib/username";
import { AuthShell } from "./AuthShell";

export function SignInForm({
  mode,
  devAuthEnabled = false,
  googleAuthEnabled = false,
}: {
  mode: "sign-in" | "sign-up";
  devAuthEnabled?: boolean;
  googleAuthEnabled?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDevSigningIn, setIsDevSigningIn] = useState(false);

  const isBusy = isSubmitting || isGoogleLoading || isDevSigningIn;
  const callbackUrl = getSafeRedirectPath(
    searchParams.get("callbackUrl") ?? searchParams.get("redirect_url"),
  );

  const title = mode === "sign-in" ? "Accedi al workspace" : "Crea il tuo account";
  const subtitle =
    mode === "sign-in"
      ? "Usa email o username con password, oppure continua con Google."
      : "Scegli username e password. Verificherai l'email con un codice.";

  async function handleCredentialsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "sign-up") {
        const result = await registerCredentialsAction({
          email: email.trim().toLowerCase(),
          username: normalizeUsernameInput(username),
          password,
          firstName,
          lastName,
        });

        if (!result.ok || !result.data) {
          toast({
            variant: "error",
            title: "Registrazione non completata",
            description: result.message,
          });
          return;
        }

        router.push(
          `/sign-in/verify?email=${encodeURIComponent(result.data.email)}`,
        );
        return;
      }

      const result = await signIn("credentials", {
        identifier: identifier.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast({
          variant: "error",
          title: "Accesso non riuscito",
          description:
            "Credenziali non valide, account non verificato o troppi tentativi.",
        });
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!googleAuthEnabled) {
      toast({
        variant: "warning",
        title: "Google non configurato",
        description:
          "Aggiungi GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET in apps/workspace/.env.local.",
      });
      return;
    }

    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  async function handleDevSignIn() {
    setIsDevSigningIn(true);

    try {
      const response = await fetch(
        `/api/dev-auth?redirect_url=${encodeURIComponent(callbackUrl)}`,
        { method: "POST" },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: unknown;
        } | null;
        toast({
          variant: "error",
          title: "Accesso sviluppo non disponibile",
          description:
            typeof payload?.error === "string"
              ? payload.error
              : "Verifica DEV_AUTH_SECRET in apps/workspace/.env.local.",
        });
        return;
      }

      const payload = (await response.json()) as { destination?: unknown };
      const destination =
        typeof payload.destination === "string" ? payload.destination : "/dashboard";

      window.location.assign(destination);
    } finally {
      setIsDevSigningIn(false);
    }
  }

  const alternateHref =
    mode === "sign-in"
      ? `/sign-up${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
      : `/sign-in${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <AuthShell title={title} subtitle={subtitle}>
      <Form
        variant="plain"
        layout="stack"
        density="comfortable"
        labelStyle="soft"
        noValidate
        onSubmit={handleCredentialsSubmit}
      >
        {mode === "sign-up" ? (
          <>
            <div className="grid gap-(--spacing-3) sm:grid-cols-2">
              <FormField label="Nome" required>
                <FormControl>
                  <Input
                    autoComplete="given-name"
                    disabled={isBusy}
                    value={firstName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setFirstName(event.target.value)
                    }
                  />
                </FormControl>
              </FormField>
              <FormField label="Cognome">
                <FormControl>
                  <Input
                    autoComplete="family-name"
                    disabled={isBusy}
                    value={lastName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setLastName(event.target.value)
                    }
                  />
                </FormControl>
              </FormField>
            </div>
            <FormField label="Username" required>
              <FormControl>
                <Input
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isBusy}
                  value={username}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setUsername(normalizeUsernameInput(event.target.value))
                  }
                />
              </FormControl>
            </FormField>
            <FormField label="Email" required>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="nome@esempio.com"
                  disabled={isBusy}
                  value={email}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(event.target.value)
                  }
                />
              </FormControl>
            </FormField>
          </>
        ) : (
          <FormField label="Email o username" required>
            <FormControl>
              <Input
                autoComplete="username"
                disabled={isBusy}
                value={identifier}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setIdentifier(event.target.value)
                }
              />
            </FormControl>
          </FormField>
        )}

        <FormField label="Password" required>
          <FormControl>
            <Input
              type="password"
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              showPasswordToggle
              showStrength={mode === "sign-up"}
              disabled={isBusy}
              value={password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(event.target.value)
              }
            />
          </FormControl>
        </FormField>

        {mode === "sign-in" ? (
          <div className="auth-inline-link-row">
            <Link className="auth-muted-link" href="/forgot-password">
              Password dimenticata?
            </Link>
          </div>
        ) : null}

        <FormActions align="stretch">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            loadingLabel={mode === "sign-in" ? "Accesso..." : "Creazione..."}
            disabled={isBusy}
            className="w-full"
          >
            {mode === "sign-in" ? "Accedi" : "Crea account"}
          </Button>
        </FormActions>
      </Form>

      <Divider spacing="lg">oppure</Divider>

      <Stack gap="3" className="auth-social-stack">
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="w-full"
          loading={isGoogleLoading}
          loadingLabel="Connessione Google..."
          disabled={isBusy}
          onClick={handleGoogleSignIn}
          iconLeft={
            <Image
              src="/auth/google-g.svg"
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
          }
        >
          Continua con Google
        </Button>
      </Stack>

      {devAuthEnabled ? (
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="w-full"
          loading={isDevSigningIn}
          loadingLabel="Accesso sviluppo..."
          disabled={isBusy}
          onClick={handleDevSignIn}
        >
          Entra in sviluppo
        </Button>
      ) : null}

      <Text className="auth-footer-text">
        {mode === "sign-in" ? (
          <>
            Non hai un account? <Link href={alternateHref}>Registrati</Link>
          </>
        ) : (
          <>
            Hai gia un account? <Link href={alternateHref}>Accedi</Link>
          </>
        )}
      </Text>
    </AuthShell>
  );
}
