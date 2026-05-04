"use client";

import { useState, useEffect, useRef } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Input,
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
import { AuthShell, OAuthButton } from "../ui";

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const didHydrateIdentifier = useRef(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isCredentialsInvalid, setIsCredentialsInvalid] = useState(false);
  const [warningFields, setWarningFields] = useState<{
    identifier: boolean;
    password: boolean;
  }>({
    identifier: false,
    password: false,
  });

  const isLoading = fetchStatus === "fetching";

  useEffect(() => {
    if (didHydrateIdentifier.current) return;
    const fromUrl = searchParams.get("email");
    if (fromUrl) {
      setIdentifier(normalizeAuthIdentifierForClerk(decodeURIComponent(fromUrl)));
      didHydrateIdentifier.current = true;
    }
  }, [searchParams]);

  function notifyAuthFailure() {
    toast({
      variant: "error",
      title: "Accesso non riuscito",
      description: getGenericAuthFailureMessage(),
    });
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

    let { error } = await signIn.create({
      identifier: normalizedIdentifier,
      password,
    });

    if (
      error &&
      !normalizedIdentifier.includes("@")
    ) {
      const emailFromProfile = await resolveEmailForUsername(normalizedIdentifier);
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
          const url = decorateUrl("/dashboard");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.replace(url);
          }
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
      <div className="auth-oauth-stack">
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

        <div className="auth-inline-link-row">
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
        </div>

        <FormActions align="stretch">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isLoading}
            loadingLabel="Accesso in corso…"
            className="w-full"
          >
            Accedi
          </Button>
        </FormActions>
      </Form>

      <p className="auth-footer-text">
        Non hai un account? <Link href={signUpHref}>Registrati</Link>
      </p>
    </AuthShell>
  );
}
