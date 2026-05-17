import { notFound } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Stack,
  Text,
} from "@qoovex/ui";
import {
  AddMemberForm,
  CreateWorkPlanForm,
  CreateWorkTaskForm,
  WorkTaskToggle,
} from "@features/work-plan-board";
import type { WorkspacePlan } from "@shared/lib/workspace-types";
import { WorkspacePage } from "@shared/ui";
import { getRecipeOptions } from "@shared/server/recipe-service";
import {
  getWorkPlanDetail,
  getWorkPlansIndex,
} from "@shared/server/work-plan-service";

interface WorkPlanViewUser {
  id: string;
  plan: WorkspacePlan;
}

function formatLimit(used: number, value: number | null) {
  return value === null ? `${used} / illimitato` : `${used} / ${value}`;
}

export async function WorkPlansIndexView({ user }: { user: WorkPlanViewUser }) {
  const { workPlans, createdCount, joinedCount, creationLimit } =
    await getWorkPlansIndex(user.id, user.plan);

  return (
    <WorkspacePage
      title="Piani di lavoro"
      description="Coordina task e membri: partecipare ai piani altrui resta gratis e illimitato."
    >
      <Stack gap="6">
        <div className="flex flex-wrap items-center justify-between gap-(--spacing-3)">
          <div className="flex flex-wrap gap-(--spacing-2)">
            <Badge tone="primary">creati {createdCount}</Badge>
            <Badge tone="neutral">partecipazioni {joinedCount}</Badge>
            <Badge tone={creationLimit.reached ? "warning" : "primary"}>
              {formatLimit(creationLimit.used, creationLimit.value)}
            </Badge>
          </div>
          <Button
            as="a"
            href="/work-plans/new"
            variant="primary"
            size="md"
            disabled={creationLimit.reached}
          >
            Nuovo piano
          </Button>
        </div>

        {workPlans.length === 0 ? (
          <EmptyState
            title="Nessun piano disponibile"
            description="Crea un piano se il tuo abbonamento lo consente, oppure partecipa gratis a quelli altrui."
          />
        ) : (
          <div className="grid gap-(--spacing-4) md:grid-cols-2 xl:grid-cols-3">
            {workPlans.map((workPlan) => (
              <Card key={workPlan.id} variant="panel" padding="md">
                <CardBody>
                  <Stack gap="4">
                    <div className="flex items-start justify-between gap-(--spacing-3)">
                      <div className="min-w-0">
                        <Text as="h2" size="lg" weight="semibold" className="truncate">
                          {workPlan.title}
                        </Text>
                        {workPlan.description ? (
                          <Text size="sm" tone="muted" leading="relaxed">
                            {workPlan.description}
                          </Text>
                        ) : null}
                      </div>
                      <Badge tone={workPlan.role === "creator" ? "primary" : "neutral"}>
                        {workPlan.role === "creator" ? "Creator" : "Membro"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-(--spacing-2)">
                      <Badge size="sm" tone="neutral">
                        {workPlan.completedTaskCount}/{workPlan.taskCount} task
                      </Badge>
                      <Badge size="sm" tone="neutral">
                        {workPlan.memberCount} membri
                      </Badge>
                    </div>
                    <Button
                      as="a"
                      href={`/work-plans/${workPlan.id}`}
                      variant="secondary"
                      size="sm"
                      className="self-start"
                    >
                      Apri piano
                    </Button>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Stack>
    </WorkspacePage>
  );
}

export function NewWorkPlanView() {
  return (
    <WorkspacePage
      title="Nuovo piano di lavoro"
      description="I limiti si applicano solo ai piani creati da te, non alle partecipazioni."
    >
      <Card variant="panel" padding="lg">
        <CardBody>
          <CreateWorkPlanForm />
        </CardBody>
      </Card>
    </WorkspacePage>
  );
}

export async function WorkPlanDetailView({
  user,
  workPlanId,
}: {
  user: WorkPlanViewUser;
  workPlanId: string;
}) {
  const [workPlan, recipes] = await Promise.all([
    getWorkPlanDetail(user.id, user.plan, workPlanId),
    getRecipeOptions(user.id),
  ]);
  if (!workPlan) notFound();

  return (
    <WorkspacePage title={workPlan.title} description={workPlan.description ?? undefined}>
      <Stack gap="6">
        <div className="flex flex-wrap gap-(--spacing-2)">
          <Badge tone={workPlan.role === "creator" ? "primary" : "neutral"}>
            {workPlan.role === "creator" ? "Creator" : "Membro"}
          </Badge>
          <Badge tone="neutral">
            {workPlan.completedTaskCount}/{workPlan.taskCount} task
          </Badge>
          <Badge tone="neutral">{workPlan.memberCount} membri</Badge>
        </div>

        <div className="grid gap-(--spacing-4) xl:grid-cols-[minmax(0,1fr)_24rem]">
          <Card variant="panel" padding="lg">
            <CardBody>
              <Stack gap="4">
                <Text as="h2" size="lg" weight="semibold">
                  Board task
                </Text>
                {workPlan.tasks.length === 0 ? (
                  <EmptyState
                    title="Nessun task"
                    description="Il creator puo aggiungere task liberi o collegati a snapshot ricetta."
                  />
                ) : (
                  <div className="grid gap-(--spacing-3)">
                    {workPlan.tasks.map((task) => (
                      <WorkTaskToggle
                        key={task.id}
                        workPlanId={workPlan.id}
                        task={task}
                      />
                    ))}
                  </div>
                )}
              </Stack>
            </CardBody>
          </Card>

          <Stack gap="4">
            <Card variant="panel" padding="lg">
              <CardBody>
                <Stack gap="4">
                  <Text as="h2" size="lg" weight="semibold">
                    Nuovo task
                  </Text>
                  <CreateWorkTaskForm
                    workPlanId={workPlan.id}
                    recipes={recipes}
                    disabled={!workPlan.canCreateTask}
                  />
                </Stack>
              </CardBody>
            </Card>

            <Card variant="panel" padding="lg">
              <CardBody>
                <Stack gap="4">
                  <div>
                    <Text as="h2" size="lg" weight="semibold">
                      Membri
                    </Text>
                    <Text size="sm" tone="muted">
                      {formatLimit(
                        workPlan.membersLimit.used,
                        workPlan.membersLimit.value,
                      )}
                    </Text>
                  </div>
                  <div className="grid gap-(--spacing-2)">
                    {workPlan.members.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3)"
                      >
                        <Text size="sm" weight="medium">
                          {member.name}
                        </Text>
                        <Text size="xs" tone="muted">
                          @{member.username}
                        </Text>
                      </div>
                    ))}
                  </div>
                  <AddMemberForm
                    workPlanId={workPlan.id}
                    disabled={!workPlan.canAddMember}
                  />
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </div>
      </Stack>
    </WorkspacePage>
  );
}
