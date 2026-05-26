"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
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
import { requestSignupEmailAction } from "@shared/actions/auth-actions";
import { getSafeRedirectPath, isLikelyValidEmail } from "@shared/lib/auth-flow";
import { AuthShell } from "./AuthShell";

export function SignUpEmailForm({
  googleAuthEnabled = false,
}: {
  googleAuthEnabled?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const isBusy = isSubmitting || isGoogleLoading;
  const callbackUrl = getSafeRedirectPath(
    searchParams.get("callbackUrl") ?? searchParams.get("redirect_url"),
  );
  const signInHref = `/sign-in${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!isLikelyValidEmail(normalizedEmail)) {
      toast({
        variant: "warning",
        title: "Email da controllare",
        description: "Inserisci una email valida per continuare.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestSignupEmailAction({ email: normalizedEmail });
      if (!result.ok || !result.data) {
        toast({
          variant: "error",
          title: "Registrazione non avviata",
          description: result.message,
        });
        return;
      }

      router.push(
        `/sign-up/verify?email=${encodeURIComponent(result.data.email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
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
      title="Crea il tuo account"
      subtitle="Inserisci la tua email per iniziare."
      steps={{ current: 1, total: 3, labels: ["Email", "Codice", "Credenziali"] }}
    >
      <Form
        variant="plain"
        layout="stack"
        density="comfortable"
        labelStyle="soft"
        noValidate
        onSubmit={handleSubmit}
      >
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
        <FormActions align="stretch">
          <Button
            type="submit"
            loading={isSubmitting}
            loadingLabel="Invio codice..."
            disabled={isBusy}
            className="w-full"
          >
            Procedi con email
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
            src="/img/icona-google.svg"
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

      <Text className="auth-footer-text">
        Hai gia un account? <Link href={signInHref}>Accedi</Link>
      </Text>
    </AuthShell>
  );
}
