"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Input,
  Form,
  FormField,
  FormControl,
  FormActions,
  useToast,
} from "@qoovex/ui";
import { AuthShell, OAuthButton } from "../ui";

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCredentialsInvalid, setIsCredentialsInvalid] = useState(false);
  const [warningFields, setWarningFields] = useState<{
    email: boolean;
    password: boolean;
  }>({
    email: false,
    password: false,
  });

  const isLoading = fetchStatus === "fetching";

  function notifyAuthFailure() {
    toast({
      variant: "error",
      title: "Accesso non riuscito",
      description: "Credenziali non valide oppure account non disponibile.",
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsCredentialsInvalid(false);

    const nextWarnings = {
      email: email.trim() === "",
      password: password.trim() === "",
    };
    setWarningFields(nextWarnings);

    if (nextWarnings.email || nextWarnings.password) {
      setIsCredentialsInvalid(true);
      notifyAuthFailure();
      return;
    }

    const { error } = await signIn.password({ emailAddress: email, password });

    if (error) {
      setIsCredentialsInvalid(true);
      notifyAuthFailure();
      return;
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setIsCredentialsInvalid(true);
        notifyAuthFailure();
        return;
      }
      router.push("/");
    }
  }

  return (
    <AuthShell title="Bentornato" subtitle="Accedi al tuo workspace">
      {/* OAuth */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
        <OAuthButton
          mode="signIn"
          provider="google"
          onError={() => {
            setIsCredentialsInvalid(true);
            notifyAuthFailure();
          }}
        />
        <OAuthButton
          mode="signIn"
          provider="apple"
          onError={() => {
            setIsCredentialsInvalid(true);
            notifyAuthFailure();
          }}
        />
      </div>

      <div className="auth-divider">oppure</div>

      <Form
        variant="plain"
        layout="stack"
        density="comfortable"
        labelStyle="soft"
        noValidate
        onSubmit={handleSubmit}
      >
        <FormField
          label="Email"
          required
          status={isCredentialsInvalid ? "error" : "default"}
          className={warningFields.email ? "auth-warning-field" : undefined}
        >
          <FormControl>
            <Input
              type="email"
              placeholder="nome@esempio.com"
              autoComplete="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                if (isCredentialsInvalid) setIsCredentialsInvalid(false);
                if (warningFields.email) {
                  setWarningFields((current) => ({ ...current, email: false }));
                }
              }}
            />
          </FormControl>
        </FormField>

        <FormField
          label="Password"
          required
          status={isCredentialsInvalid ? "error" : "default"}
          className={warningFields.password ? "auth-warning-field" : undefined}
        >
          <FormControl>
            <Input
              type="password"
              placeholder="La tua password"
              autoComplete="current-password"
              showPasswordToggle
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                if (isCredentialsInvalid) setIsCredentialsInvalid(false);
                if (warningFields.password) {
                  setWarningFields((current) => ({ ...current, password: false }));
                }
              }}
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