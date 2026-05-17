import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Stack,
  Text,
} from "@qoovex/ui";
import type { WorkspacePlan } from "@shared/lib/workspace-types";
import { WorkspacePage } from "@shared/ui";
import { getWorkspaceDashboard } from "@shared/server/dashboard-service";

interface DashboardViewProps {
  user: {
    id: string;
    plan: WorkspacePlan;
    name: string;
  };
}

function formatLimit(used: number, value: number | null) {
  return value === null ? `${used} / illimitato` : `${used} / ${value}`;
}

function MetricCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Card variant="panel" padding="md">
      <CardBody>
        <Stack gap="3">
          <div>
            <Text size="xs" tone="muted" weight="medium">
              {label}
            </Text>
            <Text as="p" family="display" size="xl" weight="semibold">
              {value}
            </Text>
          </div>
          <Button as="a" href={href} variant="ghost" size="xs" className="self-start">
            Apri
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );
}

export async function DashboardView({ user }: DashboardViewProps) {
  const dashboard = await getWorkspaceDashboard(user.id, user.plan);
  const hasAnyContent =
    dashboard.stats.recipes +
      dashboard.stats.menus +
      dashboard.stats.shoppingLists +
      dashboard.stats.createdWorkPlans +
      dashboard.stats.joinedWorkPlans >
    0;

  return (
    <WorkspacePage
      title={`Workspace di ${user.name}`}
      description="Panoramica operativa delle preparazioni, dei menu e del lavoro condiviso."
    >
      <Stack gap="6">
        <div className="grid gap-(--spacing-4) md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Ricette"
            value={dashboard.stats.recipes}
            href="/recipes"
          />
          <MetricCard
            label="Menu"
            value={dashboard.stats.menus}
            href="/menus"
          />
          <MetricCard
            label="Liste spesa"
            value={dashboard.stats.shoppingLists}
            href="/shopping-list"
          />
          <MetricCard
            label="Piani lavoro"
            value={dashboard.stats.createdWorkPlans + dashboard.stats.joinedWorkPlans}
            href="/work-plans"
          />
        </div>

        <div className="grid gap-(--spacing-4) lg:grid-cols-3">
          <Card variant="panel" padding="lg">
            <CardBody>
              <Stack gap="4">
                <Text as="h2" size="lg" weight="semibold">
                  Utilizzo piano
                </Text>
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

          <Card variant="panel" padding="lg" className="lg:col-span-2">
            <CardBody>
              <Stack gap="4">
                <div className="flex items-center justify-between gap-(--spacing-3)">
                  <div>
                    <Text as="h2" size="lg" weight="semibold">
                      Prossime azioni
                    </Text>
                    <Text size="sm" tone="muted">
                      Le CTA seguono le pagine abilitate nella sidebar.
                    </Text>
                  </div>
                  {dashboard.stats.unreadNotifications > 0 ? (
                    <Badge tone="error">
                      {dashboard.stats.unreadNotifications} unread
                    </Badge>
                  ) : null}
                </div>
                <div className="grid gap-(--spacing-3) md:grid-cols-3">
                  <Button as="a" href="/recipes/new" variant="primary" size="sm">
                    Nuova ricetta
                  </Button>
                  <Button as="a" href="/menus/new" variant="secondary" size="sm">
                    Nuovo menu
                  </Button>
                  <Button as="a" href="/work-plans/new" variant="secondary" size="sm">
                    Nuovo piano
                  </Button>
                </div>
              </Stack>
            </CardBody>
          </Card>
        </div>

        {!hasAnyContent ? (
          <EmptyState
            title="Workspace pronto per i contenuti"
            description="Parti dalle ricette: alimentano menu, lista della spesa, esplora e piani di lavoro."
            action={
              <Button as="a" href="/recipes/new" variant="primary" size="md">
                Crea prima ricetta
              </Button>
            }
          />
        ) : null}
      </Stack>
    </WorkspacePage>
  );
}
