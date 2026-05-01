"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Button,
  Input,
  OtpInput,
  Form,
  FormField,
  FormControl,
  FormActions,
  PhoneNumberField,
  useToast,
} from "@qoovex/ui";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { getSafeAuthErrorMessage } from "@shared/lib/auth-error";
import { AuthShell, OAuthButton } from "../ui";

type Step = "form" | "verify";

type FieldErrors = {
  email?: string;
  username?: string;
  password?: string;
  code?: string;
};

function mapCreateErrorToFields(message: string): FieldErrors {
  const lower = message.toLowerCase();
  if (lower.includes("username")) return { username: message };
  if (lower.includes("email")) return { email: message };
  if (lower.includes("password")) return { password: message };
  return {};
}

export default function SignUpPage() {
  const RESEND_COOLDOWN_SECONDS = 45;
  const { signUp, fetchStatus } = useSignUp();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const didHydrateEmail = useRef(false);

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneRegionCode, setPhoneRegionCode] = useState("+39");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [isResending, setIsResending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [warningFields, setWarningFields] = useState<{
    email: boolean;
    username: boolean;
    password: boolean;
    code: boolean;
  }>({
    email: false,
    username: false,
    password: false,
    code: false,
  });
  const isLoading = fetchStatus === "fetching";

  useEffect(() => {
    if (didHydrateEmail.current) return;
    const fromUrl = searchParams.get("email");
    if (fromUrl) {
      setEmail(decodeURIComponent(fromUrl));
      didHydrateEmail.current = true;
    }
  }, [searchParams]);

  useEffect(() => {
    if (!resendAvailableAt) return;
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [resendAvailableAt]);

  function startResendCooldown() {
    setNowMs(Date.now());
    setResendAvailableAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
  }

  function getResendCountdown(): number {
    if (!resendAvailableAt) return 0;
    return Math.max(0, Math.ceil((resendAvailableAt - nowMs) / 1000));
  }

  function getNormalizedPhoneNumber(): string | undefined {
    const normalizedPhoneDigits = phoneNumber.replace(/[^\d]/g, "");
    if (normalizedPhoneDigits === "") return undefined;
    return `${phoneRegionCode}${normalizedPhoneDigits}`;
  }

  async function finalizeAndEnterApp() {
    const { error: finalizeError } = await signUp.finalize();
    if (finalizeError) {
      const msg = getSafeAuthErrorMessage(
        finalizeError,
        "Errore nel completare la registrazione. Riprova o contatta il supporto.",
      );
      toast({ variant: "error", title: "Completamento fallito", description: msg });
      return;
    }
    try {
      await bootstrapUser({ phoneNumber: getNormalizedPhoneNumber() });
      router.replace("/dashboard");
    } catch {
      toast({
        variant: "error",
        title: "Profilo non sincronizzato",
        description:
          "Account creato, ma non siamo riusciti a preparare il profilo. Riprova l'accesso tra poco.",
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    const normalizedUsername = username.trim().toLowerCase();

    const nextWarnings = {
      email: email.trim() === "",
      username: normalizedUsername === "",
      password: password.trim() === "",
      code: false,
    };
    setWarningFields(nextWarnings);

    if (nextWarnings.email || nextWarnings.username || nextWarnings.password) {
      toast({
        variant: "warning",
        title: "Controlla i campi evidenziati",
        description: "Compila email, username e password prima di continuare.",
      });
      return;
    }

    const normalizedPhoneDigits = phoneNumber.replace(/[^\d]/g, "");

    if (normalizedPhoneDigits !== "" && normalizedPhoneDigits.length < 6) {
      const msg =
        "Inserisci un numero di telefono valido (almeno 6 cifre) oppure lascia il campo vuoto.";
      toast({ variant: "warning", title: "Telefono incompleto", description: msg });
      return;
    }

    const { error: createError } = await signUp.create({
      emailAddress: email,
      username: normalizedUsername,
      password,
    });
    if (createError) {
      const msg = getSafeAuthErrorMessage(
        createError,
        "Non e stato possibile creare l'account. Verifica i dati e riprova.",
      );
      const mapped = mapCreateErrorToFields(msg);
      setFieldErrors(Object.keys(mapped).length > 0 ? mapped : {});
      toast({
        variant: "error",
        title: "Registrazione bloccata",
        description: msg,
      });
      return;
    }

    const { error: prepareError } = await signUp.verifications.sendEmailCode();
    if (prepareError) {
      const msg = getSafeAuthErrorMessage(
        prepareError,
        "Non siamo riusciti a inviare il codice. Riprova tra qualche istante.",
      );
      toast({
        variant: "error",
        title: "Invio codice non riuscito",
        description: msg,
      });
      return;
    }

    setStep("verify");
    startResendCooldown();
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors((current) => ({ ...current, code: undefined }));

    const isCodeMissing = code.trim() === "";
    if (isCodeMissing) {
      setWarningFields((current) => ({ ...current, code: true }));
      toast({
        variant: "warning",
        title: "Codice mancante",
        description: "Inserisci il codice a 6 cifre che hai ricevuto via email.",
      });
      return;
    }

    const { error: attemptError } = await signUp.verifications.verifyEmailCode({
      code,
    });

    if (attemptError) {
      const msg = attemptError.message ?? "";
      if (/already been verified/i.test(msg)) {
        if (signUp.status === "complete") {
          await finalizeAndEnterApp();
          return;
        }
        toast({
          variant: "info",
          title: "Già verificato",
          description: "Questo codice è già stato usato. Se l'account è attivo, accedi dalla pagina di login.",
        });
        return;
      }
      const display = getSafeAuthErrorMessage(
        attemptError,
        "Il codice non e valido o e scaduto. Richiedine uno nuovo dalla mail.",
      );
      setFieldErrors({ code: display });
      toast({
        variant: "error",
        title: "Verifica non riuscita",
        description: display,
      });
      return;
    }

    if (signUp.status === "complete") {
      await finalizeAndEnterApp();
      return;
    }

    const display = "Verifica non completata. Controlla il codice e riprova.";
    setFieldErrors({ code: display });
    toast({ variant: "warning", title: "Verifica incompleta", description: display });
  }

  async function handleResend() {
    const countdown = getResendCountdown();
    if (countdown > 0 || isResending) return;

    setFieldErrors((current) => ({ ...current, code: undefined }));
    setIsResending(true);

    const { error: resendError } = await signUp.verifications.sendEmailCode();
    if (resendError) {
      const msg = getSafeAuthErrorMessage(
        resendError,
        "Impossibile reinviare il codice in questo momento.",
      );
      toast({ variant: "error", title: "Reinvio non riuscito", description: msg });
      setIsResending(false);
      return;
    }
    startResendCooldown();
    toast({
      variant: "success",
      title: "Codice reinviato",
      description: `Controlla di nuovo la posta in arrivo e lo spam su ${email.trim()}.`,
    });
    setIsResending(false);
  }

  const signInHref =
    email.trim() === ""
      ? "/sign-in"
      : `/sign-in?email=${encodeURIComponent(email.trim())}`;
  const resendCountdown = getResendCountdown();
  const isResendDisabled = resendCountdown > 0 || isResending;

  return (
    <AuthShell
      title={step === "form" ? "Crea il tuo account" : "Verifica la tua email"}
      subtitle={
        step === "form"
          ? "Inizia gratis in pochi secondi"
          : (
            <>
              Stiamo inviando il codice a{" "}
              <span className="auth-email-highlight">{email.trim()}</span>. Controlla la
              posta in arrivo e lo spam.
            </>
          )
      }
      steps={{ current: step === "form" ? 1 : 2, total: 2 }}
      onBack={step === "verify" ? () => setStep("form") : undefined}
    >
      {step === "form" ? (
        <>
          <div className="auth-oauth-stack">
            <OAuthButton
              mode="signUp"
              provider="google"
              onError={(msg) => {
                toast({
                  variant: "error",
                  title: "Accesso Google non riuscito",
                  description: msg,
                });
              }}
            />
            <OAuthButton
              mode="signUp"
              provider="apple"
              onError={(msg) => {
                toast({
                  variant: "error",
                  title: "Accesso Apple non riuscito",
                  description: msg,
                });
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
              status={
                fieldErrors.email || warningFields.email ? "error" : "default"
              }
            >
              <FormControl>
                <Input
                  type="email"
                  placeholder="chef@cucina.it"
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

            <FormField
              label="Username"
              required
              status={
                fieldErrors.username || warningFields.username ? "error" : "default"
              }
            >
              <FormControl>
                <Input
                  type="text"
                  placeholder="nomechef"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""));
                    if (warningFields.username) {
                      setWarningFields((current) => ({ ...current, username: false }));
                    }
                    if (fieldErrors.username) {
                      setFieldErrors((current) => ({ ...current, username: undefined }));
                    }
                  }}
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

            <FormField
              label="Password"
              required
              status={
                fieldErrors.password || warningFields.password ? "error" : "default"
              }
            >
              <FormControl>
                <Input
                  type="password"
                  placeholder="Minimo 8 caratteri"
                  autoComplete="new-password"
                  showPasswordToggle
                  showStrength
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value);
                    if (warningFields.password) {
                      setWarningFields((current) => ({ ...current, password: false }));
                    }
                    if (fieldErrors.password) {
                      setFieldErrors((current) => ({ ...current, password: undefined }));
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
                loadingLabel="Creazione account…"
                className="w-full"
              >
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
            Hai già un account? <Link href={signInHref}>Accedi</Link>
          </p>
        </>
      ) : (
        <Form
          variant="plain"
          layout="stack"
          density="comfortable"
          labelStyle="soft"
          noValidate
          onSubmit={handleVerify}
        >
          <FormField
            label="Codice di verifica"
            required
            helperText="Il codice scade dopo alcuni minuti. Se non lo vedi, prova a reinviarlo."
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
              aria-label="Codice di verifica email"
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
              Verifica email
            </Button>
          </FormActions>

          <p className="auth-footer-text">
            Non hai ricevuto il codice?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResendDisabled}
              className="auth-inline-link-button"
            >
              {isResending ? "Reinvio in corso..." : "Invia di nuovo"}
            </button>
            <span className="auth-inline-countdown" aria-live="polite" aria-atomic="true">
              {resendCountdown > 0 ? ` tra ${resendCountdown}s` : "\u00a0"}
            </span>
          </p>
        </Form>
      )}
    </AuthShell>
  );
}
