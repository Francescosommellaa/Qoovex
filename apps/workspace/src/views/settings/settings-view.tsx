import { getPlanLabel } from "@shared/config/plan-rules";
import type { WorkspacePlan } from "@shared/lib/workspace-types";
import { WorkspacePage } from "@shared/ui";
import { getWorkspaceDashboard } from "@shared/server/dashboard-service";
import { AccountSettingsClient } from "./account-settings-client";

interface SettingsViewUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber?: string | null;
  imageUrl?: string | null;
  plan: WorkspacePlan;
}

function formatLimit(used: number, value: number | null) {
  return value === null ? `${used} / illimitato` : `${used} / ${value}`;
}

export async function SettingsView({ user }: { user: SettingsViewUser }) {
  const dashboard = await getWorkspaceDashboard(user.id, user.plan);
  const usage = {
    recipes: formatLimit(dashboard.limits.recipes.used, dashboard.limits.recipes.value),
    menus: formatLimit(dashboard.limits.menus.used, dashboard.limits.menus.value),
    workPlans: formatLimit(
      dashboard.limits.workPlans.used,
      dashboard.limits.workPlans.value,
    ),
    recipesReached: dashboard.limits.recipes.reached,
    menusReached: dashboard.limits.menus.reached,
    workPlansReached: dashboard.limits.workPlans.reached,
  };

  return (
    <WorkspacePage
      title="Impostazioni"
      description="Profilo, piano e usage del workspace personale."
    >
      <AccountSettingsClient
        user={user}
        usage={usage}
        planLabel={getPlanLabel(user.plan)}
      />
    </WorkspacePage>
  );
}
