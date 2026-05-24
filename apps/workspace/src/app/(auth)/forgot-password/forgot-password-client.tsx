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
  Text,
  useToast,
} from "@qoovex/ui";
import { requestPasswordResetAction } from "@shared/actions/auth-actions";

export function ForgotPasswordClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    setIsSubmitting(true);
    try {
      const result = await requestPasswordResetAction({ email: normalizedEmail });
      toast({
        variant: result.ok ? "success" : "error",
        title: result.ok ? "Controlla la tua email" : "Richiesta non completata",
        description: result.message,
      });
      if (result.ok) {
        router.push(`/reset-password?email=${encodeURIComponent(normalizedEmail)}`);
      }
    } finally {
      setIsSubmitting(false);
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
        <FormActions align="stretch">
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            loadingLabel="Invio codice..."
          >
            Invia codice
          </Button>
        </FormActions>
      </Form>
      <Text className="auth-footer-text">
        <Link href="/sign-in">Torna al login</Link>
      </Text>
    </>
  );
}
