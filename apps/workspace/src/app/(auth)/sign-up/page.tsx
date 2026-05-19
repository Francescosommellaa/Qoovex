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

type Step = "profile" | "credentials" | "verify";

type FieldErrors = {
  email?: string;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  confirmPassword?: string;
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
      "Non siamo riusciti a completare la registrazione con questi dati. Controlla i campi e riprova.";
    return {
      title: "Registrazione non completata",
      description,
      fields: {},
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
      "Non siamo riusciti a completare la registrazione con questi dati. Controlla i campi e riprova.";
    return {
      title: "Registrazione non completata",
      description,
      fields: {},
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

  const [step, setStep] = useState<Step>("profile");
  const [email, setEmail] = useState("");
  const [phoneRegionCode, setPhoneRegionCode] = useState("+39");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [isResending, setIsResending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [warningFields, setWarningFields] = useState<{
    email: boolean;
    phone: boolean;
    username: boolean;
    firstName: boolean;
    lastName: boolean;
    password: boolean;
    confirmPassword: boolean;
    code: boolean;
  }>({
    email: false,
    phone: false,
    username: false,
    firstName: false,
    lastName: false,
    password: false,
    confirmPassword: false,
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

  function getNormalizedPhoneNumber(): string {
    const normalizedPhoneDigits = phoneNumber.replace(/[^\d]/g, "");
    return normalizedPhoneDigits ? `${phoneRegionCode}${normalizedPhoneDigits}` : "";
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

  function handleProfileStep(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    const normalizedPhoneDigits = phoneNumber.replace(/[^\d]/g, "");

    const nextWarnings = {
      email: email.trim() === "",
      phone: normalizedPhoneDigits.length < 6,
      username: false,
      firstName: firstName.trim() === "",
      lastName: lastName.trim() === "",
      password: false,
      confirmPassword: false,
      code: false,
    };
    setWarningFields(nextWarnings);

    if (
      nextWarnings.email ||
      nextWarnings.phone ||
      nextWarnings.firstName ||
      nextWarnings.lastName
    ) {
      const missingFieldErrors: FieldErrors = {};
      if (nextWarnings.email) missingFieldErrors.email = "Inserisci la tua email.";
      if (nextWarnings.phone) missingFieldErrors.phone = "Inserisci un telefono valido.";
      if (nextWarnings.firstName) missingFieldErrors.firstName = "Inserisci il nome.";
      if (nextWarnings.lastName) missingFieldErrors.lastName = "Inserisci il cognome.";
      setFieldErrors(missingFieldErrors);
      toast({
        variant: "warning",
        title: "Controlla i campi evidenziati",
        description: "Compila i dati richiesti prima di continuare.",
      });
      return;
    }

    setStep("credentials");
  }

  async function handleCredentialsStep(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setCode("");

    const nextWarnings = {
      email: false,
      phone: false,
      username: username.trim() === "",
      firstName: false,
      lastName: false,
      password: password.trim() === "",
      confirmPassword: confirmPassword.trim() === "",
      code: false,
    };
    setWarningFields(nextWarnings);

    if (nextWarnings.username || nextWarnings.password || nextWarnings.confirmPassword) {
      setFieldErrors({
        username: nextWarnings.username ? "Scegli uno username per continuare." : undefined,
        password: nextWarnings.password ? "Inserisci una password." : undefined,
        confirmPassword: nextWarnings.confirmPassword
          ? "Conferma la password."
          : undefined,
      });
      toast({
        variant: "warning",
        title: "Credenziali da completare",
        description: "Inserisci username, password e conferma prima di creare l'account.",
      });
      return;
    }

    const normalizedUsername = username.trim().toLowerCase();
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

    if (password !== confirmPassword) {
      setFieldErrors({
        confirmPassword: "Le password non coincidono.",
      });
      setWarningFields((current) => ({
        ...current,
        confirmPassword: true,
      }));
      toast({
        variant: "warning",
        title: "Password diverse",
        description: "Controlla la conferma password e riprova.",
      });
      return;
    }

    await signUp.reset();

    const { error: createError } = await signUp.password({
      emailAddress: email.trim(),
      username: normalizedUsername,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
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
          await finalizeAndEnterApp("/dashboard");
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

    await finalizeAndEnterApp("/dashboard");
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
        step === "profile"
          ? "Crea il tuo account"
          : step === "credentials"
            ? "Proteggi l'accesso"
            : "Verifica la tua email"
      }
      subtitle={
        step === "profile"
          ? "Raccogliamo solo i dati essenziali del workspace"
          : step === "credentials"
            ? "Scegli una password sicura prima di creare l'account"
          : (
            <>
              Stiamo inviando il codice a{" "}
              <Text as="span" className="auth-email-highlight">{email.trim()}</Text>. Controlla la
              posta in arrivo e lo spam.
            </>
            )
      }
      steps={{
        current: step === "profile" ? 1 : step === "credentials" ? 2 : 3,
        total: 3,
      }}
      onBack={
        step === "credentials"
          ? () => setStep("profile")
          : step === "verify"
            ? () => setStep("credentials")
            : undefined
      }
    >
      <ClerkCaptchaSlot />

      {step === "profile" ? (
        <>
          <Stack gap="3">
            <OAuthButton
              mode="signUp"
              provider="google"
              disabledReason="Accesso social presto disponibile"
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
              disabledReason="Accesso social presto disponibile"
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
            onSubmit={handleProfileStep}
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

            <div className="grid gap-(--spacing-3) sm:grid-cols-2">
              <FormField
                label="Nome"
                required
                error={fieldErrors.firstName}
                status={
                  fieldErrors.firstName || warningFields.firstName
                    ? "error"
                    : "default"
                }
              >
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Francesco"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFirstName(e.target.value);
                      if (warningFields.firstName) {
                        setWarningFields((current) => ({
                          ...current,
                          firstName: false,
                        }));
                      }
                      if (fieldErrors.firstName) {
                        setFieldErrors((current) => ({
                          ...current,
                          firstName: undefined,
                        }));
                      }
                    }}
                  />
                </FormControl>
              </FormField>

              <FormField
                label="Cognome"
                required
                error={fieldErrors.lastName}
                status={
                  fieldErrors.lastName || warningFields.lastName
                    ? "error"
                    : "default"
                }
              >
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Sommella"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setLastName(e.target.value);
                      if (warningFields.lastName) {
                        setWarningFields((current) => ({
                          ...current,
                          lastName: false,
                        }));
                      }
                      if (fieldErrors.lastName) {
                        setFieldErrors((current) => ({
                          ...current,
                          lastName: undefined,
                        }));
                      }
                    }}
                  />
                </FormControl>
              </FormField>
            </div>

            <PhoneNumberField
              label="Telefono"
              required
              regionCode={phoneRegionCode}
              onRegionCodeChange={(nextRegionCode) => {
                setPhoneRegionCode(nextRegionCode);
                if (warningFields.phone) {
                  setWarningFields((current) => ({ ...current, phone: false }));
                }
                if (fieldErrors.phone) {
                  setFieldErrors((current) => ({ ...current, phone: undefined }));
                }
              }}
              nationalNumber={phoneNumber}
              onNationalNumberChange={(nextPhoneNumber) => {
                setPhoneNumber(nextPhoneNumber);
                if (warningFields.phone) {
                  setWarningFields((current) => ({ ...current, phone: false }));
                }
                if (fieldErrors.phone) {
                  setFieldErrors((current) => ({ ...current, phone: undefined }));
                }
              }}
              helperText={fieldErrors.phone}
              className={
                fieldErrors.phone || warningFields.phone ? "auth-warning-field" : undefined
              }
            />

            <FormActions align="stretch">
              <Button type="submit" variant="primary" size="md" className="w-full">
                Successivo
              </Button>
            </FormActions>
          </Form>

          <Text className="auth-footer-text">
            Hai gia un account? <Link href={signInHref}>Accedi</Link>
          </Text>
        </>
      ) : step === "credentials" ? (
        <>
          <Form
            variant="plain"
            layout="stack"
            density="comfortable"
            labelStyle="soft"
            noValidate
            onSubmit={handleCredentialsStep}
          >
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

            <FormField
              label="Conferma password"
              required
              error={fieldErrors.confirmPassword}
              status={
                fieldErrors.confirmPassword || warningFields.confirmPassword
                  ? "error"
                  : "default"
              }
            >
              <FormControl>
                <Input
                  type="password"
                  placeholder="Ripeti la password"
                  autoComplete="new-password"
                  showPasswordToggle
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setConfirmPassword(e.target.value);
                    if (warningFields.confirmPassword) {
                      setWarningFields((current) => ({
                        ...current,
                        confirmPassword: false,
                      }));
                    }
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((current) => ({
                        ...current,
                        confirmPassword: undefined,
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
