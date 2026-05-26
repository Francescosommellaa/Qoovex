import { Button, FormActions, Stack, Text } from "@qoovex/ui";
import { AuthShell } from "../ui";

export default function WorkspaceUnavailablePage() {
  return (
    <AuthShell
      title="Workspace non disponibile"
      subtitle="Riprova ad aprire il workspace tra qualche istante."
    >
      <Stack gap="5">
        <Text tone="muted" size="sm" leading="relaxed">
          Stiamo completando un aggiornamento tecnico. Riprova tra qualche
          istante; se il problema persiste, non modificare il profilo.
        </Text>
        <FormActions align="stretch">
          <Button as="a" href="/dashboard" variant="primary" size="md" className="w-full">
            Riprova accesso
          </Button>
        </FormActions>
      </Stack>
    </AuthShell>
  );
}
