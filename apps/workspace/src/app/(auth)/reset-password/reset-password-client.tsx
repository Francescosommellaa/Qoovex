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
  Input,
  OtpInput,
  Text,
  useToast,
} from "@qoovex/ui";
import { resetPasswordWithCodeAction } from "@shared/actions/auth-actions";

export function ResetPasswordClient({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState(initialEmail);
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const submitReset = React.useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await resetPasswordWithCodeAction({
        email: email.trim().toLowerCase(),
        code,
        password,
      });
      if (!result.ok) {
        setCode("");
        toast({
          variant: "error",
          title: "Password non aggiornata",
          description: result.message,
        });
        return;
      }

      toast({
        variant: "success",
        title: "Password aggiornata",
        description: "Accedi con la nuova password.",
      });
      router.replace("/sign-in");
    } finally {
      setIsSubmitting(false);
    }
  }, [code, email, isSubmitting, password, router, toast]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitReset();
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
        <FormField label="Email account" required>
          <FormControl>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(event.target.value)
              }
            />
          </FormControl>
        </FormField>
        <FormField label="Codice email" required>
          <FormControl>
            <OtpInput
              value={code}
              onChange={setCode}
              onComplete={() => {
                if (email.trim() && password.trim()) void submitReset();
              }}
              length={6}
              requestInitialFocusOnDesktop
              disabled={isSubmitting}
              aria-label="Codice reset password"
            />
          </FormControl>
        </FormField>
        <FormField label="Nuova password" required>
          <FormControl>
            <Input
              type="password"
              autoComplete="new-password"
              showPasswordToggle
              showStrength
              value={password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(event.target.value)
              }
            />
          </FormControl>
        </FormField>
        <FormActions align="stretch">
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            loadingLabel="Aggiornamento..."
          >
            Aggiorna password
          </Button>
        </FormActions>
      </Form>
      <Text className="auth-footer-text">
        <Link href="/forgot-password">Richiedi un nuovo codice</Link>
      </Text>
    </>
  );
}
