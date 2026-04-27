"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react";
import {
  Button,
  Input,
  OtpInput,
  Form,
  FormField,
  FormControl,
  FormActions,
  PhoneNumberField,
} from "@qoovex/ui";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { AuthShell, OAuthButton } from "../ui";

type Step = "form" | "verify";

export default function SignUpPage() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneRegionCode, setPhoneRegionCode] = useState("+39");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isLoading = fetchStatus === "fetching";

  function getNormalizedPhoneNumber(): string | undefined {
    const normalizedPhoneDigits = phoneNumber.replace(/[^\d]/g, "");
    if (normalizedPhoneDigits === "") return undefined;
    return `${phoneRegionCode}${normalizedPhoneDigits}`;
  }

  // ─── Step 1: crea il sign-up e avvia verifica email ──────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedPhoneDigits = phoneNumber.replace(/[^\d]/g, "");
    const normalizedPhoneNumber = getNormalizedPhoneNumber();

    if (normalizedPhoneDigits !== "" && normalizedPhoneDigits.length < 6) {
      setError("Inserisci un numero di telefono valido.");
      return;
    }

    const { error: createError } = await signUp.create({
      emailAddress: email,
      username,
      password,
    });
    if (createError) {
      setError(createError.message ?? "Errore durante la registrazione");
      return;
    }

    const { error: prepareError } = await signUp.verifications.sendEmailCode();
    if (prepareError) {
      setError(prepareError.message ?? "Impossibile inviare il codice");
      return;
    }

    setStep("verify");
  }

  // ─── Step 2: verifica codice OTP ─────────────────────────────────────────
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error: attemptError } = await signUp.verifications.verifyEmailCode({
      code,
    });
    if (attemptError) {
      setError(attemptError.message ?? "Codice non valido");
      return;
    }

    if (signUp.status === "complete") {
      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setError(finalizeError.message ?? "Errore durante la registrazione");
        return;
      }

      await bootstrapUser({ phoneNumber: getNormalizedPhoneNumber() });
      router.push("/");
      return;
    }

    setError("Verifica non completata. Riprova.");
  }

  // ─── Step 2b: reinvia codice ──────────────────────────────────────────────
  async function handleResend() {
    setError(null);

    const { error: resendError } = await signUp.verifications.sendEmailCode();
    if (resendError) {
      setError(resendError.message ?? "Impossibile reinviare il codice");
    }
  }

  return (
    <AuthShell
      title={step === "form" ? "Crea account" : "Verifica email"}
      subtitle={
        step === "form"
          ? "Inizia gratis, nessuna carta richiesta"
          : `Abbiamo inviato un codice a ${email}`
      }
      steps={{ current: step === "form" ? 1 : 2, total: 2 }}
      onBack={step === "verify" ? () => setStep("form") : undefined}
    >
      {error && (
        <div className="auth-error-banner" role="alert">
          <WarningCircle size={16} weight="bold" aria-hidden="true" />
          {error}
        </div>
      )}

      {step === "form" ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            <OAuthButton mode="signUp" provider="google" onError={setError} />
            <OAuthButton mode="signUp" provider="apple" onError={setError} />
          </div>

          <div className="auth-divider">oppure</div>

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
                  placeholder="chef@cucina.it"
                  autoComplete="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                />
              </FormControl>
            </FormField>

            <FormField label="Username" required>
              <FormControl>
                <Input
                  type="text"
                  placeholder="nomechef"
                  autoComplete="username"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  required
                />
              </FormControl>
            </FormField>

            <PhoneNumberField
              label={
                <>
                  Numero di telefono{" "}
                  <span className="auth-optional-label" aria-label="campo facoltativo">
                    facoltativo
                  </span>
                </>
              }
              helperText="Usato solo per sicurezza account e notifiche importanti. Inserisci solo il numero, senza prefisso."
              regionCode={phoneRegionCode}
              onRegionCodeChange={setPhoneRegionCode}
              nationalNumber={phoneNumber}
              onNationalNumberChange={setPhoneNumber}
            />

            <FormField label="Password" required>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Minimo 8 caratteri"
                  autoComplete="new-password"
                  showPasswordToggle
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                />
              </FormControl>
            </FormField>

            <FormActions align="stretch">
              <Button type="submit" variant="primary" size="md" loading={isLoading} className="w-full">
                Crea account
              </Button>
            </FormActions>

            <div
              id="clerk-captcha"
              data-cl-theme="dark"
              data-cl-size="flexible"
              data-cl-language="it-IT"
            />
          </Form>

          <p className="auth-footer-text">
            Hai già un account? <Link href="/sign-in">Accedi</Link>
          </p>
        </>
      ) : (
        <Form variant="plain" layout="stack" density="comfortable" labelStyle="soft" onSubmit={handleVerify}>
          <FormField label="Codice di verifica" required>
            <OtpInput
              value={code}
              onChange={setCode}
              length={6}
              autoFocus
              aria-label="Codice di verifica email"
            />
          </FormField>

          <FormActions align="stretch">
            <Button type="submit" variant="primary" size="md" loading={isLoading} className="w-full">
              Verifica email
            </Button>
          </FormActions>

          <p className="auth-footer-text">
            Non hai ricevuto il codice?{" "}
            <button
              type="button"
              onClick={handleResend}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "var(--color-primary)",
                cursor: "pointer",
                fontSize: "inherit",
              }}
            >
              Invialo di nuovo
            </button>
          </p>
        </Form>
      )}
    </AuthShell>
  );
}