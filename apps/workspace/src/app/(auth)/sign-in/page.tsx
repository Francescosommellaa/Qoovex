"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react";
import {
  Button,
  Input,
  Form,
  FormField,
  FormControl,
  FormActions,
} from "@qoovex/ui";
import { AuthShell, OAuthButton } from "../ui";

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);

  const isLoading = fetchStatus === "fetching";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError(null);

    const { error } = await signIn.password({ emailAddress: email, password });

    if (error) {
      setGlobalError(error.message ?? "Credenziali non valide. Riprova.");
      return;
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setGlobalError(finalizeError.message ?? "Errore durante il login.");
        return;
      }
      router.push("/");
    }
  }

  // Errori field-level da Clerk signals
  const identifierError =
    errors.fields.identifier?.message ?? errors.fields.password?.message ?? null;
  const globalClerkError = errors.global?.[0]?.message ?? null;
  const displayError = globalError ?? globalClerkError ?? identifierError;

  return (
    <AuthShell title="Bentornato" subtitle="Accedi al tuo workspace">
      {/* OAuth */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
        <OAuthButton mode="signIn" provider="google" onError={setGlobalError} />
        <OAuthButton mode="signIn" provider="apple" onError={setGlobalError} />
      </div>

      <div className="auth-divider">oppure</div>

      {displayError && (
        <div className="auth-error-banner" role="alert">
          <WarningCircle size={16} weight="bold" aria-hidden="true" />
          {displayError}
        </div>
      )}

      <Form
        variant="plain"
        layout="stack"
        density="comfortable"
        labelStyle="soft"
        onSubmit={handleSubmit}
      >
        <FormField label="Email" required>
          <FormControl>
            <Input
              type="email"
              placeholder="nome@esempio.com"
              autoComplete="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </FormControl>
        </FormField>

        <FormField label="Password" required>
          <FormControl>
            <Input
              type="password"
              placeholder="La tua password"
              autoComplete="current-password"
              showPasswordToggle
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </FormControl>
        </FormField>

        <div style={{ textAlign: "right", marginTop: "calc(var(--spacing-1) * -1)" }}>
          <Link
            href="/forgot-password"
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              textDecoration: "none",
            }}
          >
            Password dimenticata?
          </Link>
        </div>

        <FormActions align="stretch">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isLoading}
            className="w-full"
          >
            Accedi
          </Button>
        </FormActions>
      </Form>

      <p className="auth-footer-text">
        Non hai un account? <Link href="/sign-up">Registrati</Link>
      </p>
    </AuthShell>
  );
}