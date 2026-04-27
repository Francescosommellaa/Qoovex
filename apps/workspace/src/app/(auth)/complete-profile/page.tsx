"use client";

import { useSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Button, Form, FormActions, FormControl, FormField, Input, useToast } from "@qoovex/ui";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { AuthShell } from "../ui";

export default function CompleteProfilePage() {
  const { user, isLoaded } = useUser();
  const { signUp } = useSignUp();
  const { toast } = useToast();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsernameWarning, setIsUsernameWarning] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      if (signUp.status === "missing_requirements") return;
      router.replace("/sign-in");
      return;
    }

    if (user.username && signUp.status !== "missing_requirements") {
      void bootstrapUser().then(() => {
        router.replace("/");
      });
      return;
    }

    const fallbackSource = user?.emailAddresses[0]?.emailAddress ?? signUp.emailAddress ?? "";
    const fallback =
      fallbackSource
        ?.split("@")[0]
        ?.replace(/[^a-zA-Z0-9._-]/g, "")
        ?.slice(0, 24) ?? "";
    setUsername(fallback.toLowerCase());
  }, [isLoaded, router, signUp.emailAddress, signUp.status, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user && signUp.status !== "missing_requirements") return;

    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername.length < 3) {
      setIsUsernameWarning(true);
      toast({
        variant: "warning",
        title: "Controlla i campi evidenziati",
        description: "Lo username deve avere almeno 3 caratteri.",
      });
      setError("Username troppo corto. Minimo 3 caratteri.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (signUp.status === "missing_requirements") {
        const { error: updateError } = await signUp.create({
          username: normalizedUsername,
        });
        if (updateError) {
          setError(updateError.message ?? "Impossibile salvare lo username.");
          return;
        }

        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) {
          setError(
            finalizeError.message ??
              "Impossibile completare la registrazione OAuth.",
          );
          return;
        }
      } else {
        if (!user) return;
        await user.update({ username: normalizedUsername });
      }

      await bootstrapUser();
      router.replace("/");
    } catch (unknownError: unknown) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Impossibile salvare lo username. Riprova.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isLoaded) return null;

  return (
    <AuthShell
      title="Completa il profilo"
      subtitle="Scegli il tuo username per terminare l'accesso"
      steps={{ current: 2, total: 2 }}
    >
      {error && (
        <div className="auth-error-banner" role="alert">
          <WarningCircle size={16} weight="bold" aria-hidden="true" />
          {error}
        </div>
      )}

      <Form
        variant="plain"
        layout="stack"
        density="comfortable"
        labelStyle="soft"
        noValidate
        onSubmit={handleSubmit}
      >
        <FormField
          label="Username"
          required
          helperText="Solo lettere, numeri, punti, underscore e trattini."
          className={isUsernameWarning ? "auth-warning-field" : undefined}
        >
          <FormControl>
            <Input
              type="text"
              autoComplete="username"
              placeholder="nomechef"
              value={username}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                {
                  setUsername(event.target.value.replace(/\s+/g, ""));
                  if (isUsernameWarning) setIsUsernameWarning(false);
                }
              }
            />
          </FormControl>
        </FormField>

        <FormActions align="stretch">
          <Button type="submit" variant="primary" size="md" loading={isSaving} className="w-full">
            Continua
          </Button>
        </FormActions>
      </Form>
    </AuthShell>
  );
}
