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
import {
  getGenericAuthFailureMessage,
  getSafeAuthErrorMessage,
} from "@shared/lib/auth-error";
import { AuthShell, OAuthButton } from "../ui";

function isLikelyValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const didHydrateEmail = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCredentialsInvalid, setIsCredentialsInvalid] = useState(false);
  const [warningFields, setWarningFields] = useState<{
    email: boolean;
    password: boolean;
  }>({
    email: false,
    password: false,
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

    const nextWarnings = {
      email: email.trim() === "",
      password: password.trim() === "",
    };
    setWarningFields(nextWarnings);

    if (nextWarnings.email || nextWarnings.password) {
      toast({
        variant: "warning",
        title: "Campi mancanti",
        description: "Inserisci email e password per continuare.",
      });
      return;
    }

    if (!isLikelyValidEmail(email)) {
      setWarningFields({ email: true, password: false });
      toast({
        variant: "warning",
        title: "Email non valida",
        description: "Controlla il formato dell'indirizzo email.",
      });
      return;
    }

    const { error } = await signIn.password({ emailAddress: email.trim(), password });

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
          description: getSafeAuthErrorMessage(finalizeError),
        });
      }
    }
  }

  const signUpHref =
    email.trim() === ""
      ? "/sign-up"
      : `/sign-up?email=${encodeURIComponent(email.trim())}`;

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
          label="Email"
          required
          status={warningFields.email || isCredentialsInvalid ? "error" : "default"}
        >
          <FormControl>
            <Input
              type="email"
              placeholder="nome@esempio.com"
              autoComplete="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                if (isCredentialsInvalid) setIsCredentialsInvalid(false);
                if (warningFields.email) {
                  setWarningFields((current) => ({ ...current, email: false }));
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
              email.trim()
                ? `/forgot-password?email=${encodeURIComponent(email.trim())}`
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
