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
  Text,
  useToast,
} from "@qoovex/ui";
import { getSafeRedirectPath } from "@shared/lib/auth-flow";
import { AuthShell } from "./AuthShell";

export function SignInForm({
  googleAuthEnabled = false,
}: {
  googleAuthEnabled?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const isBusy = isSubmitting || isGoogleLoading;
  const callbackUrl = getSafeRedirectPath(
    searchParams.get("callbackUrl") ?? searchParams.get("redirect_url"),
  );
  const alternateHref = `/sign-up${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  async function handleCredentialsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!identifier.trim() || !password) {
      toast({
        variant: "warning",
        title: "Dati richiesti",
        description: "Inserisci email o username e password.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
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
        description: "Aggiungi GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.",
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

  return (
    <AuthShell
      title="Accedi al workspace"
      subtitle="Inserisci le tue credenziali per accedere."
    >
      <Form
        variant="plain"
        layout="stack"
        density="comfortable"
        labelStyle="soft"
        noValidate
        onSubmit={handleCredentialsSubmit}
      >
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
        <FormField label="Password" required>
          <FormControl>
            <Input
              type="password"
              autoComplete="current-password"
              showPasswordToggle
              disabled={isBusy}
              value={password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(event.target.value)
              }
            />
          </FormControl>
        </FormField>
        <div className="auth-inline-link-row">
          <Link className="auth-muted-link" href="/forgot-password">
            Password dimenticata?
          </Link>
        </div>
        <FormActions align="stretch">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            loadingLabel="Accesso..."
            disabled={isBusy}
            className="w-full"
          >
            Accedi
          </Button>
        </FormActions>
      </Form>

      <Divider spacing="lg">oppure</Divider>

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
            src="/img/icona-google.png"
            alt="Google"
            width={16}
            height={16}
            aria-hidden="true"
            className="auth-google-icon"
          />
        }
      >
        Continua con Google
      </Button>

      <Text className="auth-footer-text">
        Non hai un account? <Link href={alternateHref}>Registrati</Link>
      </Text>
    </AuthShell>
  );
}
