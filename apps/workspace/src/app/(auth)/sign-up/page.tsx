"use client";

import { useSignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Input,
  OtpInput,
  Stack,
  Text,
  Form,
  FormField,
  FormControl,
  FormActions,
  PhoneNumberField,
  useToast,
} from "@qoovex/ui";
import { getSafeAuthErrorMessage } from "@shared/lib/auth-error";
import { AuthShell, OAuthButton } from "../ui";

type Step = "form" | "verify";

type FieldErrors = {
  email?: string;
  username?: string;
  password?: string;
  code?: string;
};

type SignUpState = ReturnType<typeof useSignUp>["signUp"];

const USERNAME_EMAIL_MESSAGE =
  "Lo username non puo essere un indirizzo email. Usa solo lettere, numeri, punto, trattino o underscore.";
const USERNAME_FORMAT_MESSAGE =
  "Lo username deve avere 3-32 caratteri: lettere minuscole, numeri, punto, trattino o underscore.";
const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;

function mapCreateErrorToFields(message: string): FieldErrors {
  const lower = message.toLowerCase();
  if (lower.includes("username")) return { username: message };
  if (lower.includes("email")) return { email: message };
  if (lower.includes("password")) return { password: message };
  return {};
}

function readClerkCreateError(error: unknown) {
  if (typeof error !== "object" || error === null) return "";

  const clerkError = error as {
    code?: string;
    message?: string;
    longMessage?: string;
    errors?: Array<{ code?: string; message?: string; longMessage?: string }>;
  };
  const first = clerkError.errors?.[0];

  return `${first?.code ?? clerkError.code ?? ""} ${
    first?.longMessage ??
    first?.message ??
    clerkError.longMessage ??
    clerkError.message ??
    ""
  }`.toLowerCase();
}

function getCreateErrorFeedback(error: unknown): {
  title: string;
  description: string;
  fields: FieldErrors;
} {
  const fingerprint = readClerkCreateError(error);

  if (
    (fingerprint.includes("email") || fingerprint.includes("identifier")) &&
    (fingerprint.includes("already") ||
      fingerprint.includes("exists") ||
      fingerprint.includes("taken") ||
      fingerprint.includes("in use"))
  ) {
    const description =
      "Questa email e gia registrata. Accedi con questo indirizzo oppure usa un'altra email.";
    return {
      title: "Email gia registrata",
      description,
      fields: { email: description },
    };
  }

  if (
    fingerprint.includes("username") &&
    (fingerprint.includes("already") ||
      fingerprint.includes("exists") ||
      fingerprint.includes("taken") ||
      fingerprint.includes("in use"))
  ) {
    const description =
      "Questo username e gia in uso. Scegline uno diverso, senza usare un indirizzo email.";
    return {
      title: "Username non disponibile",
      description,
      fields: { username: description },
    };
  }

  if (fingerprint.includes("username")) {
    return {
      title: "Username non valido",
      description: USERNAME_FORMAT_MESSAGE,
      fields: { username: USERNAME_FORMAT_MESSAGE },
    };
  }

  const description = getSafeAuthErrorMessage(
    error,
    "Non e stato possibile creare l'account. Verifica i campi evidenziati e riprova.",
  );

  return {
    title: "Registrazione bloccata",
    description,
    fields: mapCreateErrorToFields(description),
  };
}

function isLikelyEmail(value: string): boolean {
  return value.includes("@") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeUsernameInput(value: string): string {
  const lowered = value.toLowerCase().replace(/\s+/g, "").replace(/^@+/, "");
  const withoutEmailDomain = lowered.includes("@")
    ? lowered.split("@")[0]
    : lowered;

  return withoutEmailDomain.replace(/[^a-z0-9._-]/g, "").slice(0, 32);
}

function validateUsername(value: string): string | undefined {
  if (isLikelyEmail(value)) return USERNAME_EMAIL_MESSAGE;
  if (!USERNAME_PATTERN.test(value)) return USERNAME_FORMAT_MESSAGE;
  return undefined;
}

function isAlreadyUsedVerificationError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const clerkError = error as {
    code?: string;
    message?: string;
    errors?: Array<{ code?: string; message?: string }>;
  };
  const first = clerkError.errors?.[0];
  const fingerprint = `${first?.code ?? clerkError.code ?? ""} ${
    first?.message ?? clerkError.message ?? ""
  }`.toLowerCase();

  return (
    fingerprint.includes("already") &&
    (fingerprint.includes("verified") || fingerprint.includes("used"))
  );
}

function canFinalizeSignUp(signUp: SignUpState) {
  return signUp.status === "complete" || Boolean(signUp.createdSessionId);
}

function getPendingSignUpMessage(signUp: SignUpState) {
  if (signUp.unverifiedFields.length > 0) {
    return "La dev instance Clerk richiede ancora una verifica. Richiedi un nuovo codice e riprova.";
  }

  if (signUp.missingFields.length > 0) {
    return `La dev instance Clerk richiede ancora: ${signUp.missingFields.join(", ")}. Allinea le impostazioni Clerk dev alla live oppure completa questi campi.`;
  }

  return "Verifica non completata nella dev instance Clerk. Controlla che le impostazioni di sign-up dev siano allineate alla live.";
}

function logDevSignUpState(context: string, signUp: SignUpState, error?: unknown) {
  if (process.env.NODE_ENV === "production") return;

  console.info("[sign-up]", context, {
    status: signUp.status,
    missingFields: signUp.missingFields,
    unverifiedFields: signUp.unverifiedFields,
    requiredFields: signUp.requiredFields,
    createdSessionId: signUp.createdSessionId,
    createdUserId: signUp.createdUserId,
    error,
  });
}

function ClerkCaptchaSlot() {
  return (
    <Box
      id="clerk-captcha"
      className="auth-captcha-slot"
      data-cl-theme="dark"
      data-cl-size="flexible"
      data-cl-language="it"
    />
  );
}

export default function SignUpPage() {
  const RESEND_COOLDOWN_SECONDS = 45;
  const { signUp, fetchStatus } = useSignUp();
  const { toast } = useToast();
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

  function handleUsernameInput(rawValue: string) {
    if (warningFields.username) {
      setWarningFields((current) => ({ ...current, username: false }));
    }

    if (isLikelyEmail(rawValue)) {
      setUsername("");
      setFieldErrors((current) => ({
        ...current,
        username: USERNAME_EMAIL_MESSAGE,
      }));
      return;
    }

    setUsername(normalizeUsernameInput(rawValue));

    if (fieldErrors.username) {
      setFieldErrors((current) => ({ ...current, username: undefined }));
    }
  }

  async function finalizeAndEnterApp(destinationPath = "/dashboard") {
    const { error: finalizeError } = await signUp.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          toast({
            variant: "warning",
            title: "Azione richiesta",
            description: "Completa i passaggi richiesti dal tuo account prima di continuare.",
          });
          return;
        }

        const url = decorateUrl(destinationPath);
        const destination = url.startsWith("http")
          ? url
          : `${window.location.origin}${url}`;
        window.location.assign(destination);
      },
    });
    if (finalizeError) {
      const msg = getSafeAuthErrorMessage(
        finalizeError,
        "Errore nel completare la registrazione. Riprova o contatta il supporto.",
      );
      toast({ variant: "error", title: "Completamento fallito", description: msg });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const previousUsernameError = fieldErrors.username;
    setFieldErrors({});
    setCode("");
    const normalizedUsername = username.trim().toLowerCase();

    const nextWarnings = {
      email: email.trim() === "",
      username: normalizedUsername === "",
      password: password.trim() === "",
      code: false,
    };
    setWarningFields(nextWarnings);

    if (nextWarnings.email || nextWarnings.username || nextWarnings.password) {
      const missingFieldErrors: FieldErrors = {};
      if (nextWarnings.email) missingFieldErrors.email = "Inserisci la tua email.";
      if (nextWarnings.username) {
        missingFieldErrors.username =
          previousUsernameError === USERNAME_EMAIL_MESSAGE
            ? USERNAME_EMAIL_MESSAGE
            : "Scegli uno username per continuare.";
      }
      if (nextWarnings.password) {
        missingFieldErrors.password = "Inserisci una password per continuare.";
      }
      setFieldErrors(missingFieldErrors);
      toast({
        variant: "warning",
        title:
          missingFieldErrors.username === USERNAME_EMAIL_MESSAGE
            ? "Username da correggere"
            : "Controlla i campi evidenziati",
        description:
          missingFieldErrors.username === USERNAME_EMAIL_MESSAGE
            ? USERNAME_EMAIL_MESSAGE
            : "Compila i campi richiesti evidenziati prima di continuare.",
      });
      return;
    }

    const usernameError = validateUsername(normalizedUsername);
    if (usernameError) {
      setFieldErrors({ username: usernameError });
      setWarningFields((current) => ({ ...current, username: true }));
      toast({
        variant: "warning",
        title: "Username da correggere",
        description: usernameError,
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

    await signUp.reset();

    const { error: createError } = await signUp.password({
      emailAddress: email.trim(),
      username: normalizedUsername,
      password,
      unsafeMetadata: {
        phoneNumber: getNormalizedPhoneNumber(),
      },
    });
    logDevSignUpState("after password", signUp, createError);
    if (createError) {
      const feedback = getCreateErrorFeedback(createError);
      setFieldErrors(feedback.fields);
      toast({
        variant: "error",
        title: feedback.title,
        description: feedback.description,
      });
      return;
    }

    const { error: prepareError } = await signUp.verifications.sendEmailCode();
    logDevSignUpState("after sendEmailCode", signUp, prepareError);
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
      code: code.trim(),
    });
    logDevSignUpState("after verifyEmailCode", signUp, attemptError);

    if (attemptError) {
      if (isAlreadyUsedVerificationError(attemptError)) {
        if (canFinalizeSignUp(signUp)) {
          await finalizeAndEnterApp("/complete-profile?source=signup&next=/dashboard");
          return;
        }

        const display =
          "Questo codice è già stato usato. Richiedi un nuovo codice e riprova.";
        setFieldErrors({ code: display });
        setCode("");
        toast({
          variant: "warning",
          title: "Codice già usato",
          description: display,
        });
        return;
      }
      const display = getSafeAuthErrorMessage(
        attemptError,
        "Il codice non è valido o è scaduto. Richiedine uno nuovo dalla mail.",
      );
      setFieldErrors({ code: display });
      setCode("");
      toast({
        variant: "error",
        title: "Verifica non riuscita",
        description: display,
      });
      return;
    }

    if (!canFinalizeSignUp(signUp)) {
      const display = getPendingSignUpMessage(signUp);
      setFieldErrors({ code: display });
      setCode("");
      toast({ variant: "warning", title: "Verifica incompleta", description: display });
      return;
    }

    await finalizeAndEnterApp("/complete-profile?source=signup&next=/dashboard");
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
    setCode("");
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
      title={
        step === "form"
          ? "Crea il tuo account"
          : "Verifica la tua email"
      }
      subtitle={
        step === "form"
          ? "Inizia gratis in pochi secondi"
          : (
            <>
              Stiamo inviando il codice a{" "}
              <Text as="span" className="auth-email-highlight">{email.trim()}</Text>. Controlla la
              posta in arrivo e lo spam.
            </>
            )
      }
      steps={{ current: step === "form" ? 1 : 2, total: 2 }}
      onBack={step === "verify" ? () => setStep("form") : undefined}
    >
      <ClerkCaptchaSlot />

      {step === "form" ? (
        <>
          <Stack gap="3">
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
          </Stack>

          <Text as="span" className="auth-divider">
            oppure
          </Text>

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
              error={fieldErrors.email}
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
              error={fieldErrors.username}
              status={
                fieldErrors.username || warningFields.username ? "error" : "default"
              }
            >
              <FormControl>
                <Input
                  type="text"
                  placeholder="nomechef"
                  name="qoovex-signup-username"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="text"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleUsernameInput(e.target.value);
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    handleUsernameInput(e.target.value);
                  }}
                />
              </FormControl>
            </FormField>

            <PhoneNumberField
              label={
                <>
                  Numero di telefono{" "}
                  <Text as="span" className="auth-optional-label" aria-label="campo facoltativo">
                    facoltativo
                  </Text>
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
              error={fieldErrors.password}
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
          </Form>

          <Text className="auth-footer-text">
            Hai già un account? <Link href={signInHref}>Accedi</Link>
          </Text>
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
            <FormControl>
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
            </FormControl>
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

          <Text className="auth-footer-text">
            Non hai ricevuto il codice?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResendDisabled}
              className="auth-inline-link-button"
            >
              {isResending ? "Reinvio in corso..." : "Invia di nuovo"}
            </button>
            <Text as="span" className="auth-inline-countdown" aria-live="polite" aria-atomic="true">
              {resendCountdown > 0 ? ` tra ${resendCountdown}s` : "\u00a0"}
            </Text>
          </Text>
        </Form>
      )}
    </AuthShell>
  );
}
