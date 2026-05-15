"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Form,
  FormActions,
  FormControl,
  FormField,
  Input,
  LoadingState,
  Stack,
  Text,
  useToast,
} from "@qoovex/ui";
import {
  bootstrapUser,
  updateCurrentUserProfile,
} from "@shared/actions/bootstrap-user";
import { getSafeAuthErrorMessage } from "@shared/lib/auth-error";
import { AuthShell } from "../ui";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export default function CompleteProfilePage() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const didHydrateProfileFields = useRef(false);
  const didAttemptBootstrap = useRef(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFirstNameWarning, setIsFirstNameWarning] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [didCompleteProfileUpgrade, setDidCompleteProfileUpgrade] = useState(false);

  const nextPath = getSafeNextPath(searchParams.get("next"));
  const source = searchParams.get("source");
  const hasForcedSyncFailure = searchParams.get("sync") === "failed";
  const shouldShowProfileUpgrade = Boolean(
    user &&
      !hasForcedSyncFailure &&
      !didCompleteProfileUpgrade &&
      (source === "signup" || !user.firstName?.trim()),
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }

    if (shouldShowProfileUpgrade) {
      if (!didHydrateProfileFields.current) {
        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
        didHydrateProfileFields.current = true;
      }
      return;
    }

    if (syncError || hasForcedSyncFailure || didAttemptBootstrap.current) return;

    didAttemptBootstrap.current = true;
    setIsSaving(true);
    void bootstrapUser()
      .then(() => {
        router.replace(nextPath);
      })
      .catch((unknownError: unknown) => {
        didAttemptBootstrap.current = false;
        const message = getSafeAuthErrorMessage(
          unknownError,
          "Impossibile sincronizzare il profilo con il database. Controlla le credenziali Postgres e riprova.",
        );
        setSyncError(message);
        toast({
          variant: "error",
          title: "Database non raggiungibile",
          description: message,
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [
    hasForcedSyncFailure,
    isLoaded,
    nextPath,
    router,
    shouldShowProfileUpgrade,
    syncError,
    toast,
    user,
  ]);

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    if (!normalizedFirstName) {
      setIsFirstNameWarning(true);
      toast({
        variant: "warning",
        title: "Nome mancante",
        description: "Inserisci il nome prima di entrare nel workspace.",
      });
      return;
    }

    setIsSaving(true);
    setSyncError(null);

    try {
      await updateCurrentUserProfile({
        firstName: normalizedFirstName,
        lastName: normalizedLastName || undefined,
      });
      setDidCompleteProfileUpgrade(true);

      await bootstrapUser({
        firstName: normalizedFirstName,
        lastName: normalizedLastName || undefined,
      });
      router.replace(nextPath);
    } catch (unknownError: unknown) {
      const message = getSafeAuthErrorMessage(
        unknownError,
        "Profilo salvato su Clerk, ma il database non e raggiungibile. Controlla le credenziali Postgres e riprova.",
      );
      setSyncError(message);
      toast({
        variant: "error",
        title: "Profilo non sincronizzato",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRetryBootstrap() {
    setIsSaving(true);
    setSyncError(null);

    try {
      await bootstrapUser();
      router.replace(nextPath);
    } catch (unknownError: unknown) {
      const message = getSafeAuthErrorMessage(
        unknownError,
        "Impossibile sincronizzare il profilo con il database. Controlla le credenziali Postgres e riprova.",
      );
      setSyncError(message);
      toast({
        variant: "error",
        title: "Database non raggiungibile",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (!isLoaded) return null;

  if (isSaving && !shouldShowProfileUpgrade) {
    return (
      <AuthShell
        title="Preparazione workspace"
        subtitle="Stiamo sincronizzando il profilo con il workspace"
        steps={{ current: 3, total: 3 }}
      >
        <LoadingState rows={5} />
      </AuthShell>
    );
  }

  if (syncError || hasForcedSyncFailure) {
    return (
      <AuthShell
        title="Workspace non pronto"
        subtitle="Il profilo Clerk esiste, ma il database non ha completato la sincronizzazione"
        steps={{ current: 3, total: 3 }}
      >
        <Stack gap="5">
          <Text tone="muted" size="sm">
            {syncError ??
              "Impossibile sincronizzare il profilo con il database. Controlla le credenziali Postgres e riprova."}
          </Text>
          <FormActions align="stretch">
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={isSaving}
              onClick={handleRetryBootstrap}
              className="w-full"
            >
              Riprova sincronizzazione
            </Button>
          </FormActions>
        </Stack>
      </AuthShell>
    );
  }

  if (!shouldShowProfileUpgrade) {
    return (
      <AuthShell
        title="Preparazione workspace"
        subtitle="Stiamo completando l'accesso al workspace"
        steps={{ current: 3, total: 3 }}
      >
        <LoadingState rows={5} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Come possiamo chiamarti?"
      subtitle="Aggiungi il tuo nome mentre prepariamo il workspace"
      steps={{ current: 3, total: 3 }}
    >
      <Form
        variant="plain"
        layout="stack"
        density="comfortable"
        labelStyle="soft"
        noValidate
        onSubmit={handleProfileSubmit}
      >
        <FormField
          label="Nome"
          required
          status={isFirstNameWarning ? "error" : "default"}
        >
          <FormControl>
            <Input
              type="text"
              autoComplete="given-name"
              placeholder="Mario"
              value={firstName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setFirstName(event.target.value);
                if (isFirstNameWarning) setIsFirstNameWarning(false);
              }}
            />
          </FormControl>
        </FormField>

        <FormField
          label="Cognome"
          helperText="Puoi completarlo anche piu avanti dal profilo."
        >
          <FormControl>
            <Input
              type="text"
              autoComplete="family-name"
              placeholder="Rossi"
              value={lastName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setLastName(event.target.value);
              }}
            />
          </FormControl>
        </FormField>

        <FormActions align="stretch">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSaving}
            loadingLabel="Preparazione workspace..."
            className="w-full"
          >
            Entra nel workspace
          </Button>
        </FormActions>
      </Form>
    </AuthShell>
  );
}
