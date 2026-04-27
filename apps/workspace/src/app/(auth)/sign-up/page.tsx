"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Button, Input } from "@qoovex/ui";
import { AuthCard } from "../ui/AuthCard";
import { OAuthButton } from "../ui/OAuthButton";

// ─── Tipi ────────────────────────────────────────────────────────────────────

type Step = "credentials" | "verify";

interface FormState {
  fullName: string;
  username: string;
  phone: string;
  email: string;
  password: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getClerkErrorMessage(err: unknown): string {
  const clerkError = err as { errors?: { longMessage?: string; message?: string }[] };
  return (
    clerkError.errors?.[0]?.longMessage ??
    clerkError.errors?.[0]?.message ??
    "Qualcosa è andato storto. Riprova."
  );
}

// ─── Step 1: Credentials ─────────────────────────────────────────────────────

interface CredentialsStepProps {
  form: FormState;
  onChange: (field: keyof FormState, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function CredentialsStep({
  form,
  onChange,
  onSubmit,
  isLoading,
  error,
}: CredentialsStepProps) {
  return (
    <>
      {/* OAuth Google */}
      <OAuthButton mode="signUp" />

      <div className="auth-divider">oppure</div>

      <form
        onSubmit={onSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}
      >
        {error && (
          <div className="auth-error-banner" role="alert">
            <WarningCircle size={16} weight="bold" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Nome completo */}
        <Input
          label="Nome completo"
          type="text"
          placeholder="Mario Rossi"
          value={form.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          required
          autoComplete="name"
          disabled={isLoading}
        />

        {/* Username */}
        <Input
          label="Username"
          type="text"
          placeholder="mariorossi"
          value={form.username}
          onChange={(e) => onChange("username", e.target.value.toLowerCase().replace(/\s/g, ""))}
          required
          autoComplete="username"
          disabled={isLoading}
        />

        {/* Telefono (facoltativo) */}
        <Input
          label="Numero di telefono"
          type="tel"
          placeholder="+39 333 000 0000"
          value={form.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          autoComplete="tel"
          disabled={isLoading}
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="tu@esempio.com"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
          required
          autoComplete="email"
          disabled={isLoading}
        />

        {/* Password */}
        <Input
          label="Password"
          type="password"
          placeholder="Scegli una password sicura"
          value={form.password}
          onChange={(e) => onChange("password", e.target.value)}
          required
          autoComplete="new-password"
          disabled={isLoading}
          showPasswordToggle
          showStrength
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isLoading}
          disabled={
            isLoading ||
            !form.fullName ||
            !form.username ||
            !form.email ||
            !form.password
          }
          className="w-full"
        >
          Continua
        </Button>
      </form>

      <p className="auth-footer-text">
        Hai già un account?{" "}
        <Link href="/sign-in">Accedi</Link>
      </p>
    </>
  );
}

// ─── Step 2: Verifica email OTP ───────────────────────────────────────────────

interface VerifyStepProps {
  email: string;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

function VerifyStep({
  email,
  code,
  onCodeChange,
  onSubmit,
  onResend,
  onBack,
  isLoading,
  error,
}: VerifyStepProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}
    >
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        Abbiamo inviato un codice di verifica a{" "}
        <strong style={{ color: "var(--color-text)" }}>{email}</strong>.
        Inseriscilo qui sotto.
      </p>

      {error && (
        <div className="auth-error-banner" role="alert">
          <WarningCircle size={16} weight="bold" aria-hidden="true" />
          {error}
        </div>
      )}

      <Input
        label="Codice di verifica"
        type="text"
        inputMode="numeric"
        placeholder="000000"
        value={code}
        onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        required
        autoComplete="one-time-code"
        disabled={isLoading}
        style={{ textAlign: "center", letterSpacing: "0.3em", fontSize: "var(--text-lg)" }}
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={isLoading}
        disabled={isLoading || code.length !== 6}
        className="w-full"
      >
        Verifica email
      </Button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← Torna indietro
        </button>

        <button
          type="button"
          onClick={onResend}
          disabled={isLoading}
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-primary)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Invia di nuovo
        </button>
      </div>
    </form>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────

export default function SignUpPage() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<Step>("credentials");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>({
    fullName: "",
    username: "",
    phone: "",
    email: "",
    password: "",
  });

  const isLoading = isSubmitting || fetchStatus === "fetching";

  function handleFieldChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Step 1 → avvia registrazione e invia OTP
  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signUp) return;

    setError(null);
    setIsSubmitting(true);

    try {
      // Clerk v7: signUp.password() con i campi utente
      await signUp.password({
        emailAddress: form.email,
        password: form.password,
        firstName: form.fullName.split(" ")[0],
        lastName: form.fullName.split(" ").slice(1).join(" ") || undefined,
        username: form.username,
        ...(form.phone ? { phoneNumber: form.phone } : {}),
      });

      // Invia il codice OTP via email
      await signUp.verifications.sendEmailCode();
      setStep("verify");
    } catch (err) {
      setError(getClerkErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Step 2 → verifica OTP e finalizza
  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signUp) return;

    setError(null);
    setIsSubmitting(true);

    try {
        await signUp.verifications.verifyEmailCode({ code });
      if (signUp.status === "complete") {
        await signUp.finalize();
        router.push("/dashboard");
      } else {
        setError("Verifica non completata. Riprova.");
      }
    } catch (err) {
      setError(getClerkErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    if (!signUp) return;
    setError(null);
    try {
      await signUp.verifications.sendEmailCode();
    } catch (err) {
      setError(getClerkErrorMessage(err));
    }
  }

  function handleBack() {
    setStep("credentials");
    setCode("");
    setError(null);
  }

  return (
    <AuthCard
      title={step === "credentials" ? "Crea il tuo account" : "Verifica la tua email"}
      subtitle={
        step === "credentials"
          ? "Unisciti a migliaia di chef su Qoovex"
          : undefined
      }
      steps={{ current: step === "credentials" ? 1 : 2, total: 2 }}
      onBack={step === "verify" ? handleBack : undefined}
    >
      {step === "credentials" ? (
        <CredentialsStep
          form={form}
          onChange={handleFieldChange}
          onSubmit={handleCredentialsSubmit}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <VerifyStep
          email={form.email}
          code={code}
          onCodeChange={setCode}
          onSubmit={handleVerifySubmit}
          onResend={handleResendCode}
          onBack={handleBack}
          isLoading={isLoading}
          error={error}
        />
      )}
    </AuthCard>
  );
}