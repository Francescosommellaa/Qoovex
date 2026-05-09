import { ActionLink, EmptyState, PageSection, Stack } from "@qoovex/ui";

export default function NotFound() {
  return (
    <PageSection width="content" spacing="16">
      <EmptyState
        title="Pagina non trovata"
        description="L'indirizzo richiesto non corrisponde a nessuna pagina del workspace. Torna a un percorso sicuro per continuare."
        action={
          <Stack direction="row" gap="3" justify="center" wrap>
            <ActionLink href="/dashboard" variant="primary" size="md">
              Vai al workspace
            </ActionLink>
            <ActionLink href="/sign-in" variant="secondary" size="md">
              Accedi
            </ActionLink>
          </Stack>
        }
      />
    </PageSection>
  );
}
