"use client";

import { useState, useEffect, useRef } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Input,
  OtpInput,
  Form,
  FormField,
  FormControl,
  FormActions,
  Text,
  useToast,
} from "@qoovex/ui";
import { getSafeAuthErrorMessage } from "@shared/lib/auth-error";
import { AuthShell } from "../ui";

type Step = "email" | "verify" | "new-password";

function isLikelyValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ForgotPasswordPage() {
  const { signIn, fetchStatus } = useSignIn();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const didHydrateEmail = useRef(false);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [warningFields, setWarningFields] = useState<{
    email: boolean;
    code: boolean;
    newPassword: boolean;
  }>({
    email: false,
    code: false,
    newPassword: false,
  });
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    code?: string;
    newPassword?: string;
  }>({});

  const isLoading = fetchStatus === "fetching";

  useEffect(() => {
    if (didHydrateEmail.current) return;
    const fromUrl = searchParams.get("email");
    if (fromUrl) {
      setEmail(decodeURIComponent(fromUrl));
      didHydrateEmail.current = true;
    }
  }, [searchParams]);

  async function handleSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});

    const isEmailMissing = email.trim() === "";
    if (isEmailMissing) {
      setWarningFields((current) => ({ ...current, email: true }));
      toast({
        variant: "warning",
        title: "Email mancante",
        description: "Inserisci l'indirizzo email associato al tuo account.",
      });
      return;
    }

    if (!isLikelyValidEmail(email)) {
      setWarningFields((current) => ({ ...current, email: true }));
      toast({
        variant: "warning",
        title: "Formato email",
        description: "Controlla che l'indirizzo email sia completo (es. nome@dominio.it).",
      });
      return;
    }

    const { error: createError } = await signIn.create({ identifier: email.trim() });
    if (createError) {
      toast({
        variant: "info",
        title: "Richiesta registrata",
        description:
          "Se esiste un account con questo indirizzo, riceverai un'email con le istruzioni. Controlla anche lo spam.",
      });
      return;
    }

    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) {
      toast({
        variant: "info",
        title: "Richiesta registrata",
        description:
          "Se esiste un account con questo indirizzo, riceverai un'email con le istruzioni. Controlla anche lo spam.",
      });
      return;
    }

    setStep("verify");
    toast({
      variant: "success",
      title: "Codice inviato",
      description: "Controlla la posta in arrivo e inserisci il codice a 6 cifre.",
    });
  }

  async function handleVerifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors((current) => ({ ...current, code: undefined }));

    const isCodeMissing = code.trim() === "";
    if (isCodeMissing) {
      setWarningFields((current) => ({ ...current, code: true }));
      toast({
        variant: "warning",
        title: "Codice mancante",
        description: "Inserisci il codice a 6 cifre ricevuto via email.",
      });
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (error) {
      const msg = getSafeAuthErrorMessage(
        error,
        "Codice non valido o scaduto. Richiedine uno nuovo dalla mail.",
      );
      setFieldErrors({ code: msg });
      toast({ variant: "error", title: "Codice non accettato", description: msg });
      return;
    }

    setStep("new-password");
  }

  async function handleSetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors((current) => ({ ...current, newPassword: undefined }));

    const isPasswordMissing = newPassword.trim() === "";
    if (isPasswordMissing) {
      setWarningFields((current) => ({ ...current, newPassword: true }));
      toast({
        variant: "warning",
        title: "Password mancante",
        description: "Scegli una nuova password di almeno 8 caratteri.",
      });
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
      signOutOfOtherSessions: true,
    });

    if (error) {
      const msg = getSafeAuthErrorMessage(
        error,
        "Non e stato possibile aggiornare la password. Riprova.",
      );
      setFieldErrors({ newPassword: msg });
      toast({ variant: "error", title: "Aggiornamento non riuscito", description: msg });
      return;
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize({
        navigate: async ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            toast({
              variant: "warning",
              title: "Azione richiesta",
              description: "Completa i passaggi richiesti dal tuo account prima di continuare.",
            });
            return;
          }
          const url = decorateUrl("/dashboard");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
      if (finalizeError) {
        const msg = getSafeAuthErrorMessage(
          finalizeError,
          "Sessione non completata. Prova ad accedere dalla pagina di login.",
        );
        toast({ variant: "error", title: "Accesso", description: msg });
      }
    } else {
      toast({
        variant: "warning",
        title: "Flusso incompleto",
        description: "Riprova dal codice o contatta il supporto se il problema persiste.",
      });
    }
  }

  async function handleResendCode() {
    setFieldErrors((current) => ({ ...current, code: undefined }));
    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    if (error) {
      toast({
        variant: "info",
        title: "Reinvio",
        description:
          "Se esiste un account con questo indirizzo, riceverai un'email. Controlla la posta e lo spam.",
      });
      return;
    }
    toast({
      variant: "success",
      title: "Codice reinviato",
      description: "Controlla di nuovo la posta in arrivo.",
    });
  }

  const stepMap: Record<Step, number> = { email: 1, verify: 2, "new-password": 3 };

  return (
    <AuthShell
      title={
        step === "email"
          ? "Recupera la password"
          : step === "verify"
            ? "Inserisci il codice"
            : "Scegli una nuova password"
      }
      subtitle={
        step === "email"
          ? "Ti inviamo un codice sicuro per reimpostare l'accesso"
          : step === "verify"
            ? `Codice inviato a ${email}`
            : "Usa almeno 8 caratteri, meglio se con lettere e numeri"
      }
      steps={{ current: stepMap[step], total: 3 }}
      onBack={
        step !== "email"
          ? () => {
              if (step === "verify") {
                void signIn?.reset?.();
                setStep("email");
                setCode("");
                setFieldErrors({});
              } else {
                setStep("verify");
                setNewPassword("");
                setFieldErrors({});
              }
            }
          : undefined
      }
    >
      <>
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
                helperText="Useremo solo questo indirizzo per inviarti il codice di recupero."
                status={
                  fieldErrors.email || warningFields.email ? "error" : "default"
                }
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
                      if (fieldErrors.email) {
                        setFieldErrors((current) => ({ ...current, email: undefined }));
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
                  loadingLabel="Invio in corso…"
                  className="w-full"
                >
                  Invia codice
                </Button>
              </FormActions>
            </Form>
          )}

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
                helperText="Incolla il codice dalla mail oppure digitacelo. Se non arriva, attendi qualche minuto o reinvia."
                status={fieldErrors.code || warningFields.code ? "error" : "default"}
              >
                <OtpInput
                  value={code}
                  onChange={(nextCode) => {
                    setCode(nextCode);
                    if (warningFields.code) {
                      setWarningFields((current) => ({ ...current, code: false }));
                    }
                    if (fieldErrors.code) {
                      setFieldErrors((current) => ({ ...current, code: undefined }));
                    }
                  }}
                  length={6}
                  requestInitialFocusOnDesktop
                  aria-label="Codice di recupero password"
                />
              </FormField>
              <FormActions align="stretch">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  loadingLabel="Verifica in corso…"
                  className="w-full"
                >
                  Verifica codice
                </Button>
              </FormActions>
              <Text className="auth-footer-text">
                Non hai ricevuto il codice?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="auth-inline-link-button"
                >
                  Invia di nuovo
                </button>
              </Text>
            </Form>
          )}

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
                helperText="Suggerimento: combina maiuscole, minuscole e numeri per una password più sicura."
                status={
                  fieldErrors.newPassword || warningFields.newPassword ? "error" : "default"
                }
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
                      if (fieldErrors.newPassword) {
                        setFieldErrors((current) => ({
                          ...current,
                          newPassword: undefined,
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
                  loadingLabel="Salvataggio password…"
                  className="w-full"
                >
                  Salva nuova password
                </Button>
              </FormActions>
            </Form>
          )}
      </>

      <Text className="auth-footer-text">
        Ricordi la password? <Link href="/sign-in">Accedi</Link>
      </Text>
    </AuthShell>
  );
}
