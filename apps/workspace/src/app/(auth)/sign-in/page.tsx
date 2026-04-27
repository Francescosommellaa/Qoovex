"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Button, Input } from "@qoovex/ui";
import { AuthCard } from "../ui/AuthCard";
import { OAuthButton } from "../ui/OAuthButton";

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = isSubmitting || fetchStatus === "fetching";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;

    setError(null);
    setIsSubmitting(true);

    try {
      // Clerk v7: signIn.password() per email+password
      await signIn.password({
        identifier: email,
        password,
      });

      // Finalizza la sessione e reindirizza
      await signIn.finalize();
      router.push("/dashboard");
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(
        clerkError.errors?.[0]?.message ?? "Credenziali non valide. Riprova.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Bentornato"
      subtitle="Accedi al tuo workspace Qoovex"
    >
      {/* OAuth Google */}
      <OAuthButton mode="signIn" />

      {/* Separatore */}
      <div className="auth-divider">oppure</div>

      {/* Form email + password */}
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}
      >
        {/* Banner errore globale */}
        {error && (
          <div className="auth-error-banner" role="alert">
            <WarningCircle size={16} weight="bold" aria-hidden="true" />
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="tu@esempio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={isLoading}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
          <Input
            label="Password"
            type="password"
            placeholder="La tua password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={isLoading}
            showPasswordToggle
          />
          <div style={{ textAlign: "right" }}>
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
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          disabled={isLoading || !email || !password}
          className="w-full"
        >
          Accedi
        </Button>
      </form>

      {/* Footer */}
      <p className="auth-footer-text">
        Non hai un account?{" "}
        <Link href="/sign-up">Registrati gratis</Link>
      </p>
    </AuthCard>
  );
}