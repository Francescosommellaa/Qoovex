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
  Modal,
  ModalBody,
  Stack,
  Text,
  useToast,
} from "@qoovex/ui";
import { updateCurrentUserProfile } from "@shared/actions/bootstrap-user";
import { WorkspaceBrandLoader } from "./workspace-brand-loader";
import { WorkspaceRouteSkeleton } from "./workspace-route-skeleton";

interface ProfileOnboardingFreezeProps {
  required: boolean;
  initialFirstName?: string | null;
  initialLastName?: string | null;
  children: React.ReactNode;
}

export function ProfileOnboardingFreeze({
  required,
  initialFirstName,
  initialLastName,
  children,
}: ProfileOnboardingFreezeProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(required);
  const [firstName, setFirstName] = React.useState(initialFirstName ?? "");
  const [lastName, setLastName] = React.useState(initialLastName ?? "");
  const [isSaving, setIsSaving] = React.useState(false);
  const showLoadedWorkspace = !required || !open;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    if (!normalizedFirstName) {
      toast({
        variant: "warning",
        title: "Nome richiesto",
        description: "Inserisci il nome per completare il profilo.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateCurrentUserProfile({
        firstName: normalizedFirstName,
        lastName: normalizedLastName || undefined,
      });

      if (!result?.ok) {
        toast({
          variant: "error",
          title: "Profilo non salvato",
          description: "Non siamo riusciti a completare il profilo. Riprova.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Profilo completato",
        description: "Il workspace e pronto.",
      });
      setOpen(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  if (!required) return <>{children}</>;

  return (
    <>
      <div
        aria-hidden={open ? "true" : undefined}
        className={open ? "pointer-events-none opacity-35 blur-[1px]" : undefined}
      >
        {showLoadedWorkspace ? children : <WorkspaceRouteSkeleton variant="dashboard" />}
      </div>
      {isSaving ? (
        <WorkspaceBrandLoader
          fullscreen
          label="Aggiorniamo il profilo..."
        />
      ) : null}
      <Modal
        open={open}
        dismissible={false}
        showCloseButton={false}
        closeOnEscape={false}
        closeOnOverlayClick={false}
        role="alertdialog"
        placement="center"
        size="sm"
        title="Completa il profilo"
        description="Nome e cognome personalizzano dashboard, ricette e workspace condivisi."
      >
        <ModalBody>
          <Form
            variant="plain"
            layout="stack"
            density="comfortable"
            labelStyle="soft"
            noValidate
            onSubmit={handleSubmit}
          >
            <Stack gap="3">
              <FormField label="Nome" required>
                <FormControl>
                  <Input
                    autoComplete="given-name"
                    disabled={isSaving}
                    value={firstName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setFirstName(event.target.value)
                    }
                  />
                </FormControl>
              </FormField>
              <FormField label="Cognome">
                <FormControl>
                  <Input
                    autoComplete="family-name"
                    disabled={isSaving}
                    value={lastName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setLastName(event.target.value)
                    }
                  />
                </FormControl>
              </FormField>
              <Text size="xs" tone="muted" leading="relaxed">
                Il nome e obbligatorio. Puoi modificarlo in seguito dalle impostazioni.
              </Text>
            </Stack>
            <FormActions align="stretch">
              <Button
                type="submit"
                loading={isSaving}
                loadingLabel="Salvataggio..."
                className="w-full"
              >
                Entra nel workspace
              </Button>
            </FormActions>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
}
