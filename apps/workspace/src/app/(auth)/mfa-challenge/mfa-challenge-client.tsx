"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
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
import { verifyMfaChallengeAction } from "@shared/actions/mfa-actions";

export function MfaChallengeClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = React.useState("");
  const [isInvalid, setIsInvalid] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      setIsInvalid(true);
      toast({
        variant: "warning",
        title: "Codice richiesto",
        description: "Inserisci il codice dell'app authenticator o un codice di backup.",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await verifyMfaChallengeAction(normalizedCode);
    setIsSubmitting(false);

    if (!result.ok) {
      setCode("");
      setIsInvalid(true);
      toast({
        variant: "error",
        title: "Verifica non riuscita",
        description: "Il codice non e valido o e gia stato usato.",
      });
      return;
    }

    toast({
      variant: "success",
      title: "Accesso verificato",
      description: "Secondo fattore completato.",
    });
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <Form
      variant="plain"
      layout="stack"
      density="comfortable"
      labelStyle="soft"
      noValidate
      onSubmit={handleSubmit}
    >
      <Stack gap="3">
        <FormField
          label="Codice di sicurezza"
          required
          status={isInvalid ? "error" : "default"}
        >
          <FormControl>
            <Input
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              placeholder="123456 o backup"
              value={code}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setCode(event.target.value);
                if (isInvalid) setIsInvalid(false);
              }}
            />
          </FormControl>
        </FormField>
        <Text size="xs" tone="muted" leading="relaxed">
          Usa il codice a 6 cifre della tua app authenticator. Se hai perso
          l&apos;accesso, usa uno dei codici di backup salvati.
        </Text>
      </Stack>

      <FormActions align="stretch">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          loadingLabel="Verifica..."
          className="w-full"
        >
          Verifica accesso
        </Button>
      </FormActions>
    </Form>
  );
}
