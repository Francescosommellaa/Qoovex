import {
  Badge,
  Card,
  CardBody,
  PageSection,
  Stack,
  Text,
} from "@qoovex/ui";
import { getPlanLabel } from "@shared/config/plan-rules";
import type { WorkspacePlan } from "@shared/lib/workspace-types";
import { getWorkspaceDashboard } from "@shared/server/dashboard-service";

interface SettingsViewUser {
  id: string;
  name: string;
  username: string;
  email: string;
  plan: WorkspacePlan;
}

function formatLimit(used: number, value: number | null) {
  return value === null ? `${used} / illimitato` : `${used} / ${value}`;
}

export async function SettingsView({ user }: { user: SettingsViewUser }) {
  const dashboard = await getWorkspaceDashboard(user.id, user.plan);

  return (
    <PageSection
      title="Impostazioni"
      description="Profilo, piano e usage del workspace personale."
    >
      <div className="grid gap-(--spacing-4) xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card variant="panel" padding="lg">
          <CardBody>
            <Stack gap="5">
              <div>
                <Text as="h2" size="lg" weight="semibold">
                  Profilo
                </Text>
                <Text size="sm" tone="muted">
                  Email e username sono gestiti dal profilo auth corrente.
                </Text>
              </div>
              <div className="grid gap-(--spacing-3)">
                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3)">
                  <Text size="xs" tone="muted">
                    Nome
                  </Text>
                  <Text size="sm" weight="medium">
                    {user.name}
                  </Text>
                </div>
                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3)">
                  <Text size="xs" tone="muted">
                    Username
                  </Text>
                  <Text size="sm" weight="medium">
                    @{user.username}
                  </Text>
                </div>
                <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3)">
                  <Text size="xs" tone="muted">
                    Email
                  </Text>
                  <Text size="sm" weight="medium" className="break-all">
                    {user.email}
                  </Text>
                </div>
              </div>
            </Stack>
          </CardBody>
        </Card>

        <Stack gap="4">
          <Card variant="panel" padding="lg">
            <CardBody>
              <Stack gap="4">
                <div>
                  <Text as="h2" size="lg" weight="semibold">
                    Piano
                  </Text>
                  <Badge tone="primary">{getPlanLabel(user.plan)}</Badge>
                </div>
                <div className="grid gap-(--spacing-3)">
                  <div className="flex items-center justify-between gap-(--spacing-3)">
                    <Text size="sm" tone="muted">
                      Ricette
                    </Text>
                    <Badge tone={dashboard.limits.recipes.reached ? "warning" : "primary"}>
                      {formatLimit(
                        dashboard.limits.recipes.used,
                        dashboard.limits.recipes.value,
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-(--spacing-3)">
                    <Text size="sm" tone="muted">
                      Menu
                    </Text>
                    <Badge tone={dashboard.limits.menus.reached ? "warning" : "primary"}>
                      {formatLimit(
                        dashboard.limits.menus.used,
                        dashboard.limits.menus.value,
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-(--spacing-3)">
                    <Text size="sm" tone="muted">
                      Piani creati
                    </Text>
                    <Badge
                      tone={dashboard.limits.workPlans.reached ? "warning" : "primary"}
                    >
                      {formatLimit(
                        dashboard.limits.workPlans.used,
                        dashboard.limits.workPlans.value,
                      )}
                    </Badge>
                  </div>
                </div>
              </Stack>
            </CardBody>
          </Card>

          <Card variant="panel" padding="lg">
            <CardBody>
              <Stack gap="3">
                <Text as="h2" size="lg" weight="semibold">
                  Preferenze visuali
                </Text>
                <Text size="sm" tone="muted" leading="relaxed">
                  Tema, contrasto e scala testo sono disponibili nel menu utente della sidebar.
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </Stack>
      </div>
    </PageSection>
  );
}
