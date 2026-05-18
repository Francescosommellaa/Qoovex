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
  useToast,
} from "@qoovex/ui";
import { resolveEmailForUsername } from "@shared/actions/resolve-email-for-username";
import { getGenericAuthFailureMessage } from "@shared/lib/auth-error";
import {
  formatAuthIdentifierInput,
  normalizeAuthIdentifierForClerk,
} from "@shared/lib/auth-identifier";
import { WorkspaceBrandLoader } from "@shared/ui";
import { AuthShell, OAuthButton } from "../ui";

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
  const showDevAuthButton =
    process.env.NODE_ENV === "development" || isLocalDevHost;

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
      description: getGenericAuthFailureMessage(),
    });
  }

  async function handleDevSignIn() {
    setIsDevSigningIn(true);

    try {
      const redirectUrl = searchParams.get("redirect_url") ?? "/dashboard";
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
      await signIn.reset();

      let { error } = await signIn.create({
        identifier: normalizedIdentifier,
        password,
      });

      if (
        error &&
        !normalizedIdentifier.includes("@")
      ) {
        let emailFromProfile: string | null = null;
        try {
          emailFromProfile = await resolveEmailForUsername(normalizedIdentifier);
        } catch (unknownError) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[sign-in] username lookup skipped", unknownError);
          }
        }

        if (emailFromProfile) {
          await signIn.reset();
          ({ error } = await signIn.create({
            identifier: emailFromProfile,
            password,
          }));
        }
      }

      if (error) {
        setIsCredentialsInvalid(true);
        notifyAuthFailure();
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

            setIsProvisioningDashboard(true);
            const url = decorateUrl("/dashboard");
            const destination = url.startsWith("http")
              ? url
              : `${window.location.origin}${url}`;
            window.location.assign(destination);
          },
        });
        if (finalizeError) {
          setIsCredentialsInvalid(true);
          toast({
            variant: "error",
            title: "Accesso non riuscito",
            description: getGenericAuthFailureMessage(),
          });
        }
      }
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
          onError={() => {
            setIsCredentialsInvalid(true);
            notifyAuthFailure();
          }}
        />
        <OAuthButton
          mode="signIn"
          provider="apple"
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

      <Text className="auth-footer-text">
        Non hai un account? <Link href={signUpHref}>Registrati</Link>
      </Text>

      {isProvisioningDashboard ? (
        <WorkspaceBrandLoader fullscreen label="Apertura dashboard..." />
      ) : null}
    </AuthShell>
  );
}
