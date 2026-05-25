"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { signIn } from "next-auth/react";
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
import { completeEmailSignupAction } from "@shared/actions/auth-actions";
import { getSafeRedirectPath } from "@shared/lib/auth-flow";
import {
  buildUsernameSuggestions,
  normalizeUsernameInput,
  validateUsername,
} from "@shared/lib/username";

export function SignUpSetupClient({
  email,
  callbackUrl,
}: {
  email: string;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = React.useState(
    normalizeUsernameInput(email.split("@")[0] ?? ""),
  );
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const safeCallbackUrl = getSafeRedirectPath(callbackUrl);
  const suggestions = React.useMemo(
    () => buildUsernameSuggestions({ email }).slice(0, 3),
    [email],
  );

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
      const result = await completeEmailSignupAction({
        email,
        username: normalizedUsername,
        password,
      });
      if (!result.ok || !result.data) {
        toast({
          variant: "error",
          title: "Account non creato",
          description: result.message,
        });
        return;
      }

      const signInResult = await signIn("credentials", {
        identifier: result.data.email,
        password,
        redirect: false,
        callbackUrl: safeCallbackUrl,
      });

      if (signInResult?.error) {
        toast({
          variant: "success",
          title: "Account creato",
          description: "Accedi con la password appena creata.",
        });
        router.replace("/sign-in");
        return;
      }

      router.replace(safeCallbackUrl);
      router.refresh();
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
        <FormField label="Username" required>
          <FormControl>
            <Input
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={isSubmitting}
              value={username}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setUsername(normalizeUsernameInput(event.target.value))
              }
            />
          </FormControl>
        </FormField>
        {suggestions.length ? (
          <div className="flex flex-wrap gap-(--spacing-2)">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setUsername(suggestion)}
              >
                @{suggestion}
              </Button>
            ))}
          </div>
        ) : null}
        <FormField label="Password" required>
          <FormControl>
            <Input
              type="password"
              autoComplete="new-password"
              showPasswordToggle
              showStrength
              disabled={isSubmitting}
              value={password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(event.target.value)
              }
            />
          </FormControl>
        </FormField>
        <Text size="xs" tone="muted" leading="relaxed">
          Dopo l&apos;accesso ti chiederemo nome e cognome direttamente in dashboard.
        </Text>
        <FormActions align="stretch">
          <Button
            type="submit"
            loading={isSubmitting}
            loadingLabel="Creazione..."
            className="w-full"
          >
            Crea account
          </Button>
        </FormActions>
      </Form>
    </>
  );
}
