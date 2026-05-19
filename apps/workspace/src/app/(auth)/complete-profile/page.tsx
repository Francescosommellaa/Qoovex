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
  completeCurrentUserProfile,
} from "@shared/actions/bootstrap-user";
import { getSafeAuthErrorMessage } from "@shared/lib/auth-error";
import { getSafeRedirectPath } from "@shared/lib/auth-flow";
import { AuthShell } from "../ui";

type CompleteProfileResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | "UNAUTHENTICATED"
        | "MISSING_NAME"
        | "CLERK_UPDATE_FAILED"
        | "DATABASE_SYNC_FAILED";
      message: string;
    };

function getCompleteProfileErrorToast(
  result: Exclude<CompleteProfileResult, { ok: true }>,
) {
  if (result.code === "UNAUTHENTICATED") {
    return {
      title: "Sessione scaduta",
      description: result.message,
    };
  }

  if (result.code === "MISSING_NAME") {
    return {
      title: "Nome richiesto",
      description: result.message,
    };
  }

  return {
    title: "Workspace non pronto",
    description:
      "Non siamo riusciti a completare la sincronizzazione. Riprova tra qualche istante.",
  };
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
  const [didCompleteProfileUpgrade, setDidCompleteProfileUpgrade] =
    useState(false);

  const nextPath = getSafeRedirectPath(searchParams.get("next"));
  const hasForcedSyncFailure = searchParams.get("sync") === "failed";
  const hasClerkFirstName = Boolean(user?.firstName?.trim());
  const shouldShowProfileUpgrade = Boolean(
    user &&
      !didCompleteProfileUpgrade &&
      !hasClerkFirstName,
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
          "Impossibile sincronizzare il profilo con il workspace. Riprova tra qualche istante.",
        );
        setSyncError(message);
        toast({
          variant: "error",
          title: "Workspace non pronto",
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

  function handleProfileCompletionResult(result: CompleteProfileResult) {
    if (result.ok) {
      router.replace(nextPath);
      return;
    }

    if (result.code === "UNAUTHENTICATED") {
      toast({
        variant: "error",
        ...getCompleteProfileErrorToast(result),
      });
      router.replace("/sign-in");
      return;
    }

    if (result.code === "MISSING_NAME") {
      setIsFirstNameWarning(true);
      toast({
        variant: "warning",
        ...getCompleteProfileErrorToast(result),
      });
      return;
    }

    if (result.code === "DATABASE_SYNC_FAILED") {
      setDidCompleteProfileUpgrade(true);
      setSyncError(result.message);
    }

    toast({
      variant: "error",
      ...getCompleteProfileErrorToast(result),
    });
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    if (!normalizedFirstName) {
      setIsFirstNameWarning(true);
      toast({
        variant: "warning",
        title: "Nome richiesto",
        description: "Inserisci il nome prima di entrare nel workspace.",
      });
      return;
    }

    setIsSaving(true);
    setSyncError(null);

    try {
      const result = await completeCurrentUserProfile({
        firstName: normalizedFirstName,
        lastName: normalizedLastName || undefined,
      });

      handleProfileCompletionResult(result);
    } catch (unknownError: unknown) {
      const message = getSafeAuthErrorMessage(
        unknownError,
        "Non siamo riusciti a completare il profilo. Riprova tra qualche istante.",
      );
      setSyncError(message);
      toast({
        variant: "error",
        title: "Profilo non completato",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRetryBootstrap() {
    const retryFirstName = user?.firstName?.trim() || firstName.trim();
    const retryLastName = user?.lastName?.trim() || lastName.trim();

    if (!retryFirstName) {
      setSyncError(null);
      setIsFirstNameWarning(true);
      toast({
        variant: "warning",
        title: "Nome richiesto",
        description: "Inserisci il nome prima di riprovare la sincronizzazione.",
      });
      return;
    }

    setIsSaving(true);
    setSyncError(null);

    try {
      const result = await completeCurrentUserProfile({
        firstName: retryFirstName,
        lastName: retryLastName || undefined,
      });

      handleProfileCompletionResult(result);
    } catch (unknownError: unknown) {
      const message = getSafeAuthErrorMessage(
        unknownError,
        "Impossibile riprovare la sincronizzazione del profilo. Riprova tra qualche istante.",
      );
      setSyncError(message);
      toast({
        variant: "error",
        title: "Sincronizzazione non riuscita",
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

  if ((syncError || hasForcedSyncFailure) && !shouldShowProfileUpgrade) {
    return (
      <AuthShell
        title="Workspace non pronto"
        subtitle="Il profilo e pronto, ma la sincronizzazione non e stata completata"
        steps={{ current: 3, total: 3 }}
      >
        <Stack gap="5">
          <Text tone="muted" size="sm">
            {syncError ??
              "Impossibile sincronizzare il profilo con il workspace. Riprova tra qualche istante."}
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
      title="Completa il profilo"
      subtitle="Serve solo se il tuo account non ha ancora un nome salvato"
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

        <FormField label="Cognome">
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
