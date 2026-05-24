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
  resendVerificationCodeAction,
  verifyEmailCodeAction,
} from "@shared/actions/auth-actions";

export function VerifyEmailClient({ email }: { email: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await verifyEmailCodeAction({ email, code });
      if (!result.ok) {
        setCode("");
        toast({
          variant: "error",
          title: "Email non verificata",
          description: result.message,
        });
        return;
      }

      toast({
        variant: "success",
        title: "Email verificata",
        description: "Ora puoi accedere con email o username e password.",
      });
      router.replace("/sign-in");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    setIsResending(true);
    try {
      const result = await resendVerificationCodeAction({ email });
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
              length={6}
              requestInitialFocusOnDesktop
              aria-label="Codice verifica email"
            />
          </FormControl>
        </FormField>
        <FormActions align="stretch">
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            loadingLabel="Verifica..."
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
          disabled={isResending}
          onClick={resendCode}
        >
          Reinvia
        </button>
      </Text>
      <Text className="auth-footer-text">
        <Link href="/sign-in">Torna al login</Link>
      </Text>
    </>
  );
}
