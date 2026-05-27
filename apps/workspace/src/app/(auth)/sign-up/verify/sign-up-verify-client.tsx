"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  Button,
  Form,
  FormActions,
  FormControl,
  FormField,
  OtpInput,
  Text,
  useToast,
} from "@qoovex/ui";
import {
  requestSignupEmailAction,
  verifySignupEmailAction,
} from "@shared/actions/auth-actions";
import { getSafeRedirectPath } from "@shared/lib/auth-flow";

export function SignUpVerifyClient({
  email,
  callbackUrl,
}: {
  email: string;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const safeCallbackUrl = getSafeRedirectPath(callbackUrl);

  const submitCode = React.useCallback(
    async (nextCode: string) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const result = await verifySignupEmailAction({ email, code: nextCode });
        if (!result.ok || !result.data) {
          setCode("");
          toast({
            variant: "error",
            title: "Email non verificata",
            description: result.message,
          });
          return;
        }

        router.replace(
          `/sign-up/setup?email=${encodeURIComponent(result.data.email)}&callbackUrl=${encodeURIComponent(safeCallbackUrl)}`,
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, router, safeCallbackUrl, toast],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.length !== 6) {
      toast({
        variant: "warning",
        title: "Codice incompleto",
        description: "Inserisci tutte e 6 le cifre del codice.",
      });
      return;
    }

    await submitCode(code);
  }

  async function resendCode() {
    setIsResending(true);
    try {
      const result = await requestSignupEmailAction({ email });
      toast({
        variant: result.ok ? "success" : "error",
        title: result.ok ? "Codice inviato" : "Codice non inviato",
        description: result.message,
      });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <>
      <Form
        variant="plain"
        layout="stack"
        density="comfortable"
        labelStyle="soft"
        noValidate
        onSubmit={handleSubmit}
      >
        <FormField label="Codice email" required>
          <FormControl>
            <OtpInput
              value={code}
              onChange={setCode}
              onComplete={submitCode}
              placeholder="0"
              length={6}
              requestInitialFocusOnDesktop
              disabled={isSubmitting}
              aria-label="Codice verifica registrazione"
            />
          </FormControl>
        </FormField>
        <FormActions align="stretch">
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            loadingLabel="Verifica..."
            disabled={isSubmitting}
          >
            Verifica email
          </Button>
        </FormActions>
      </Form>

      <Text className="auth-footer-text">
        Non hai ricevuto il codice?{" "}
        <button
          type="button"
          className="auth-inline-link-button"
          disabled={isResending || isSubmitting}
          onClick={resendCode}
        >
          Reinvia
        </button>
      </Text>
      <Text className="auth-footer-text">
        <Link href="/sign-up">Cambia email</Link>
      </Text>
    </>
  );
}
