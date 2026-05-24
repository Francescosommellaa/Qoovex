"use client";

import * as React from "react";
import {
  EnvelopeSimple,
  Key,
  LockKey,
  QrCode,
  ShieldCheck,
  UploadSimple,
  UserCircle,
} from "@phosphor-icons/react";
import { QRCodeSVG } from "qrcode.react";
import { signOut } from "next-auth/react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  Form,
  FormActions,
  FormControl,
  FormField,
  Icon,
  Input,
  OtpInput,
  Stack,
  Text,
  useToast,
} from "@qoovex/ui";
import {
  confirmTotpSetupAction,
  disableMfaAction,
  getCurrentMfaStatusAction,
  regenerateBackupCodesAction,
  startTotpSetupAction,
} from "@shared/actions/mfa-actions";
import {
  changePasswordAction,
  confirmEmailChangeAction,
  requestEmailChangeAction,
} from "@shared/actions/account-security-actions";
import { changeUsernameAction } from "@shared/actions/username-actions";
import { updateCurrentUserProfile } from "@shared/actions/bootstrap-user";
import { getSafeAuthErrorMessage } from "@shared/lib/auth-error";
import {
  buildUsernameSuggestions,
  normalizeUsernameInput,
  validateUsername,
} from "@shared/lib/username";

interface AccountSettingsClientProps {
  user: {
    id: string;
    firstName: string;
    lastName?: string | null;
    username: string;
    email: string;
    imageUrl?: string | null;
    mfaEnabled?: boolean;
    usernameChangedAt?: Date | string | null;
  };
  usage: {
    recipes: string;
    menus: string;
    workPlans: string;
    recipesReached: boolean;
    menusReached: boolean;
    workPlansReached: boolean;
  };
  planLabel: string;
}

type EmailStep = "idle" | "verify";
type TotpStep = "idle" | "setup" | "backup";

type UsernameAvailability = {
  username: string;
  valid: boolean;
  available: boolean;
  message: string;
  suggestions: string[];
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function getFriendlyError(error: unknown) {
  return getSafeAuthErrorMessage(
    error,
    "Operazione non completata. Controlla i dati e riprova tra qualche istante.",
  );
}

function parseDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getNextUsernameChangeDate(value: Date | string | null | undefined) {
  const changedAt = parseDate(value);
  return changedAt
    ? new Date(changedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    : null;
}

function formatDate(value: Date | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

async function readApiError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    message?: unknown;
    url?: unknown;
  } | null;

  if (!response.ok) {
    throw new Error(typeof payload?.message === "string" ? payload.message : fallback);
  }

  return payload;
}

export function AccountSettingsClient({
  user: initialUser,
  usage,
  planLabel,
}: AccountSettingsClientProps) {
  const { toast } = useToast();
  const displayName =
    [initialUser.firstName, initialUser.lastName].filter(Boolean).join(" ") ||
    initialUser.username;

  const [currentEmail, setCurrentEmail] = React.useState(initialUser.email);
  const [firstName, setFirstName] = React.useState(initialUser.firstName);
  const [lastName, setLastName] = React.useState(
    initialUser.lastName ?? "",
  );
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(
    initialUser.imageUrl ?? undefined,
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const [currentUsername, setCurrentUsername] = React.useState(initialUser.username);
  const [username, setUsername] = React.useState(initialUser.username);
  const [usernameChangedAt, setUsernameChangedAt] = React.useState<
    Date | string | null | undefined
  >(initialUser.usernameChangedAt);
  const [usernameAvailability, setUsernameAvailability] =
    React.useState<UsernameAvailability | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = React.useState(false);
  const [isSavingUsername, setIsSavingUsername] = React.useState(false);

  const [mfaEnabled, setMfaEnabled] = React.useState(Boolean(initialUser.mfaEnabled));
  const [backupCodesRemaining, setBackupCodesRemaining] = React.useState(0);
  const [totpStep, setTotpStep] = React.useState<TotpStep>("idle");
  const [totpUrl, setTotpUrl] = React.useState("");
  const [totpSecret, setTotpSecret] = React.useState("");
  const [totpCode, setTotpCode] = React.useState("");
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [isSecurityBusy, setIsSecurityBusy] = React.useState(false);

  const [newEmail, setNewEmail] = React.useState("");
  const [emailCode, setEmailCode] = React.useState("");
  const [emailStep, setEmailStep] = React.useState<EmailStep>("idle");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [isCredentialsBusy, setIsCredentialsBusy] = React.useState(false);

  const imageUrl = avatarUrl;
  const nextUsernameChangeAt = getNextUsernameChangeDate(usernameChangedAt);
  const isUsernameCooldownActive =
    Boolean(nextUsernameChangeAt && nextUsernameChangeAt.getTime() > Date.now()) &&
    normalizeUsernameInput(username) !== currentUsername;
  const normalizedUsername = normalizeUsernameInput(username);
  const usernameSuggestions =
    usernameAvailability?.suggestions.length
      ? usernameAvailability.suggestions
      : buildUsernameSuggestions({
          firstName,
          lastName,
          email: currentEmail,
        });

  React.useEffect(() => {
    const normalized = normalizeUsernameInput(username);
    const localError = validateUsername(normalized);

    if (!normalized) {
      setUsernameAvailability(null);
      setIsCheckingUsername(false);
      return;
    }

    if (normalized === currentUsername) {
      setUsernameAvailability({
        username: normalized,
        valid: true,
        available: true,
        message: "Username attuale.",
        suggestions: [],
      });
      setIsCheckingUsername(false);
      return;
    }

    if (localError) {
      setUsernameAvailability({
        username: normalized,
        valid: false,
        available: false,
        message: localError,
        suggestions: buildUsernameSuggestions({
          firstName,
          lastName,
          email: currentEmail,
        }),
      });
      setIsCheckingUsername(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const params = new URLSearchParams({
          username: normalized,
          firstName,
          lastName,
          email: currentEmail,
        });
        const response = await fetch(`/api/auth/username?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = (await response.json()) as UsernameAvailability;
        setUsernameAvailability(payload);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [
    currentUsername,
    currentEmail,
    firstName,
    lastName,
    username,
  ]);

  React.useEffect(() => {
    let mounted = true;

    void getCurrentMfaStatusAction().then((result) => {
      if (!mounted || !result.ok || !result.status) return;
      setMfaEnabled(result.status.enabled);
      setBackupCodesRemaining(result.status.backupCodesRemaining);
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function reloadAndSync() {
    return;
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    if (!normalizedFirstName) {
      toast({
        variant: "warning",
        title: "Nome richiesto",
        description: "Inserisci il nome prima di salvare il profilo.",
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const result = await updateCurrentUserProfile({
        firstName: normalizedFirstName,
        lastName: normalizedLastName || undefined,
      });

      if (!result?.ok) {
        toast({
          variant: "error",
          title: "Profilo non aggiornato",
          description: "Non siamo riusciti a salvare il profilo. Riprova.",
        });
        return;
      }

      await reloadAndSync();
      toast({
        variant: "success",
        title: "Profilo aggiornato",
        description: "Nome e cognome sono sincronizzati con il workspace.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Profilo non aggiornato",
        description: getFriendlyError(error),
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "warning",
        title: "Formato immagine",
        description: "Carica un file immagine valido.",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });
      const payload = await readApiError(response, "Upload immagine non riuscito.");
      const nextAvatarUrl =
        typeof payload?.url === "string" ? payload.url : undefined;

      if (nextAvatarUrl) setAvatarUrl(nextAvatarUrl);
      await reloadAndSync();
      toast({
        variant: "success",
        title: "Immagine aggiornata",
        description: "La foto profilo e salvata e sincronizzata.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Upload non riuscito",
        description: getFriendlyError(error),
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    setIsUploadingAvatar(true);
    try {
      const response = await fetch("/api/account/avatar", { method: "DELETE" });
      await readApiError(response, "Immagine non rimossa.");
      setAvatarUrl(undefined);
      await reloadAndSync();
      toast({
        variant: "success",
        title: "Immagine rimossa",
        description: "Useremo le iniziali come immagine profilo.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Immagine non rimossa",
        description: getFriendlyError(error),
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleUsernameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const usernameError = validateUsername(normalizedUsername);

    if (
      usernameError ||
      !usernameAvailability?.available ||
      usernameAvailability.username !== normalizedUsername
    ) {
      toast({
        variant: "warning",
        title: "Username da correggere",
        description:
          usernameError ??
          "Scegli uno username disponibile tra quelli suggeriti o modificane uno valido.",
      });
      return;
    }

    if (isUsernameCooldownActive) {
      toast({
        variant: "warning",
        title: "Cambio non ancora disponibile",
        description: `Potrai cambiare username dal ${formatDate(nextUsernameChangeAt)}.`,
      });
      return;
    }

    setIsSavingUsername(true);
    try {
      const result = await changeUsernameAction(normalizedUsername);
      if (!result.ok || !result.data) {
        toast({
          variant: "error",
          title: "Username non aggiornato",
          description: result.message,
        });
        return;
      }

      setCurrentUsername(result.data.username);
      setUsername(result.data.username);
      setUsernameChangedAt(result.data.usernameChangedAt);
      toast({
        variant: "success",
        title: "Username aggiornato",
        description: "Il prossimo cambio sara disponibile tra 7 giorni.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Username non aggiornato",
        description: getFriendlyError(error),
      });
    } finally {
      setIsSavingUsername(false);
    }
  }

  async function startTotpSetup() {
    setIsSecurityBusy(true);
    setBackupCodes([]);
    setTotpCode("");
    try {
      const result = await startTotpSetupAction();
      if (!result.ok || !result.data) {
        toast({
          variant: "error",
          title: "A2F non avviata",
          description: result.message,
        });
        return;
      }

      setTotpUrl(result.data.otpauthUrl);
      setTotpSecret(result.data.secret);
      setTotpStep("setup");
    } finally {
      setIsSecurityBusy(false);
    }
  }

  async function confirmTotpSetup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = totpCode.trim();
    if (!code) {
      toast({
        variant: "warning",
        title: "Codice richiesto",
        description: "Inserisci il codice generato dall'app authenticator.",
      });
      return;
    }

    setIsSecurityBusy(true);
    try {
      const result = await confirmTotpSetupAction(code);
      if (!result.ok || !result.data) {
        setTotpCode("");
        toast({
          variant: "error",
          title: "Codice non valido",
          description: result.message,
        });
        return;
      }

      setMfaEnabled(true);
      setBackupCodes(result.data.backupCodes);
      setBackupCodesRemaining(result.data.backupCodes.length);
      setTotpCode("");
      setTotpStep("backup");
      toast({
        variant: "success",
        title: "A2F attiva",
        description: "Salva i codici di backup in un posto sicuro.",
      });
    } finally {
      setIsSecurityBusy(false);
    }
  }

  async function disableMfa() {
    if (!window.confirm("Disattivare la A2F per questo account?")) return;

    setIsSecurityBusy(true);
    try {
      const result = await disableMfaAction();
      if (!result.ok) {
        toast({
          variant: "error",
          title: "A2F non aggiornata",
          description: result.message,
        });
        return;
      }

      setMfaEnabled(false);
      setBackupCodes([]);
      setBackupCodesRemaining(0);
      setTotpStep("idle");
      toast({
        variant: "success",
        title: "A2F disattivata",
        description: "Puoi riattivarla quando vuoi dalle impostazioni.",
      });
    } finally {
      setIsSecurityBusy(false);
    }
  }

  async function regenerateBackupCodes() {
    setIsSecurityBusy(true);
    try {
      const result = await regenerateBackupCodesAction();
      if (!result.ok || !result.data) {
        toast({
          variant: "error",
          title: "Codici non generati",
          description: result.message,
        });
        return;
      }

      setBackupCodes(result.data.backupCodes);
      setBackupCodesRemaining(result.data.backupCodes.length);
      setTotpStep("backup");
      toast({
        variant: "success",
        title: "Nuovi codici generati",
        description: "I codici precedenti non sono piu validi.",
      });
    } finally {
      setIsSecurityBusy(false);
    }
  }

  async function handleStartEmailChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      toast({
        variant: "warning",
        title: "Email da controllare",
        description: "Inserisci una nuova email valida.",
      });
      return;
    }

    setIsCredentialsBusy(true);
    try {
      const result = await requestEmailChangeAction({
        newEmail: normalizedEmail,
        currentPassword,
      });
      if (!result.ok) {
        toast({
          variant: "error",
          title: "Email non aggiornata",
          description: result.message,
        });
        return;
      }
      setEmailStep("verify");
      setEmailCode("");
      toast({
        variant: "success",
        title: "Codice inviato",
        description: "Controlla la nuova casella email e inserisci il codice.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Email non aggiornata",
        description: getFriendlyError(error),
      });
    } finally {
      setIsCredentialsBusy(false);
    }
  }

  async function handleVerifyEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newEmail.trim() || !emailCode.trim()) {
      toast({
        variant: "warning",
        title: "Codice richiesto",
        description: "Inserisci il codice ricevuto via email.",
      });
      return;
    }

    setIsCredentialsBusy(true);
    try {
      const result = await confirmEmailChangeAction({
        newEmail: newEmail.trim().toLowerCase(),
        code: emailCode.trim(),
      });
      if (!result.ok || !result.data) {
        setEmailCode("");
        toast({
          variant: "error",
          title: "Email non verificata",
          description: result.message,
        });
        return;
      }
      setCurrentEmail(result.data.email);
      setEmailStep("idle");
      setEmailCode("");
      setNewEmail("");
      setCurrentPassword("");
      toast({
        variant: "success",
        title: "Email aggiornata",
        description: "La nuova email e ora collegata al workspace.",
      });
    } catch (error) {
      setEmailCode("");
      toast({
        variant: "error",
        title: "Email non verificata",
        description: getFriendlyError(error),
      });
    } finally {
      setIsCredentialsBusy(false);
    }
  }

  async function handlePasswordChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentPassword || !newPassword) {
      toast({
        variant: "warning",
        title: "Password da completare",
        description: "Inserisci password attuale e nuova password.",
      });
      return;
    }

    setIsCredentialsBusy(true);
    try {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
      });
      if (!result.ok) {
        toast({
          variant: "error",
          title: "Password non aggiornata",
          description: result.message,
        });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      toast({
        variant: "success",
        title: "Password aggiornata",
        description: "Accedi di nuovo con la nuova password.",
      });
      await signOut({ callbackUrl: "/sign-in" });
    } catch (error) {
      toast({
        variant: "error",
        title: "Password non aggiornata",
        description: getFriendlyError(error),
      });
    } finally {
      setIsCredentialsBusy(false);
    }
  }

  const usernameStatus =
    usernameAvailability && !usernameAvailability.available
      ? "error"
      : usernameAvailability?.available
        ? "success"
        : "default";

  return (
    <div className="grid gap-(--spacing-4) xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Stack gap="4">
        <Card variant="panel" padding="lg">
          <CardBody>
            <Stack gap="5">
              <div className="flex flex-col gap-(--spacing-4) sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-(--spacing-4)">
                  <Avatar
                    src={imageUrl}
                    name={displayName}
                    initials={getInitials(displayName)}
                    size="xl"
                    tone="primary"
                  />
                  <div>
                    <Text as="h2" size="lg" weight="semibold">
                      Profilo
                    </Text>
                    <Text size="sm" tone="muted">
                      Nome, cognome e immagine visibili nel workspace.
                    </Text>
                  </div>
                </div>
                <div className="flex flex-wrap gap-(--spacing-2)">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    iconLeft={<Icon icon={UploadSimple} size="sm" />}
                    loading={isUploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    Carica
                  </Button>
                  {imageUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isUploadingAvatar}
                      onClick={handleRemoveAvatar}
                    >
                      Rimuovi
                    </Button>
                  ) : null}
                </div>
              </div>

              <Form
                variant="plain"
                layout="stack"
                density="comfortable"
                labelStyle="soft"
                noValidate
                onSubmit={handleProfileSubmit}
              >
                <div className="grid gap-(--spacing-3) md:grid-cols-2">
                  <FormField label="Nome" required>
                    <FormControl>
                      <Input
                        value={firstName}
                        autoComplete="given-name"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setFirstName(event.target.value)
                        }
                      />
                    </FormControl>
                  </FormField>
                  <FormField label="Cognome">
                    <FormControl>
                      <Input
                        value={lastName}
                        autoComplete="family-name"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setLastName(event.target.value)
                        }
                      />
                    </FormControl>
                  </FormField>
                </div>
                <FormActions align="end">
                  <Button
                    type="submit"
                    size="sm"
                    loading={isSavingProfile}
                    loadingLabel="Salvataggio..."
                  >
                    Salva profilo
                  </Button>
                </FormActions>
              </Form>
            </Stack>
          </CardBody>
        </Card>

        <Card variant="panel" padding="lg">
          <CardBody>
            <Stack gap="5">
              <div className="flex flex-col gap-(--spacing-3) sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Text as="h2" size="lg" weight="semibold">
                    Username
                  </Text>
                  <Text size="sm" tone="muted">
                    Puoi cambiarlo una volta ogni 7 giorni.
                  </Text>
                </div>
                <Badge tone={isUsernameCooldownActive ? "warning" : "neutral"}>
                  {nextUsernameChangeAt
                    ? `prossimo cambio ${formatDate(nextUsernameChangeAt)}`
                    : "mai cambiato"}
                </Badge>
              </div>

              <Form
                variant="plain"
                layout="stack"
                density="comfortable"
                labelStyle="soft"
                noValidate
                onSubmit={handleUsernameSubmit}
              >
                <FormField label="Username" required status={usernameStatus}>
                  <FormControl>
                    <Input
                      value={username}
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setUsername(normalizeUsernameInput(event.target.value))
                      }
                    />
                  </FormControl>
                </FormField>
                <Stack gap="2">
                  <Text
                    size="xs"
                    tone={usernameAvailability?.available ? "success" : "muted"}
                    aria-live="polite"
                  >
                    {isCheckingUsername
                      ? "Verifica disponibilita..."
                      : usernameAvailability?.message ??
                        "Usa 3-32 caratteri: lettere, numeri, punto, trattino o underscore."}
                  </Text>
                  {usernameSuggestions.length ? (
                    <div className="flex flex-wrap gap-(--spacing-2)">
                      {usernameSuggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setUsername(suggestion)}
                        >
                          @{suggestion}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </Stack>
                <FormActions align="end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      isUsernameCooldownActive ||
                      normalizedUsername === currentUsername ||
                      !usernameAvailability?.available
                    }
                    loading={isSavingUsername}
                    loadingLabel="Salvataggio..."
                  >
                    Cambia username
                  </Button>
                </FormActions>
              </Form>
            </Stack>
          </CardBody>
        </Card>

        <Card variant="panel" padding="lg">
          <CardBody>
            <Stack gap="5">
              <div className="flex flex-col gap-(--spacing-3) sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Text as="h2" size="lg" weight="semibold">
                    Sicurezza
                  </Text>
                  <Text size="sm" tone="muted">
                    A2F interna con app authenticator e codici di backup.
                  </Text>
                </div>
                <Badge tone={mfaEnabled ? "success" : "neutral"}>
                  {mfaEnabled ? "A2F attiva" : "A2F non attiva"}
                </Badge>
              </div>

              <div className="grid gap-(--spacing-3) md:grid-cols-2">
                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-4)">
                  <Stack gap="3">
                    <Icon icon={ShieldCheck} size="lg" />
                    <Text weight="semibold">App authenticator</Text>
                    <Text size="sm" tone="muted">
                      Genera codici temporanei TOTP con MFA interna Qoovex.
                    </Text>
                    {mfaEnabled ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={disableMfa}
                        loading={isSecurityBusy}
                      >
                        Disattiva A2F
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={startTotpSetup}
                        loading={isSecurityBusy}
                      >
                        Attiva A2F
                      </Button>
                    )}
                  </Stack>
                </div>

                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-4)">
                  <Stack gap="3">
                    <Icon icon={QrCode} size="lg" />
                    <Text weight="semibold">Codici di backup</Text>
                    <Text size="sm" tone="muted">
                      Ogni codice puo essere usato una sola volta nel login A2F.
                    </Text>
                    <Badge tone="neutral">{backupCodesRemaining} disponibili</Badge>
                  </Stack>
                </div>
              </div>

              {totpStep === "setup" && totpUrl ? (
                <div className="grid gap-(--spacing-4) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-4) md:grid-cols-[auto,minmax(0,1fr)]">
                  <div className="w-fit rounded-(--radius-lg) bg-white p-(--spacing-3)">
                    <QRCodeSVG value={totpUrl} size={176} />
                  </div>
                  <Stack gap="3">
                    <Text weight="semibold">Scansiona il QR</Text>
                    <Text size="sm" tone="muted" className="break-all">
                      Chiave manuale: {totpSecret}
                    </Text>
                    <Form
                      variant="plain"
                      layout="stack"
                      density="comfortable"
                      labelStyle="soft"
                      noValidate
                      onSubmit={confirmTotpSetup}
                    >
                      <FormField label="Codice app authenticator" required>
                        <FormControl>
                          <OtpInput
                            value={totpCode}
                            onChange={setTotpCode}
                            length={6}
                            requestInitialFocusOnDesktop
                            aria-label="Codice TOTP"
                          />
                        </FormControl>
                      </FormField>
                      <FormActions align="stretch">
                        <Button
                          type="submit"
                          loading={isSecurityBusy}
                          loadingLabel="Verifica..."
                          className="w-full"
                        >
                          Verifica e attiva
                        </Button>
                      </FormActions>
                    </Form>
                  </Stack>
                </div>
              ) : null}

              {mfaEnabled ? (
                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-4)">
                  <Stack gap="3">
                    <div className="flex flex-col gap-(--spacing-3) sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Text weight="semibold">Backup code</Text>
                        <Text size="sm" tone="muted">
                          Generarli sostituisce quelli precedenti.
                        </Text>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={regenerateBackupCodes}
                        loading={isSecurityBusy}
                      >
                        Genera codici
                      </Button>
                    </div>
                    {backupCodes.length ? (
                      <div className="grid gap-(--spacing-2) sm:grid-cols-2">
                        {backupCodes.map((code) => (
                          <code
                            key={code}
                            className="rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-2) px-(--spacing-3) py-(--spacing-2) text-(length:--text-sm)"
                          >
                            {code}
                          </code>
                        ))}
                      </div>
                    ) : (
                      <Text size="sm" tone="muted">
                        I codici vengono mostrati solo subito dopo la generazione.
                      </Text>
                    )}
                  </Stack>
                </div>
              ) : null}
            </Stack>
          </CardBody>
        </Card>

        <Card variant="panel" padding="lg">
          <CardBody>
            <Stack gap="5">
              <div className="flex items-start justify-between gap-(--spacing-3)">
                <div>
                  <Text as="h2" size="lg" weight="semibold">
                    Email e password
                  </Text>
                  <Text size="sm" tone="muted">
                    La sessione primaria e gestita da NextAuth.
                  </Text>
                </div>
                <Icon icon={LockKey} size="lg" />
              </div>

              <div className="grid gap-(--spacing-4) lg:grid-cols-2">
                <Form
                  variant="plain"
                  layout="stack"
                  density="comfortable"
                  labelStyle="soft"
                  noValidate
                  onSubmit={
                    emailStep === "verify"
                      ? handleVerifyEmail
                      : handleStartEmailChange
                  }
                >
                  {emailStep === "verify" ? (
                    <FormField label="Codice nuova email" required>
                      <FormControl>
                        <OtpInput
                          value={emailCode}
                          onChange={setEmailCode}
                          length={6}
                          requestInitialFocusOnDesktop
                          aria-label="Codice nuova email"
                        />
                      </FormControl>
                    </FormField>
                  ) : (
                    <>
                      <FormField label="Nuova email" required>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            value={newEmail}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              setNewEmail(event.target.value)
                            }
                            iconLeading={<Icon icon={EnvelopeSimple} size="sm" />}
                          />
                        </FormControl>
                      </FormField>
                      <FormField label="Password attuale" required>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="current-password"
                            showPasswordToggle
                            value={currentPassword}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              setCurrentPassword(event.target.value)
                            }
                            iconLeading={<Icon icon={Key} size="sm" />}
                          />
                        </FormControl>
                      </FormField>
                    </>
                  )}
                  <FormActions align="stretch">
                    <Button
                      type="submit"
                      variant="secondary"
                      loading={isCredentialsBusy}
                      loadingLabel="Aggiornamento..."
                      className="w-full"
                    >
                      {emailStep === "verify" ? "Verifica email" : "Cambia email"}
                    </Button>
                  </FormActions>
                </Form>

                <Form
                  variant="plain"
                  layout="stack"
                  density="comfortable"
                  labelStyle="soft"
                  noValidate
                  onSubmit={handlePasswordChange}
                >
                  <FormField label="Password attuale" required>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        showPasswordToggle
                        value={currentPassword}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setCurrentPassword(event.target.value)
                        }
                        iconLeading={<Icon icon={Key} size="sm" />}
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
                        value={newPassword}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setNewPassword(event.target.value)
                        }
                        iconLeading={<Icon icon={LockKey} size="sm" />}
                      />
                    </FormControl>
                  </FormField>
                  <FormActions align="stretch">
                    <Button
                      type="submit"
                      variant="secondary"
                      loading={isCredentialsBusy}
                      loadingLabel="Salvataggio..."
                      className="w-full"
                    >
                      Cambia password
                    </Button>
                  </FormActions>
                </Form>
              </div>
            </Stack>
          </CardBody>
        </Card>
      </Stack>

      <Stack gap="4">
        <Card variant="panel" padding="lg">
          <CardBody>
            <Stack gap="4">
              <div>
                <Text as="h2" size="lg" weight="semibold">
                  Piano
                </Text>
                <Badge tone="primary">{planLabel}</Badge>
              </div>
              <div className="grid gap-(--spacing-3)">
                <UsageRow
                  label="Ricette"
                  value={usage.recipes}
                  reached={usage.recipesReached}
                />
                <UsageRow label="Menu" value={usage.menus} reached={usage.menusReached} />
                <UsageRow
                  label="Piani creati"
                  value={usage.workPlans}
                  reached={usage.workPlansReached}
                />
              </div>
            </Stack>
          </CardBody>
        </Card>

        <Card variant="panel" padding="lg">
          <CardBody>
            <Stack gap="3">
              <Icon icon={UserCircle} size="lg" />
              <Text as="h2" size="lg" weight="semibold">
                Account
              </Text>
              <Text size="sm" tone="muted" className="break-all">
                {currentEmail}
              </Text>
              <Badge tone={mfaEnabled ? "success" : "neutral"}>
                {mfaEnabled ? "protetto con A2F" : "A2F non attiva"}
              </Badge>
              <Text size="xs" tone="muted">
                Dati sessione da NextAuth, sicurezza MFA gestita da Qoovex.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </div>
  );
}

function UsageRow({
  label,
  value,
  reached,
}: {
  label: string;
  value: string;
  reached: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-(--spacing-3)">
      <Text size="sm" tone="muted">
        {label}
      </Text>
      <Badge tone={reached ? "warning" : "primary"}>{value}</Badge>
    </div>
  );
}
