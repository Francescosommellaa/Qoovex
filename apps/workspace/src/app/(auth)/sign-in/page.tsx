"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Input,
  Stack,
  Text,
  Form,
  FormField,
  FormControl,
  FormActions,
  OtpInput,
  useToast,
} from "@qoovex/ui";
import {
  getGenericAuthFailureToast,
  getSafeRedirectPath,
} from "@shared/lib/auth-flow";
import {
  formatAuthIdentifierInput,
  normalizeAuthIdentifierForClerk,
} from "@shared/lib/auth-identifier";
import { WorkspaceBrandLoader } from "@shared/ui";
import { AuthShell, OAuthButton } from "../ui";

type SignInMfaStrategy = "totp" | "phone" | "backup";

type SignInWithMfa = {
  status?: string | null;
  reset: () => Promise<unknown>;
  create: (params: Record<string, unknown>) => Promise<{ error?: unknown }>;
  finalize: (params: {
    navigate: (params: {
      session?: { currentTask?: unknown } | null;
      decorateUrl: (url: string) => string;
    }) => Promise<void> | void;
  }) => Promise<{ error?: unknown }>;
  mfa?: {
    sendPhoneCode?: () => Promise<{ error?: unknown } | void>;
    verifyPhoneCode?: (params: { code: string }) => Promise<{ error?: unknown } | void>;
    verifyTOTP?: (params: { code: string }) => Promise<{ error?: unknown } | void>;
    verifyBackupCode?: (params: { code: string }) => Promise<{ error?: unknown } | void>;
  };
};

export default function SignInPage() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { signIn, fetchStatus } = useSignIn();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const didHydrateIdentifier = useRef(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isCredentialsInvalid, setIsCredentialsInvalid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDevSigningIn, setIsDevSigningIn] = useState(false);
  const [isProvisioningDashboard, setIsProvisioningDashboard] = useState(false);
  const [isLocalDevHost, setIsLocalDevHost] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaStrategy, setMfaStrategy] = useState<SignInMfaStrategy>("totp");
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [isMfaInvalid, setIsMfaInvalid] = useState(false);
  const [warningFields, setWarningFields] = useState<{
    identifier: boolean;
    password: boolean;
  }>({
    identifier: false,
    password: false,
  });

  const isLoading = fetchStatus === "fetching";
  const isBusy =
    isLoading ||
    isSubmitting ||
    isDevSigningIn ||
    !isAuthLoaded ||
    isProvisioningDashboard;
  const showDevAuthButton = isLocalDevHost;

  useEffect(() => {
    const hostname = window.location.hostname;
    setIsLocalDevHost(
      hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "::1",
    );
  }, []);

  useEffect(() => {
    if (didHydrateIdentifier.current) return;
    const fromUrl = searchParams.get("email");
    if (fromUrl) {
      setIdentifier(normalizeAuthIdentifierForClerk(decodeURIComponent(fromUrl)));
      didHydrateIdentifier.current = true;
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isAuthLoaded, isSignedIn, router]);

  function notifyAuthFailure() {
    toast({
      variant: "error",
      title: "Accesso non riuscito",
      description: getGenericAuthFailureToast().description,
    });
  }

  async function finalizeSignIn(destinationPath = "/dashboard") {
    const activeSignIn = signIn as SignInWithMfa | undefined;
    if (!activeSignIn) return;

    const { error: finalizeError } = await activeSignIn.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          toast({
            variant: "warning",
            title: "Azione richiesta",
            description: "Completa i passaggi richiesti dal tuo account prima di continuare.",
          });
          return;
        }

        setIsProvisioningDashboard(true);
        const url = decorateUrl(getSafeRedirectPath(destinationPath));
        const destination = url.startsWith("http")
          ? url
          : `${window.location.origin}${url}`;
        window.location.assign(destination);
      },
    });

    if (finalizeError) {
      setIsCredentialsInvalid(true);
      notifyAuthFailure();
    }
  }

  async function prepareMfa(nextStrategy: SignInMfaStrategy) {
    const activeSignIn = signIn as SignInWithMfa | undefined;
    setMfaStrategy(nextStrategy);
    setMfaCode("");
    setIsMfaInvalid(false);

    if (nextStrategy === "phone") {
      await activeSignIn?.mfa?.sendPhoneCode?.();
    }
  }

  async function handleDevSignIn() {
    setIsDevSigningIn(true);

    try {
      const redirectUrl = getSafeRedirectPath(searchParams.get("redirect_url"));
      const response = await fetch(
        `/api/dev-auth?redirect_url=${encodeURIComponent(redirectUrl)}`,
        { method: "POST" },
      );

      if (!response.ok) {
        notifyAuthFailure();
        return;
      }

      const payload = (await response.json()) as { destination?: unknown };
      const destination =
        typeof payload.destination === "string" ? payload.destination : "/dashboard";

      setIsProvisioningDashboard(true);
      window.location.assign(destination);
    } finally {
      setIsDevSigningIn(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsCredentialsInvalid(false);

    const normalizedIdentifier = normalizeAuthIdentifierForClerk(identifier);

    const nextWarnings = {
      identifier: normalizedIdentifier === "",
      password: password.trim() === "",
    };
    setWarningFields(nextWarnings);

    if (nextWarnings.identifier || nextWarnings.password) {
      toast({
        variant: "warning",
        title: "Campi mancanti",
        description: "Inserisci email o username e password per continuare.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const activeSignIn = signIn as SignInWithMfa | undefined;
      if (!activeSignIn) {
        notifyAuthFailure();
        return;
      }

      await activeSignIn.reset();

      const { error } = await activeSignIn.create({
        identifier: normalizedIdentifier,
        password,
      });

      if (error) {
        setIsCredentialsInvalid(true);
        notifyAuthFailure();
        return;
      }

      if (activeSignIn.status === "needs_second_factor") {
        setIsMfaRequired(true);
        await prepareMfa("totp");
        toast({
          variant: "info",
          title: "Verifica richiesta",
          description: "Inserisci il codice del secondo fattore per completare l'accesso.",
        });
        return;
      }

      if (activeSignIn.status === "complete") {
        await finalizeSignIn("/dashboard");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMfaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const activeSignIn = signIn as SignInWithMfa | undefined;
    const normalizedCode = mfaCode.trim();

    if (!activeSignIn || !normalizedCode) {
      setIsMfaInvalid(true);
      toast({
        variant: "warning",
        title: "Codice richiesto",
        description: "Inserisci il codice di verifica per continuare.",
      });
      return;
    }

    setIsSubmitting(true);
    setIsMfaInvalid(false);

    try {
      const verifier =
        mfaStrategy === "phone"
          ? activeSignIn.mfa?.verifyPhoneCode
          : mfaStrategy === "backup"
            ? activeSignIn.mfa?.verifyBackupCode
            : activeSignIn.mfa?.verifyTOTP;

      const result = await verifier?.({ code: normalizedCode });
      if (result && "error" in result && result.error) {
        setIsMfaInvalid(true);
        setMfaCode("");
        notifyAuthFailure();
        return;
      }

      if (activeSignIn.status === "complete") {
        await finalizeSignIn("/dashboard");
        return;
      }

      setIsMfaInvalid(true);
      notifyAuthFailure();
    } finally {
      setIsSubmitting(false);
    }
  }

  const normalizedForLinks = normalizeAuthIdentifierForClerk(identifier);
  const signUpHref =
    normalizedForLinks === ""
      ? "/sign-up"
      : `/sign-up?email=${encodeURIComponent(normalizedForLinks)}`;

  return (
    <AuthShell
      title="Accedi al workspace"
      subtitle="Inserisci le tue credenziali o usa un accesso rapido"
    >
      <Stack gap="3">
        <OAuthButton
          mode="signIn"
          provider="google"
          disabledReason="Accesso social presto disponibile"
          onError={() => {
            setIsCredentialsInvalid(true);
            notifyAuthFailure();
          }}
        />
        <OAuthButton
          mode="signIn"
          provider="apple"
          disabledReason="Accesso social presto disponibile"
          onError={() => {
            setIsCredentialsInvalid(true);
            notifyAuthFailure();
          }}
        />
      </Stack>

      {showDevAuthButton ? (
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="w-full"
          loading={isDevSigningIn}
          loadingLabel="Accesso sviluppo..."
          disabled={isBusy}
          onClick={handleDevSignIn}
        >
          Entra in sviluppo
        </Button>
      ) : null}

      <Text as="span" className="auth-divider">
        oppure
      </Text>

      {isMfaRequired ? (
        <Form
          variant="plain"
          layout="stack"
          density="comfortable"
          labelStyle="soft"
          noValidate
          onSubmit={handleMfaSubmit}
        >
          <FormField
            label={
              mfaStrategy === "backup"
                ? "Codice di backup"
                : "Codice di verifica"
            }
            required
            helperText={
              mfaStrategy === "phone"
                ? "Usa il codice ricevuto via SMS."
                : mfaStrategy === "backup"
                  ? "Usa uno dei codici di backup salvati in precedenza."
                  : "Usa il codice della tua app authenticator."
            }
            status={isMfaInvalid ? "error" : "default"}
          >
            <FormControl>
              {mfaStrategy === "backup" ? (
                <Input
                  type="text"
                  autoComplete="one-time-code"
                  value={mfaCode}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setMfaCode(event.target.value);
                    if (isMfaInvalid) setIsMfaInvalid(false);
                  }}
                />
              ) : (
                <OtpInput
                  value={mfaCode}
                  onChange={(nextCode) => {
                    setMfaCode(nextCode);
                    if (isMfaInvalid) setIsMfaInvalid(false);
                  }}
                  length={6}
                  requestInitialFocusOnDesktop
                  aria-label="Codice secondo fattore"
                />
              )}
            </FormControl>
          </FormField>

          <div className="grid gap-(--spacing-2) sm:grid-cols-3">
            <Button
              type="button"
              variant={mfaStrategy === "totp" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => void prepareMfa("totp")}
            >
              App
            </Button>
            <Button
              type="button"
              variant={mfaStrategy === "phone" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => void prepareMfa("phone")}
            >
              SMS
            </Button>
            <Button
              type="button"
              variant={mfaStrategy === "backup" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => void prepareMfa("backup")}
            >
              Backup
            </Button>
          </div>

          <FormActions align="stretch">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isBusy}
              loadingLabel="Verifica in corso..."
              disabled={isBusy}
              className="w-full"
            >
              Completa accesso
            </Button>
          </FormActions>
        </Form>
      ) : (
        <Form
        variant="plain"
        layout="stack"
        density="comfortable"
        labelStyle="soft"
        noValidate
        onSubmit={handleSubmit}
      >
        <FormField
          label="Email o username"
          required
          status={warningFields.identifier || isCredentialsInvalid ? "error" : "default"}
        >
          <FormControl>
            <Input
              type="text"
              placeholder="nome@esempio.com o nomechef"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isBusy}
              value={identifier}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setIdentifier(formatAuthIdentifierInput(e.target.value));
                if (isCredentialsInvalid) setIsCredentialsInvalid(false);
                if (warningFields.identifier) {
                  setWarningFields((current) => ({ ...current, identifier: false }));
                }
              }}
            />
          </FormControl>
        </FormField>

        <FormField
          label="Password"
          required
          status={warningFields.password || isCredentialsInvalid ? "error" : "default"}
        >
          <FormControl>
            <Input
              type="password"
              placeholder="La tua password"
              autoComplete="current-password"
              showPasswordToggle
              disabled={isBusy}
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

        <Box className="auth-inline-link-row">
          <Link
            href={
              normalizedForLinks
                ? `/forgot-password?email=${encodeURIComponent(normalizedForLinks)}`
                : "/forgot-password"
            }
            className="auth-muted-link"
          >
            Password dimenticata?
          </Link>
        </Box>

        <FormActions align="stretch">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isBusy}
            loadingLabel="Accesso in corso…"
            disabled={isBusy}
            className="w-full"
          >
            Accedi
          </Button>
        </FormActions>
        </Form>
      )}

      <Text className="auth-footer-text">
        Non hai un account? <Link href={signUpHref}>Registrati</Link>
      </Text>

      {isProvisioningDashboard ? (
        <WorkspaceBrandLoader fullscreen label="Apertura dashboard..." />
      ) : null}
    </AuthShell>
  );
}
