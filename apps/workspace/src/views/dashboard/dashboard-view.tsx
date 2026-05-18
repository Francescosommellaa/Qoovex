import {
  ArrowRight,
  BellRinging,
  BookOpen,
  CheckCircle,
  ClipboardText,
  ForkKnife,
  ListChecks,
  Plus,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Icon,
  Stack,
  Text,
  cn,
} from "@qoovex/ui";
import type {
  DashboardSummaryDto,
  LimitStatus,
  WorkspacePlan,
} from "@shared/lib/workspace-types";
import { getWorkspaceDashboard } from "@shared/server/dashboard-service";
import { WorkspacePage } from "@shared/ui";

interface DashboardViewProps {
  user: {
    id: string;
    plan: WorkspacePlan;
    name: string;
  };
}

interface MetricCardProps {
  label: string;
  value: number;
  href: string;
  description: string;
  icon: ComponentType<PhosphorIconProps>;
  tone: "primary" | "success" | "warning" | "neutral";
}

interface RecentListProps {
  title: string;
  href: string;
  emptyLabel: string;
  items: Array<{
    id: string;
    title: string;
    meta: string;
    href: string;
  }>;
}

const planLabel: Record<WorkspacePlan, string> = {
  FREE: "Free",
  START: "Start",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

function formatLimit(used: number, value: number | null) {
  return value === null ? `${used} / illimitato` : `${used} / ${value}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function getLimitProgress(limit: LimitStatus) {
  if (limit.value === null) return 100;
  if (limit.value <= 0) return limit.reached ? 100 : 0;
  return Math.min(100, Math.round((limit.used / limit.value) * 100));
}

function getLimitTone(limit: LimitStatus): "primary" | "warning" | "success" {
  if (limit.reached) return "warning";
  if (limit.value === null) return "success";
  return getLimitProgress(limit) >= 80 ? "warning" : "primary";
}

function MetricCard({
  label,
  value,
  href,
  description,
  icon,
  tone,
}: MetricCardProps) {
  return (
    <Card
      variant="panel"
      tone={tone}
      padding="md"
      interactive
      className="min-h-[10rem]"
    >
      <CardBody>
        <Stack gap="4" className="h-full justify-between">
          <div className="flex items-start justify-between gap-(--spacing-3)">
            <span className="grid size-10 shrink-0 place-items-center rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface-offset)">
              <Icon icon={icon} size="md" weight="duotone" />
            </span>
            <Text as="p" family="display" size="xl" weight="semibold" leading="tight">
              {value}
            </Text>
          </div>
          <div className="grid gap-(--spacing-2)">
            <div>
              <Text size="sm" weight="semibold">
                {label}
              </Text>
              <Text size="xs" tone="muted" leading="relaxed" className="mt-(--spacing-1)">
                {description}
              </Text>
            </div>
            <Button
              as="a"
              href={href}
              variant="secondary"
              size="xs"
              className="w-full sm:w-fit"
              iconRight={<ArrowRight size={12} weight="bold" />}
            >
              Apri
            </Button>
          </div>
        </Stack>
      </CardBody>
    </Card>
  );
}

function LimitRow({ label, limit }: { label: string; limit: LimitStatus }) {
  const progress = getLimitProgress(limit);
  const tone = getLimitTone(limit);

  return (
    <div className="grid gap-(--spacing-2)">
      <div className="flex items-center justify-between gap-(--spacing-3)">
        <Text size="sm" weight="medium">
          {label}
        </Text>
        <Badge tone={tone} size="sm">
          {formatLimit(limit.used, limit.value)}
        </Badge>
      </div>
      <div className="h-2 overflow-hidden rounded-(--radius-full) bg-(--color-surface-offset)">
        <span
          className={cn(
            "block h-full rounded-(--radius-full)",
            tone === "warning"
              ? "bg-(--color-warning)"
              : tone === "success"
                ? "bg-(--color-success)"
                : "bg-(--color-primary)",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ActionPanel({ dashboard }: { dashboard: DashboardSummaryDto }) {
  const totalWorkPlans =
    dashboard.stats.createdWorkPlans + dashboard.stats.joinedWorkPlans;

  return (
    <Card variant="bento" tone="primary" padding="lg" className="xl:col-span-7">
      <CardBody>
        <div className="grid gap-(--spacing-5) lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
          <Stack gap="4">
            <div className="grid gap-(--spacing-2)">
              <Text as="h2" family="display" size="xl" weight="semibold" leading="tight">
                Prossima mossa
              </Text>
              <Text size="sm" tone="muted" leading="relaxed">
                Parti da una preparazione: ricette, menu, spesa e piani si
                aggiornano attorno al lavoro reale della cucina.
              </Text>
            </div>
            <div className="grid grid-cols-2 gap-(--spacing-3) sm:grid-cols-3">
              <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface)/70 p-(--spacing-3)">
                <Text size="xs" tone="muted">
                  Piani attivi
                </Text>
                <Text family="display" size="lg" weight="semibold">
                  {totalWorkPlans}
                </Text>
              </div>
              <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface)/70 p-(--spacing-3)">
                <Text size="xs" tone="muted">
                  Notifiche
                </Text>
                <Text family="display" size="lg" weight="semibold">
                  {dashboard.stats.unreadNotifications}
                </Text>
              </div>
              <div className="col-span-2 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface)/70 p-(--spacing-3) sm:col-span-1">
                <Text size="xs" tone="muted">
                  Liste spesa
                </Text>
                <Text family="display" size="lg" weight="semibold">
                  {dashboard.stats.shoppingLists}
                </Text>
              </div>
            </div>
          </Stack>

          <div className="grid gap-(--spacing-3)">
            <Button
              as="a"
              href="/recipes/new"
              variant="primary"
              size="md"
              className="w-full"
              iconLeft={<Plus size={14} weight="bold" />}
            >
              Nuova ricetta
            </Button>
            <div className="grid grid-cols-2 gap-(--spacing-2)">
              <Button as="a" href="/menus/new" variant="secondary" size="sm">
                Nuovo menu
              </Button>
              <Button as="a" href="/work-plans/new" variant="secondary" size="sm">
                Nuovo piano
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function PlanPanel({
  dashboard,
  plan,
}: {
  dashboard: DashboardSummaryDto;
  plan: WorkspacePlan;
}) {
  const hasReachedLimit =
    dashboard.limits.recipes.reached ||
    dashboard.limits.menus.reached ||
    dashboard.limits.workPlans.reached;

  return (
    <Card variant="panel" tone={hasReachedLimit ? "warning" : "neutral"} padding="lg" className="xl:col-span-5">
      <CardBody>
        <Stack gap="5">
          <div className="flex items-start justify-between gap-(--spacing-4)">
            <div>
              <Text as="h2" size="lg" weight="semibold">
                Utilizzo piano
              </Text>
              <Text size="sm" tone="muted" className="mt-(--spacing-1)">
                Piano {planLabel[plan]}
              </Text>
            </div>
            <Badge
              tone={hasReachedLimit ? "warning" : "success"}
              iconLeft={
                hasReachedLimit ? (
                  <WarningCircle size={12} weight="bold" />
                ) : (
                  <CheckCircle size={12} weight="bold" />
                )
              }
            >
              {hasReachedLimit ? "Da gestire" : "In ordine"}
            </Badge>
          </div>
          <Stack gap="4">
            <LimitRow label="Ricette" limit={dashboard.limits.recipes} />
            <LimitRow label="Menu" limit={dashboard.limits.menus} />
            <LimitRow label="Piani creati" limit={dashboard.limits.workPlans} />
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}

function RecentList({ title, href, emptyLabel, items }: RecentListProps) {
  return (
    <Card variant="panel" padding="md">
      <CardBody>
        <Stack gap="4">
          <div className="flex items-center justify-between gap-(--spacing-3)">
            <Text as="h2" size="lg" weight="semibold">
              {title}
            </Text>
            <Button as="a" href={href} variant="secondary" size="xs">
              Vedi
            </Button>
          </div>
          <div className="grid gap-(--spacing-2)">
            {items.length > 0 ? (
              items.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="group flex min-h-12 items-center justify-between gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface)/56 px-(--spacing-3) py-(--spacing-2) transition-[background,border-color] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] hover:border-(--color-primary)/30 hover:bg-(--color-surface-offset)"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-(length:--text-sm) font-medium text-(--color-text)">
                      {item.title}
                    </span>
                    <span className="block truncate text-(length:--text-xs) text-(--color-text-muted)">
                      {item.meta}
                    </span>
                  </span>
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className="shrink-0 text-(--color-text-faint) transition-transform duration-[var(--duration-base)] ease-[var(--ease-qoovex)] group-hover:translate-x-0.5 group-hover:text-(--color-text)"
                    aria-hidden="true"
                  />
                </a>
              ))
            ) : (
              <div className="rounded-(--radius-lg) border border-dashed border-(--color-border) px-(--spacing-3) py-(--spacing-4)">
                <Text size="sm" tone="muted">
                  {emptyLabel}
                </Text>
              </div>
            )}
          </div>
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
      actions={
        <Button
          as="a"
          href="/recipes/new"
          variant="primary"
          size="sm"
          iconLeft={<Plus size={14} weight="bold" />}
        >
          Nuova ricetta
        </Button>
      }
    >
      <Stack gap="5">
        <div className="grid grid-cols-2 gap-(--spacing-3) md:gap-(--spacing-4) xl:grid-cols-4">
          <MetricCard
            label="Ricette"
            value={dashboard.stats.recipes}
            href="/recipes"
            description="Base operativa per menu, spesa e piani."
            icon={BookOpen}
            tone="primary"
          />
          <MetricCard
            label="Menu"
            value={dashboard.stats.menus}
            href="/menus"
            description="Carte digitali e composizioni pronte."
            icon={ForkKnife}
            tone="success"
          />
          <MetricCard
            label="Spesa"
            value={dashboard.stats.shoppingLists}
            href="/shopping-list"
            description="Liste generate o create manualmente."
            icon={ListChecks}
            tone="warning"
          />
          <MetricCard
            label="Piani"
            value={dashboard.stats.createdWorkPlans + dashboard.stats.joinedWorkPlans}
            href="/work-plans"
            description="Task condivisi e preparazioni coordinate."
            icon={ClipboardText}
            tone="neutral"
          />
        </div>

        <div className="grid gap-(--spacing-4) xl:grid-cols-12">
          <ActionPanel dashboard={dashboard} />
          <PlanPanel dashboard={dashboard} plan={user.plan} />
        </div>

        {dashboard.stats.unreadNotifications > 0 ? (
          <Card variant="panel" tone="primary" padding="md">
            <CardBody>
              <div className="flex flex-col gap-(--spacing-3) sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-(--spacing-3)">
                  <span className="grid size-10 shrink-0 place-items-center rounded-(--radius-full) bg-(--color-primary-highlight) text-(--color-primary)">
                    <BellRinging size={18} weight="duotone" />
                  </span>
                  <div>
                    <Text weight="semibold">
                      {dashboard.stats.unreadNotifications} notifiche da leggere
                    </Text>
                    <Text size="sm" tone="muted">
                      Controlla aggiornamenti e task completati.
                    </Text>
                  </div>
                </div>
                <Button as="a" href="/notifications" variant="secondary" size="sm">
                  Apri notifiche
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : null}

        <div className="grid gap-(--spacing-4) lg:grid-cols-2">
          <RecentList
            title="Ricette recenti"
            href="/recipes"
            emptyLabel="Nessuna ricetta recente."
            items={dashboard.recentRecipes.map((recipe) => ({
              id: recipe.id,
              title: recipe.title,
              meta: `${recipe.ingredientsCount} ingredienti · ${formatDate(recipe.updatedAt)}`,
              href: `/recipes/${recipe.id}`,
            }))}
          />
          <RecentList
            title="Menu recenti"
            href="/menus"
            emptyLabel="Nessun menu recente."
            items={dashboard.recentMenus.map((menu) => ({
              id: menu.id,
              title: menu.title,
              meta: `${menu.itemsCount} ricette · ${formatDate(menu.updatedAt)}`,
              href: `/menus/${menu.id}`,
            }))}
          />
          <RecentList
            title="Liste spesa"
            href="/shopping-list"
            emptyLabel="Nessuna lista spesa recente."
            items={dashboard.recentShoppingLists.map((list) => ({
              id: list.id,
              title: list.title,
              meta: `${list.checkedCount}/${list.itemsCount} completate · ${formatDate(list.updatedAt)}`,
              href: `/shopping-list/${list.id}`,
            }))}
          />
          <RecentList
            title="Piani di lavoro"
            href="/work-plans"
            emptyLabel="Nessun piano di lavoro recente."
            items={dashboard.recentWorkPlans.map((plan) => ({
              id: plan.id,
              title: plan.title,
              meta: `${plan.completedTaskCount}/${plan.taskCount} task · ${plan.memberCount} membri`,
              href: `/work-plans/${plan.id}`,
            }))}
          />
        </div>

        {!hasAnyContent ? (
          <EmptyState
            title="Workspace pronto per il primo servizio"
            description="Crea una ricetta: potrai usarla per menu, lista della spesa, esplora e piani di lavoro."
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
