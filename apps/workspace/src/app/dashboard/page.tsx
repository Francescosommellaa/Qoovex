import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { Badge, Button, Card, CardBody, PageSection, Stack, Text } from "@qoovex/ui";

export default async function DashboardPage() {
  const user = await bootstrapUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <PageSection
      title="Workspace pronto"
      description="Il profilo e sincronizzato. Questa vista placeholder usa solo blocchi del design system."
    >
      <Card variant="panel" tone="success" padding="lg">
        <CardBody>
          <Stack gap="4">
            <Badge variant="soft" tone="success" size="md">
              Login funzionante
            </Badge>
            <Text as="h1" family="display" size="lg" weight="semibold">
              Ciao, {user.email ?? user.username ?? "chef"}
            </Text>
            <Text size="sm" tone="muted" leading="relaxed">
              La dashboard applicativa verra composta con pattern e componenti condivisi.
            </Text>
            <SignOutButton redirectUrl="/sign-in">
              <Button type="button" variant="secondary" size="md">
                Esci
              </Button>
            </SignOutButton>
          </Stack>
        </CardBody>
      </Card>
    </PageSection>
  );
}
