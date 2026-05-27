"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  devAuthEnabled = false,
  googleAuthEnabled = false,
}: {
  devAuthEnabled?: boolean;
  googleAuthEnabled?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDevAuthLoading, setIsDevAuthLoading] = useState(false);
  const isBusy = isSubmitting || isGoogleLoading || isDevAuthLoading;
  const callbackUrl = getSafeRedirectPath(
    searchParams.get("callbackUrl") ?? searchParams.get("redirect_url"),
  );
  const alternateHref = `/sign-up${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const noticeShownRef = useRef(false);

  useEffect(() => {
    if (noticeShownRef.current) return;
    if (searchParams.get("notice") !== "account-exists") return;
    noticeShownRef.current = true;
    toast({
      variant: "warning",
      title: "Email gia registrata",
      description: "Usa il login per entrare con questa email.",
    });
  }, [searchParams, toast]);

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

  async function handleDevSignIn() {
    setIsDevAuthLoading(true);
    try {
      const response = await fetch(
        `/api/dev-auth?redirect_url=${encodeURIComponent(callbackUrl)}`,
        { method: "POST" },
      );

      if (!response.ok) {
        toast({
          variant: "error",
          title: "Accesso sviluppo non disponibile",
          description: "Verifica host locale e DEV_AUTH_SECRET.",
        });
        return;
      }

      const payload = (await response.json().catch(() => null)) as {
        destination?: unknown;
      } | null;
      window.location.assign(
        typeof payload?.destination === "string" ? payload.destination : "/dashboard",
      );
    } finally {
      setIsDevAuthLoading(false);
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
              placeholder="email@esempio.com oppure username"
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
              placeholder="La tua password"
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
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
            className="auth-google-icon"
          />
        }
      >
        Continua con Google
      </Button>

      {devAuthEnabled ? (
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="auth-dev-button w-full"
          loading={isDevAuthLoading}
          loadingLabel="Accesso sviluppo..."
          disabled={isBusy}
          onClick={handleDevSignIn}
        >
          Accedi come dev
        </Button>
      ) : null}

      <Text className="auth-footer-text">
        Non hai un account? <Link href={alternateHref}>Registrati</Link>
      </Text>
    </AuthShell>
  );
}
