"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WarningCircle, CheckCircle } from "@phosphor-icons/react";
import {
  Button,
  Input,
  OtpInput,
  Form,
  FormField,
  FormControl,
  FormActions,
  useToast,
} from "@qoovex/ui";
import { AuthShell } from "../ui";

type Step = "email" | "verify" | "new-password";

export default function ForgotPasswordPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [warningFields, setWarningFields] = useState<{
    email: boolean;
    code: boolean;
    newPassword: boolean;
  }>({
    email: false,
    code: false,
    newPassword: false,
  });

  const isLoading = fetchStatus === "fetching";

  async function handleSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError(null);

    const isEmailMissing = email.trim() === "";
    if (isEmailMissing) {
      setWarningFields((current) => ({ ...current, email: true }));
      toast({
        variant: "warning",
        title: "Controlla i campi evidenziati",
        description: "Inserisci la tua email per continuare.",
      });
      return;
    }

    // Step 1: inizializza il signin con l'email
    const { error: createError } = await signIn.create({ identifier: email });
    if (createError) {
      setGlobalError(createError.message ?? "Email non trovata. Riprova.");
      return;
    }

    // Step 2: invia il codice di reset via email
    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) {
      setGlobalError(sendError.message ?? "Errore nell'invio del codice.");
      return;
    }

    setStep("verify");
  }

  async function handleVerifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError(null);

    const isCodeMissing = code.trim() === "";
    if (isCodeMissing) {
      setWarningFields((current) => ({ ...current, code: true }));
      toast({
        variant: "warning",
        title: "Controlla i campi evidenziati",
        description: "Inserisci il codice di verifica.",
      });
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (error) {
      setGlobalError(error.message ?? "Codice non valido. Riprova.");
      return;
    }

    setStep("new-password");
  }

  async function handleSetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError(null);

    const isPasswordMissing = newPassword.trim() === "";
    if (isPasswordMissing) {
      setWarningFields((current) => ({ ...current, newPassword: true }));
      toast({
        variant: "warning",
        title: "Controlla i campi evidenziati",
        description: "Inserisci una nuova password per continuare.",
      });
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
      signOutOfOtherSessions: true,
    });

    if (error) {
      setGlobalError(error.message ?? "Errore nel cambio password. Riprova.");
      return;
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setGlobalError(finalizeError.message ?? "Errore durante l'accesso.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    }
  }

  async function handleResendCode() {
    setGlobalError(null);
    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    if (error) setGlobalError(error.message ?? "Errore nel reinvio del codice.");
  }

  const globalClerkError = errors.global?.[0]?.message ?? null;
  const codeError = errors.fields.code?.message ?? null;
  const passwordError = errors.fields.password?.message ?? null;
  const displayError = globalError ?? globalClerkError;

  const stepMap: Record<Step, number> = { email: 1, verify: 2, "new-password": 3 };

  return (
    <AuthShell
      title={
        step === "email"
          ? "Recupera password"
          : step === "verify"
            ? "Verifica codice di recupero"
            : "Nuova password"
      }
      subtitle={
        step === "email"
          ? "Inserisci la tua email: ti inviamo un codice di recupero"
          : step === "verify"
            ? `Abbiamo inviato un codice a ${email}`
            : "Scegli una nuova password sicura"
      }
      steps={{ current: stepMap[step], total: 3 }}
      onBack={
        step !== "email"
          ? () => {
              setStep(step === "new-password" ? "verify" : "email");
              setGlobalError(null);
            }
          : undefined
      }
    >
      {success ? (
        <div className="auth-success-banner" role="status">
          <CheckCircle size={16} weight="bold" aria-hidden="true" />
          Password aggiornata! Reindirizzamento in corso…
        </div>
      ) : (
        <>
          {displayError && (
            <div className="auth-error-banner" role="alert">
              <WarningCircle size={16} weight="bold" aria-hidden="true" />
              {displayError}
            </div>
          )}

          {/* Step 1 — Email */}
          {step === "email" && (
            <Form
              variant="plain"
              layout="stack"
              density="comfortable"
              labelStyle="soft"
              noValidate
              onSubmit={handleSendCode}
            >
              <FormField
                label="Email"
                required
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
                      if (warningFields.email) {
                        setWarningFields((current) => ({ ...current, email: false }));
                      }
                    }}
                  />
                </FormControl>
              </FormField>
              <FormActions align="stretch">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  className="w-full"
                >
                  Invia codice
                </Button>
              </FormActions>
            </Form>
          )}

          {/* Step 2 — Verifica codice */}
          {step === "verify" && (
            <Form
              variant="plain"
              layout="stack"
              density="comfortable"
              labelStyle="soft"
              noValidate
              onSubmit={handleVerifyCode}
            >
              <FormField
                label="Codice di verifica"
                required
                helperText={codeError ?? "Controlla la tua casella di posta, incluso lo spam."}
                className={warningFields.code ? "auth-warning-field" : undefined}
              >
                <OtpInput
                  value={code}
                  onChange={(nextCode) => {
                    setCode(nextCode);
                    if (warningFields.code) {
                      setWarningFields((current) => ({ ...current, code: false }));
                    }
                  }}
                  length={6}
                  autoFocus
                  aria-label="Codice di recupero password"
                />
              </FormField>
              <FormActions align="stretch">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  className="w-full"
                >
                  Verifica codice
                </Button>
              </FormActions>
              <p className="auth-footer-text">
                Non hai ricevuto il codice?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--color-primary)",
                    cursor: "pointer",
                    fontSize: "inherit",
                  }}
                >
                  Invia di nuovo
                </button>
              </p>
            </Form>
          )}

          {/* Step 3 — Nuova password */}
          {step === "new-password" && (
            <Form
              variant="plain"
              layout="stack"
              density="comfortable"
              labelStyle="soft"
              noValidate
              onSubmit={handleSetPassword}
            >
              <FormField
                label="Nuova password"
                required
                helperText={passwordError ?? undefined}
                className={warningFields.newPassword ? "auth-warning-field" : undefined}
              >
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Almeno 8 caratteri"
                    autoComplete="new-password"
                    showPasswordToggle
                    showStrength
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setNewPassword(e.target.value);
                      if (warningFields.newPassword) {
                        setWarningFields((current) => ({
                          ...current,
                          newPassword: false,
                        }));
                      }
                    }}
                  />
                </FormControl>
              </FormField>
              <FormActions align="stretch">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  className="w-full"
                >
                  Salva nuova password
                </Button>
              </FormActions>
            </Form>
          )}
        </>
      )}

      <p className="auth-footer-text">
        Ricordi la password? <Link href="/sign-in">Accedi</Link>
      </p>
    </AuthShell>
  );
}