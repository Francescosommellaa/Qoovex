"use client";

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
import { completeUsernameOnboardingAction } from "@shared/actions/username-actions";
import { normalizeUsernameInput, validateUsername } from "@shared/lib/username";

export function CompleteProfileClient({ initialUsername }: { initialUsername: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = React.useState(initialUsername);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUsername = normalizeUsernameInput(username);
    const usernameError = validateUsername(normalizedUsername);

    if (usernameError) {
      toast({
        variant: "warning",
        title: "Username da correggere",
        description: usernameError,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await completeUsernameOnboardingAction(
        normalizedUsername,
      );
      if (!result.ok) {
        toast({
          variant: "error",
          title: "Username non salvato",
          description: result.message,
        });
        return;
      }

      toast({
        variant: "success",
        title: "Profilo completato",
        description: "Il workspace e pronto.",
      });
      router.replace("/dashboard");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
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
      <FormField label="Username" required>
        <FormControl>
          <Input
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="chef_rossi"
            spellCheck={false}
            value={username}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(normalizeUsernameInput(event.target.value))
            }
          />
        </FormControl>
      </FormField>
      <Text size="xs" tone="muted" leading="relaxed">
        Lo username identifica il tuo profilo nelle ricette, menu e piani di lavoro.
      </Text>
      <FormActions align="stretch">
        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          loadingLabel="Salvataggio..."
        >
          Entra nel workspace
        </Button>
      </FormActions>
    </Form>
  );
}
