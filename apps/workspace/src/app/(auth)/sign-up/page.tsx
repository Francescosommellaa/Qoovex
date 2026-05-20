"use client";

import { useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import {
  Box,
  Button,
  Form,
  FormActions,
  FormControl,
  FormField,
  Input,
  OtpInput,
  Stack,
  Text,
  useToast,
} from "@qoovex/ui";
import { getSafeAuthErrorMessage } from "@shared/lib/auth-error";
import {
  buildUsernameSuggestions,
  normalizeUsernameInput,
  validateUsername,
} from "@shared/lib/username";
import { AuthShell, OAuthButton } from "../ui";

type Step = "profile" | "username" | "verify";

type WarningFields = {
  email: boolean;
  firstName: boolean;
  password: boolean;
  username: boolean;
  code: boolean;
};

type UsernameAvailability = {
  username: string;
  valid: boolean;
  available: boolean;
  message: string;
  suggestions: string[];
};

type SignUpState = ReturnType<typeof useSignUp>["signUp"];

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

function canFinalizeSignUp(signUp: SignUpState) {
  return signUp.status === "complete" || Boolean(signUp.createdSessionId);
}

function getCreateErrorMessage(error: unknown) {
  return getSafeAuthErrorMessage(
    error,
    "Non e stato possibile creare l'account. Controlla i campi evidenziati e riprova.",
  );
}

export default function SignUpPage() {
  const RESEND_COOLDOWN_SECONDS = 45;
  const { signUp, fetchStatus } = useSignUp();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const didHydrateEmail = React.useRef(false);

  const [step, setStep] = React.useState<Step>("profile");
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [code, setCode] = React.useState("");
  const [availability, setAvailability] =
    React.useState<UsernameAvailability | null>(null);
  const [checkingUsername, setCheckingUsername] = React.useState(false);
  const [resendAvailableAt, setResendAvailableAt] = React.useState<number | null>(null);
  const [nowMs, setNowMs] = React.useState(Date.now());
  const [isResending, setIsResending] = React.useState(false);
  const [warningFields, setWarningFields] = React.useState<WarningFields>({
    email: false,
    firstName: false,
    password: false,
    username: false,
    code: false,
  });

  const isLoading = fetchStatus === "fetching";

  React.useEffect(() => {
    if (didHydrateEmail.current) return;
    const fromUrl = searchParams.get("email");
    if (fromUrl) {
      setEmail(decodeURIComponent(fromUrl));
      didHydrateEmail.current = true;
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (!resendAvailableAt) return;
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [resendAvailableAt]);

  React.useEffect(() => {
    const normalized = normalizeUsernameInput(username);
    const localError = validateUsername(normalized);

    if (!normalized) {
      setAvailability(null);
      setCheckingUsername(false);
      return;
    }

    if (localError) {
      setAvailability({
        username: normalized,
        valid: false,
        available: false,
        message: localError,
        suggestions: buildUsernameSuggestions({ firstName, lastName, email }),
      });
      setCheckingUsername(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const params = new URLSearchParams({
          username: normalized,
          firstName,
          lastName,
          email,
        });
        const response = await fetch(`/api/auth/username?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = (await response.json()) as UsernameAvailability;
        setAvailability(payload);
      } finally {
        setCheckingUsername(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [email, firstName, lastName, username]);

  function startResendCooldown() {
    setNowMs(Date.now());
    setResendAvailableAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
  }

  function getResendCountdown() {
    if (!resendAvailableAt) return 0;
    return Math.max(0, Math.ceil((resendAvailableAt - nowMs) / 1000));
  }

  function setFieldClean(field: keyof WarningFields) {
    if (warningFields[field]) {
      setWarningFields((current) => ({ ...current, [field]: false }));
    }
  }

  async function finalizeAndEnterApp(destinationPath = "/dashboard") {
    const { error: finalizeError } = await signUp.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          toast({
            variant: "warning",
            title: "Azione richiesta",
            description: "Completa i passaggi richiesti dall'account prima di continuare.",
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
      toast({
        variant: "error",
        title: "Completamento fallito",
        description: getSafeAuthErrorMessage(
          finalizeError,
          "Errore nel completare la registrazione. Riprova o contatta il supporto.",
        ),
      });
    }
  }

  function handleProfileStep(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextWarnings = {
      email: email.trim() === "",
      firstName: firstName.trim() === "",
      password: password.trim() === "",
      username: false,
      code: false,
    };
    setWarningFields(nextWarnings);

    if (nextWarnings.email || nextWarnings.firstName || nextWarnings.password) {
      toast({
        variant: "warning",
        title: "Controlla i campi evidenziati",
        description: "Inserisci nome, email e password prima di continuare.",
      });
      return;
    }

    setUsername((current) =>
      current || buildUsernameSuggestions({ firstName, lastName, email })[0] || "",
    );
    setStep("username");
  }

  async function handleUsernameStep(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUsername = normalizeUsernameInput(username);
    const usernameError = validateUsername(normalizedUsername);

    if (
      !normalizedUsername ||
      usernameError ||
      !availability?.available ||
      availability.username !== normalizedUsername
    ) {
      setWarningFields((current) => ({ ...current, username: true }));
      toast({
        variant: "warning",
        title: "Username da correggere",
        description:
          usernameError ??
          "Scegli uno username disponibile tra quelli suggeriti o modificane uno valido.",
      });
      return;
    }

    await signUp.reset();
    const { error: createError } = await signUp.password({
      emailAddress: email.trim(),
      username: normalizedUsername,
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      password,
    });

    if (createError) {
      setWarningFields((current) => ({
        ...current,
        email: true,
        password: true,
        username: true,
      }));
      toast({
        variant: "error",
        title: "Registrazione non completata",
        description: getCreateErrorMessage(createError),
      });
      return;
    }

    const { error: prepareError } = await signUp.verifications.sendEmailCode();
    if (prepareError) {
      toast({
        variant: "error",
        title: "Invio codice non riuscito",
        description: getSafeAuthErrorMessage(
          prepareError,
          "Non siamo riusciti a inviare il codice. Riprova tra qualche istante.",
        ),
      });
      return;
    }

    setStep("verify");
    startResendCooldown();
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.trim()) {
      setWarningFields((current) => ({ ...current, code: true }));
      toast({
        variant: "warning",
        title: "Codice mancante",
        description: "Inserisci il codice a 6 cifre ricevuto via email.",
      });
      return;
    }

    const { error: attemptError } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });

    if (attemptError) {
      setCode("");
      setWarningFields((current) => ({ ...current, code: true }));
      toast({
        variant: "error",
        title: "Verifica non riuscita",
        description: getSafeAuthErrorMessage(
          attemptError,
          "Il codice non e valido o e scaduto. Richiedine uno nuovo dalla mail.",
        ),
      });
      return;
    }

    if (!canFinalizeSignUp(signUp)) {
      setCode("");
      toast({
        variant: "warning",
        title: "Verifica incompleta",
        description: "Completa la verifica richiesta prima di entrare nel workspace.",
      });
      return;
    }

    await finalizeAndEnterApp("/dashboard");
  }

  async function handleResend() {
    const countdown = getResendCountdown();
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    const { error: resendError } = await signUp.verifications.sendEmailCode();
    if (resendError) {
      toast({
        variant: "error",
        title: "Reinvio non riuscito",
        description: getSafeAuthErrorMessage(
          resendError,
          "Impossibile reinviare il codice in questo momento.",
        ),
      });
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
  const usernameStatus =
    warningFields.username || (availability && !availability.available)
      ? "error"
      : availability?.available
        ? "success"
        : "default";
  const usernameSuggestions =
    availability?.suggestions.length
      ? availability.suggestions
      : buildUsernameSuggestions({ firstName, lastName, email });

  return (
    <AuthShell
      title={
        step === "profile"
          ? "Crea il tuo account"
          : step === "username"
            ? "Scegli lo username"
            : "Verifica la tua email"
      }
      subtitle={
        step === "profile"
          ? "Inserisci i dati essenziali per aprire il workspace"
          : step === "username"
            ? "Sara visibile nelle ricette pubbliche e nelle collaborazioni"
            : (
                <>
                  Codice inviato a{" "}
                  <Text as="span" className="auth-email-highlight">
                    {email.trim()}
                  </Text>
                  . Controlla posta in arrivo e spam.
                </>
              )
      }
      steps={{
        current: step === "profile" ? 1 : step === "username" ? 2 : 3,
        total: 3,
      }}
      onBack={
        step === "username"
          ? () => setStep("profile")
          : step === "verify"
            ? () => setStep("username")
            : undefined
      }
    >
      <ClerkCaptchaSlot />

      {step === "profile" ? (
        <>
          <Form
            variant="plain"
            layout="stack"
            density="comfortable"
            labelStyle="soft"
            noValidate
            onSubmit={handleProfileStep}
          >
            <div className="grid grid-cols-2 gap-(--spacing-3)">
              <FormField
                label="Nome"
                required
                status={warningFields.firstName ? "error" : "default"}
              >
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Mario"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setFirstName(event.target.value);
                      setFieldClean("firstName");
                    }}
                  />
                </FormControl>
              </FormField>

              <FormField label="Cognome">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Rossi"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setLastName(event.target.value)
                    }
                  />
                </FormControl>
              </FormField>
            </div>

            <FormField
              label="Email"
              required
              status={warningFields.email ? "error" : "default"}
            >
              <FormControl>
                <Input
                  type="email"
                  placeholder="chef@cucina.it"
                  autoComplete="email"
                  value={email}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(event.target.value);
                    setFieldClean("email");
                  }}
                />
              </FormControl>
            </FormField>

            <FormField
              label="Password"
              required
              status={warningFields.password ? "error" : "default"}
            >
              <FormControl>
                <Input
                  type="password"
                  placeholder="Minimo 8 caratteri"
                  autoComplete="new-password"
                  showPasswordToggle
                  showStrength
                  value={password}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(event.target.value);
                    setFieldClean("password");
                  }}
                />
              </FormControl>
            </FormField>

            <FormActions align="stretch">
              <Button type="submit" variant="primary" size="md" className="w-full">
                Successivo
              </Button>
            </FormActions>
          </Form>

          <Stack gap="3" className="auth-social-stack">
            <div className="grid grid-cols-2 gap-(--spacing-3)">
              <OAuthButton
                mode="signUp"
                provider="google"
                disabledReason="Accesso social presto disponibile"
                onError={(message) => {
                  toast({
                    variant: "error",
                    title: "Accesso Google non riuscito",
                    description: message,
                  });
                }}
              />
              <OAuthButton
                mode="signUp"
                provider="apple"
                disabledReason="Accesso social presto disponibile"
                onError={(message) => {
                  toast({
                    variant: "error",
                    title: "Accesso Apple non riuscito",
                    description: message,
                  });
                }}
              />
            </div>
            <Text className="auth-terms-text">
              Creando un account accetti i termini, le condizioni e le regole
              sulla privacy di Qoovex.
            </Text>
          </Stack>

          <Text className="auth-footer-text">
            Hai gia un account? <Link href={signInHref}>Accedi</Link>
          </Text>
        </>
      ) : step === "username" ? (
        <>
          <Form
            variant="plain"
            layout="stack"
            density="comfortable"
            labelStyle="soft"
            noValidate
            onSubmit={handleUsernameStep}
          >
            <FormField label="Username" required status={usernameStatus}>
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
                  value={username}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(normalizeUsernameInput(event.target.value));
                    setFieldClean("username");
                  }}
                />
              </FormControl>
            </FormField>

            <Stack gap="2">
              <Text
                size="xs"
                tone={availability?.available ? "success" : "muted"}
                aria-live="polite"
              >
                {checkingUsername
                  ? "Verifica disponibilita..."
                  : availability
                    ? availability.message
                    : "Usa 3-32 caratteri: lettere, numeri, punto, trattino o underscore."}
              </Text>
              {usernameSuggestions.length > 0 ? (
                <div className="flex flex-wrap gap-(--spacing-2)">
                  {usernameSuggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUsername(suggestion);
                        setFieldClean("username");
                      }}
                    >
                      @{suggestion}
                    </Button>
                  ))}
                </div>
              ) : null}
            </Stack>

            <FormActions align="stretch">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isLoading}
                loadingLabel="Creazione account..."
                className="w-full"
              >
                Crea account
              </Button>
            </FormActions>
          </Form>

          <Text className="auth-footer-text">
            Hai gia un account? <Link href={signInHref}>Accedi</Link>
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
            status={warningFields.code ? "error" : "default"}
          >
            <FormControl>
              <OtpInput
                value={code}
                onChange={(nextCode) => {
                  setCode(nextCode);
                  setFieldClean("code");
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
              loadingLabel="Verifica in corso..."
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
