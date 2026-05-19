"use client";

import * as React from "react";
import { useReverification, useUser } from "@clerk/nextjs";
import {
  CheckCircle,
  DeviceMobile,
  EnvelopeSimple,
  Key,
  LockKey,
  ShieldCheck,
  UploadSimple,
  UserCircle,
} from "@phosphor-icons/react";
import { QRCodeSVG } from "qrcode.react";
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
  PhoneNumberField,
  Stack,
  Text,
  Toggle,
  useToast,
} from "@qoovex/ui";
import { updateCurrentUserProfile } from "@shared/actions/bootstrap-user";
import { syncCurrentAccountProfile } from "@shared/actions/sync-account-profile";
import { getSafeAuthErrorMessage } from "@shared/lib/auth-error";

type ClerkPhoneNumber = {
  id: string;
  phoneNumber: string;
  reservedForSecondFactor?: boolean;
  defaultSecondFactor?: boolean;
  verification?: { status?: string };
  prepareVerification?: (params?: Record<string, unknown>) => Promise<unknown>;
  attemptVerification?: (params: { code: string }) => Promise<unknown>;
  setReservedForSecondFactor?: (params: { reserved: boolean }) => Promise<unknown>;
  makeDefaultSecondFactor?: () => Promise<unknown>;
  destroy?: () => Promise<unknown>;
};

type ClerkEmailAddress = {
  id: string;
  emailAddress: string;
  verification?: { status?: string };
  prepareVerification?: (params?: Record<string, unknown>) => Promise<unknown>;
  attemptVerification?: (params: { code: string }) => Promise<unknown>;
};

type ClerkTotp = {
  uri?: string;
};

type ClerkAccountUser = {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
  twoFactorEnabled?: boolean;
  totpEnabled?: boolean;
  backupCodeEnabled?: boolean;
  phoneNumbers?: ClerkPhoneNumber[];
  emailAddresses?: ClerkEmailAddress[];
  primaryEmailAddressId?: string | null;
  primaryEmailAddress?: ClerkEmailAddress | null;
  update?: (params: Record<string, unknown>) => Promise<unknown>;
  reload?: () => Promise<unknown>;
  setProfileImage?: (params: { file: File | Blob | null }) => Promise<unknown>;
  createPhoneNumber?: (params: { phoneNumber: string }) => Promise<ClerkPhoneNumber>;
  createTOTP?: () => Promise<ClerkTotp>;
  verifyTOTP?: (params: { code: string }) => Promise<unknown>;
  disableTOTP?: () => Promise<unknown>;
  createBackupCode?: () => Promise<{ codes?: string[] }>;
  createEmailAddress?: (
    params: Record<string, unknown>,
  ) => Promise<ClerkEmailAddress>;
  updatePassword?: (params: Record<string, unknown>) => Promise<unknown>;
};

interface AccountSettingsClientProps {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    phoneNumber?: string | null;
    imageUrl?: string | null;
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

type PhoneStep = "idle" | "verify";
type TotpStep = "idle" | "setup" | "verify" | "backup";
type EmailStep = "idle" | "verify";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function normalizePhoneNumber(regionCode: string, nationalNumber: string) {
  const digits = nationalNumber.replace(/[^\d]/g, "");
  return digits ? `${regionCode}${digits}` : "";
}

function isVerifiedPhone(phone: ClerkPhoneNumber) {
  return phone.verification?.status === "verified";
}

function getFriendlyError(error: unknown) {
  return getSafeAuthErrorMessage(
    error,
    "Operazione non completata. Controlla i dati e riprova tra qualche istante.",
  );
}

async function preparePhoneVerification(phone: ClerkPhoneNumber) {
  if (!phone.prepareVerification) return;

  try {
    await phone.prepareVerification({ strategy: "phone_code" });
  } catch {
    await phone.prepareVerification();
  }
}

export function AccountSettingsClient({
  user: initialUser,
  usage,
  planLabel,
}: AccountSettingsClientProps) {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const accountUser = user as ClerkAccountUser | null | undefined;
  const displayName =
    [accountUser?.firstName, accountUser?.lastName].filter(Boolean).join(" ") ||
    initialUser.name;
  const imageUrl = accountUser?.imageUrl ?? initialUser.imageUrl ?? undefined;
  const phoneNumbers = accountUser?.phoneNumbers ?? [];
  const verifiedPhones = phoneNumbers.filter(isVerifiedPhone);
  const mfaPhones = verifiedPhones.filter((phone) => phone.reservedForSecondFactor);
  const hasSecondFactor = Boolean(accountUser?.twoFactorEnabled);

  const [firstName, setFirstName] = React.useState(accountUser?.firstName ?? "");
  const [lastName, setLastName] = React.useState(accountUser?.lastName ?? "");
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [phoneRegionCode, setPhoneRegionCode] = React.useState("+39");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [pendingPhone, setPendingPhone] = React.useState<ClerkPhoneNumber | null>(null);
  const [phoneCode, setPhoneCode] = React.useState("");
  const [phoneStep, setPhoneStep] = React.useState<PhoneStep>("idle");
  const [isPhoneBusy, setIsPhoneBusy] = React.useState(false);
  const [totp, setTotp] = React.useState<ClerkTotp | null>(null);
  const [totpCode, setTotpCode] = React.useState("");
  const [totpStep, setTotpStep] = React.useState<TotpStep>("idle");
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [isSecurityBusy, setIsSecurityBusy] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState("");
  const [pendingEmail, setPendingEmail] = React.useState<ClerkEmailAddress | null>(null);
  const [emailCode, setEmailCode] = React.useState("");
  const [emailStep, setEmailStep] = React.useState<EmailStep>("idle");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [isCredentialsBusy, setIsCredentialsBusy] = React.useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const createPhoneNumberWithReverification = useReverification((phone: string) =>
    accountUser?.createPhoneNumber?.({ phoneNumber: phone }),
  );
  const createTotpWithReverification = useReverification(() =>
    accountUser?.createTOTP?.(),
  );
  const disableTotpWithReverification = useReverification(() =>
    accountUser?.disableTOTP?.(),
  );
  const createBackupCodeWithReverification = useReverification(() =>
    accountUser?.createBackupCode?.(),
  );
  const createEmailWithReverification = useReverification((email: string) =>
    accountUser?.createEmailAddress?.({
      email,
      emailAddress: email,
    }),
  );
  const updatePasswordWithReverification = useReverification(
    (currentValue: string, nextValue: string) =>
      accountUser?.updatePassword?.({
        currentPassword: currentValue,
        newPassword: nextValue,
        signOutOfOtherSessions: true,
      }),
  );

  React.useEffect(() => {
    if (!accountUser) return;
    setFirstName(accountUser.firstName ?? "");
    setLastName(accountUser.lastName ?? "");
  }, [accountUser?.firstName, accountUser?.lastName, accountUser]);

  async function reloadAndSync() {
    await accountUser?.reload?.();
    const result = await syncCurrentAccountProfile();
    if (!result.ok) {
      toast({
        variant: "warning",
        title: "Sincronizzazione in sospeso",
        description: "La modifica e salvata su Clerk. Riprova la sincronizzazione tra poco.",
      });
    }
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

      await accountUser?.reload?.();
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
    if (!file || !accountUser?.setProfileImage) return;

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
      await accountUser.setProfileImage({ file });
      await reloadAndSync();
      toast({
        variant: "success",
        title: "Immagine aggiornata",
        description: "La foto profilo e sincronizzata con il workspace.",
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
    if (!accountUser?.setProfileImage) return;

    setIsUploadingAvatar(true);
    try {
      await accountUser.setProfileImage({ file: null });
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

  async function handleAddPhone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedPhone = normalizePhoneNumber(phoneRegionCode, phoneNumber);

    if (!normalizedPhone || normalizedPhone.replace(/[^\d]/g, "").length < 6) {
      toast({
        variant: "warning",
        title: "Numero da completare",
        description: "Inserisci un numero valido prima di inviare il codice.",
      });
      return;
    }

    setIsPhoneBusy(true);
    try {
      const createdPhone = await createPhoneNumberWithReverification(normalizedPhone);

      if (!createdPhone) {
        throw new Error("phone_not_created");
      }

      await preparePhoneVerification(createdPhone);
      setPendingPhone(createdPhone);
      setPhoneStep("verify");
      setPhoneCode("");
      toast({
        variant: "success",
        title: "Codice inviato",
        description: "Controlla gli SMS e inserisci il codice ricevuto.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Telefono non aggiunto",
        description: getFriendlyError(error),
      });
    } finally {
      setIsPhoneBusy(false);
    }
  }

  async function handleVerifyPhone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingPhone || !phoneCode.trim()) {
      toast({
        variant: "warning",
        title: "Codice richiesto",
        description: "Inserisci il codice SMS per verificare il numero.",
      });
      return;
    }

    setIsPhoneBusy(true);
    try {
      await pendingPhone.attemptVerification?.({ code: phoneCode.trim() });
      await pendingPhone.setReservedForSecondFactor?.({ reserved: true });
      await pendingPhone.makeDefaultSecondFactor?.();
      await reloadAndSync();
      setPhoneStep("idle");
      setPendingPhone(null);
      setPhoneCode("");
      setPhoneNumber("");
      toast({
        variant: "success",
        title: "Telefono verificato",
        description: "Il numero e pronto per la sicurezza dell'account.",
      });
    } catch (error) {
      setPhoneCode("");
      toast({
        variant: "error",
        title: "Verifica non riuscita",
        description: getFriendlyError(error),
      });
    } finally {
      setIsPhoneBusy(false);
    }
  }

  async function togglePhoneSecondFactor(phone: ClerkPhoneNumber, reserved: boolean) {
    setIsPhoneBusy(true);
    try {
      await phone.setReservedForSecondFactor?.({ reserved });
      if (reserved) await phone.makeDefaultSecondFactor?.();
      await reloadAndSync();
      toast({
        variant: "success",
        title: reserved ? "SMS 2FA attivo" : "SMS 2FA disattivato",
        description: "Le impostazioni di sicurezza sono aggiornate.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Sicurezza non aggiornata",
        description: getFriendlyError(error),
      });
    } finally {
      setIsPhoneBusy(false);
    }
  }

  async function startTotpSetup() {
    setIsSecurityBusy(true);
    setBackupCodes([]);
    try {
      const createdTotp = await createTotpWithReverification();
      if (!createdTotp?.uri) throw new Error("totp_not_created");
      setTotp(createdTotp);
      setTotpStep("setup");
    } catch (error) {
      toast({
        variant: "error",
        title: "2FA non avviata",
        description: getFriendlyError(error),
      });
    } finally {
      setIsSecurityBusy(false);
    }
  }

  async function verifyTotp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!totpCode.trim()) {
      toast({
        variant: "warning",
        title: "Codice richiesto",
        description: "Inserisci il codice generato dall'app authenticator.",
      });
      return;
    }

    setIsSecurityBusy(true);
    try {
      await accountUser?.verifyTOTP?.({ code: totpCode.trim() });
      const backup = await accountUser?.createBackupCode?.();
      await accountUser?.reload?.();
      setBackupCodes(backup?.codes ?? []);
      setTotpStep("backup");
      setTotpCode("");
      toast({
        variant: "success",
        title: "2FA attiva",
        description: "Salva i codici di backup in un posto sicuro.",
      });
    } catch (error) {
      setTotpCode("");
      toast({
        variant: "error",
        title: "Codice non valido",
        description: getFriendlyError(error),
      });
    } finally {
      setIsSecurityBusy(false);
    }
  }

  async function disableTotp() {
    setIsSecurityBusy(true);
    try {
      await disableTotpWithReverification();
      await accountUser?.reload?.();
      setTotpStep("idle");
      toast({
        variant: "success",
        title: "2FA app disattivata",
        description: "Puoi riattivarla quando vuoi dalle impostazioni.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "2FA non aggiornata",
        description: getFriendlyError(error),
      });
    } finally {
      setIsSecurityBusy(false);
    }
  }

  async function generateBackupCodes() {
    setIsSecurityBusy(true);
    try {
      const backup = await createBackupCodeWithReverification();
      setBackupCodes(backup?.codes ?? []);
      setTotpStep("backup");
    } catch (error) {
      toast({
        variant: "error",
        title: "Codici non generati",
        description: getFriendlyError(error),
      });
    } finally {
      setIsSecurityBusy(false);
    }
  }

  async function handleStartEmailChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!hasSecondFactor) return;

    setIsCredentialsBusy(true);
    try {
      const createdEmail = await createEmailWithReverification(normalizedEmail);
      if (!createdEmail) throw new Error("email_not_created");
      await createdEmail.prepareVerification?.({ strategy: "email_code" });
      setPendingEmail(createdEmail);
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
    if (!pendingEmail || !emailCode.trim()) return;

    setIsCredentialsBusy(true);
    try {
      await pendingEmail.attemptVerification?.({ code: emailCode.trim() });
      await accountUser?.update?.({ primaryEmailAddressId: pendingEmail.id });
      await reloadAndSync();
      setPendingEmail(null);
      setEmailStep("idle");
      setEmailCode("");
      setNewEmail("");
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
    if (!hasSecondFactor) return;

    setIsCredentialsBusy(true);
    try {
      await updatePasswordWithReverification(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      toast({
        variant: "success",
        title: "Password aggiornata",
        description: "Le altre sessioni sono state chiuse per sicurezza.",
      });
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

  if (!isLoaded) {
    return (
      <Card variant="panel" padding="lg">
        <CardBody>
          <Text tone="muted">Caricamento impostazioni account...</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid gap-(--spacing-4) xl:grid-cols-[minmax(0,1fr)_24rem]">
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
                      @{accountUser?.username ?? initialUser.username}
                    </Text>
                  </div>
                </div>
                <div className="flex flex-wrap gap-(--spacing-2)">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    iconLeft={<Icon icon={UploadSimple} size="sm" />}
                    loading={isUploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    Cambia foto
                  </Button>
                  {imageUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                    >
                      Rimuovi
                    </Button>
                  ) : null}
                  <input
                    ref={avatarInputRef}
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
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
              <div className="flex items-start justify-between gap-(--spacing-3)">
                <div>
                  <Text as="h2" size="lg" weight="semibold">
                    Telefono
                  </Text>
                  <Text size="sm" tone="muted">
                    Numero verificato per recupero e secondo fattore SMS.
                  </Text>
                </div>
                <Badge tone={verifiedPhones.length ? "success" : "warning"}>
                  {verifiedPhones.length ? "verificato" : "da verificare"}
                </Badge>
              </div>

              {verifiedPhones.length ? (
                <Stack gap="2">
                  {verifiedPhones.map((phone) => (
                    <div
                      key={phone.id}
                      className="flex flex-col gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3) sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-(--spacing-3)">
                        <Icon icon={DeviceMobile} size="md" />
                        <div>
                          <Text size="sm" weight="medium">
                            {phone.phoneNumber}
                          </Text>
                          <Text size="xs" tone="muted">
                            {phone.reservedForSecondFactor
                              ? "Usato per 2FA"
                              : "Verificato"}
                          </Text>
                        </div>
                      </div>
                      <Toggle
                        checked={Boolean(phone.reservedForSecondFactor)}
                        onCheckedChange={(checked) =>
                          void togglePhoneSecondFactor(phone, checked)
                        }
                        disabled={isPhoneBusy}
                        aria-label="Usa questo telefono per 2FA"
                      />
                    </div>
                  ))}
                </Stack>
              ) : null}

              {phoneStep === "verify" ? (
                <Form
                  variant="plain"
                  layout="stack"
                  density="comfortable"
                  labelStyle="soft"
                  noValidate
                  onSubmit={handleVerifyPhone}
                >
                  <FormField label="Codice SMS" required>
                    <FormControl>
                      <OtpInput
                        value={phoneCode}
                        onChange={setPhoneCode}
                        length={6}
                        requestInitialFocusOnDesktop
                        aria-label="Codice verifica telefono"
                      />
                    </FormControl>
                  </FormField>
                  <FormActions align="stretch">
                    <Button
                      type="submit"
                      loading={isPhoneBusy}
                      loadingLabel="Verifica..."
                      className="w-full"
                    >
                      Verifica telefono
                    </Button>
                  </FormActions>
                </Form>
              ) : (
                <Form
                  variant="plain"
                  layout="stack"
                  density="comfortable"
                  labelStyle="soft"
                  noValidate
                  onSubmit={handleAddPhone}
                >
                  <PhoneNumberField
                    label="Aggiungi o aggiorna numero"
                    regionCode={phoneRegionCode}
                    onRegionCodeChange={setPhoneRegionCode}
                    nationalNumber={phoneNumber}
                    onNationalNumberChange={setPhoneNumber}
                  />
                  <FormActions align="stretch">
                    <Button
                      type="submit"
                      variant="secondary"
                      loading={isPhoneBusy}
                      loadingLabel="Invio codice..."
                      className="w-full"
                    >
                      Invia codice SMS
                    </Button>
                  </FormActions>
                </Form>
              )}
            </Stack>
          </CardBody>
        </Card>

        <Card variant="panel" padding="lg">
          <CardBody>
            <Stack gap="5">
              <div className="flex items-start justify-between gap-(--spacing-3)">
                <div>
                  <Text as="h2" size="lg" weight="semibold">
                    Sicurezza
                  </Text>
                  <Text size="sm" tone="muted">
                    Secondo fattore e codici di backup.
                  </Text>
                </div>
                <Badge tone={hasSecondFactor ? "success" : "warning"}>
                  {hasSecondFactor ? "2FA attiva" : "2FA consigliata"}
                </Badge>
              </div>

              <div className="grid gap-(--spacing-3) md:grid-cols-2">
                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-4)">
                  <Stack gap="3">
                    <Icon icon={ShieldCheck} size="lg" />
                    <Text weight="semibold">App authenticator</Text>
                    <Text size="sm" tone="muted">
                      {accountUser?.totpEnabled
                        ? "Codici temporanei attivi."
                        : "Scansiona il QR con la tua app 2FA."}
                    </Text>
                    {accountUser?.totpEnabled ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={disableTotp}
                        loading={isSecurityBusy}
                      >
                        Disattiva app 2FA
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={startTotpSetup}
                        loading={isSecurityBusy}
                      >
                        Attiva app 2FA
                      </Button>
                    )}
                  </Stack>
                </div>

                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-4)">
                  <Stack gap="3">
                    <Icon icon={DeviceMobile} size="lg" />
                    <Text weight="semibold">SMS 2FA</Text>
                    <Text size="sm" tone="muted">
                      {mfaPhones.length
                        ? "Un numero verificato e riservato per 2FA."
                        : "Verifica un telefono e abilita il toggle SMS."}
                    </Text>
                    <Badge tone={mfaPhones.length ? "success" : "neutral"}>
                      {mfaPhones.length ? "attivo" : "non attivo"}
                    </Badge>
                  </Stack>
                </div>
              </div>

              {totpStep === "setup" && totp?.uri ? (
                <div className="grid gap-(--spacing-4) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-4) md:grid-cols-[auto,minmax(0,1fr)]">
                  <div className="rounded-(--radius-lg) bg-white p-(--spacing-3)">
                    <QRCodeSVG value={totp.uri} size={176} />
                  </div>
                  <Stack gap="3">
                    <Text weight="semibold">Scansiona il QR</Text>
                    <Text size="sm" tone="muted" className="break-all">
                      {totp.uri}
                    </Text>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setTotpStep("verify")}
                    >
                      Ho aggiunto il codice
                    </Button>
                  </Stack>
                </div>
              ) : null}

              {totpStep === "verify" ? (
                <Form
                  variant="plain"
                  layout="stack"
                  density="comfortable"
                  labelStyle="soft"
                  noValidate
                  onSubmit={verifyTotp}
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
              ) : null}

              {hasSecondFactor ? (
                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-4)">
                  <Stack gap="3">
                    <div className="flex items-center justify-between gap-(--spacing-3)">
                      <Text weight="semibold">Codici di backup</Text>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={generateBackupCodes}
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
                        Generali solo quando sei pronto a salvarli.
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
                    Modifiche sensibili disponibili solo con 2FA attiva.
                  </Text>
                </div>
                <Icon icon={hasSecondFactor ? CheckCircle : LockKey} size="lg" />
              </div>

              {!hasSecondFactor ? (
                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-4)">
                  <Text size="sm" tone="muted">
                    Attiva un secondo fattore prima di cambiare email o password.
                  </Text>
                </div>
              ) : (
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
              )}
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
                {accountUser?.primaryEmailAddress?.emailAddress ?? initialUser.email}
              </Text>
              <Badge tone={hasSecondFactor ? "success" : "warning"}>
                {hasSecondFactor ? "protetto con 2FA" : "2FA non attiva"}
              </Badge>
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
