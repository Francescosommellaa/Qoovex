"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Form,
  FormActions,
  FormControl,
  FormField,
  Input,
  Stack,
  Text,
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

type SignInPrimaryFlow = {
  status?: string | null;
  reset: () => Promise<unknown>;
  create: (params: Record<string, unknown>) => Promise<{ error?: unknown }>;
  finalize: (params: {
    navigate: (params: {
      session?: { currentTask?: unknown } | null;
      decorateUrl: (url: string) => string;
    }) => Promise<void> | void;
  }) => Promise<{ error?: unknown }>;
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
  const [warningFields, setWarningFields] = useState({
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
    if (isSignedIn) router.replace("/dashboard");
  }, [isAuthLoaded, isSignedIn, router]);

  function markLoginInvalid() {
    setIsCredentialsInvalid(true);
    setWarningFields({ identifier: true, password: true });
  }

  function notifyAuthFailure() {
    toast({
      variant: "error",
      title: "Accesso non riuscito",
      description: getGenericAuthFailureToast().description,
    });
  }

  async function finalizeSignIn(destinationPath = "/dashboard") {
    const activeSignIn = signIn as SignInPrimaryFlow | undefined;
    if (!activeSignIn) return;

    const { error: finalizeError } = await activeSignIn.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          markLoginInvalid();
          notifyAuthFailure();
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
      markLoginInvalid();
      notifyAuthFailure();
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
        markLoginInvalid();
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

    if (normalizedIdentifier === "" || password.trim() === "") {
      markLoginInvalid();
      notifyAuthFailure();
      return;
    }

    setIsSubmitting(true);

    try {
      const activeSignIn = signIn as SignInPrimaryFlow | undefined;
      if (!activeSignIn) {
        markLoginInvalid();
        notifyAuthFailure();
        return;
      }

      await activeSignIn.reset();

      const { error } = await activeSignIn.create({
        identifier: normalizedIdentifier,
        password,
      });

      if (error || activeSignIn.status !== "complete") {
        markLoginInvalid();
        notifyAuthFailure();
        return;
      }

      await finalizeSignIn("/dashboard");
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
                setIsCredentialsInvalid(false);
                setWarningFields({ identifier: false, password: false });
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
                setIsCredentialsInvalid(false);
                setWarningFields({ identifier: false, password: false });
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
            loadingLabel="Accesso in corso..."
            disabled={isBusy}
            className="w-full"
          >
            Accedi
          </Button>
        </FormActions>
      </Form>

      <Stack gap="3" className="auth-social-stack">
        <div className="grid grid-cols-2 gap-(--spacing-3)">
          <OAuthButton
            mode="signIn"
            provider="google"
            disabledReason="Accesso social presto disponibile"
            onError={() => {
              markLoginInvalid();
              notifyAuthFailure();
            }}
          />
          <OAuthButton
            mode="signIn"
            provider="apple"
            disabledReason="Accesso social presto disponibile"
            onError={() => {
              markLoginInvalid();
              notifyAuthFailure();
            }}
          />
        </div>
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

      <Text className="auth-footer-text">
        Non hai un account? <Link href={signUpHref}>Registrati</Link>
      </Text>

      {isProvisioningDashboard ? (
        <WorkspaceBrandLoader fullscreen label="Apertura dashboard..." />
      ) : null}
    </AuthShell>
  );
}
