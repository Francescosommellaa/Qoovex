import { planRules } from "@qoovex/config";
import type { LimitStatus, WorkspacePlan } from "@shared/lib/workspace-types";

type PlanLimitKey =
  | "recipes"
  | "menus"
  | "creatable_work_plans"
  | "active_work_plans"
  | "members_per_plan";

type PlanFeatureKey =
  | "menu_watermark"
  | "custom_qr"
  | "shopping_list_export"
  | "activity_log"
  | "api_access"
  | "dedicated_sla_support";

const plans = planRules.plans as Record<
  WorkspacePlan,
  {
    label: string;
    limits: Record<PlanLimitKey, { mode: "limited" | "unlimited"; value: number | null }>;
    features: Record<PlanFeatureKey, boolean>;
  }
>;

export function getPlanLabel(plan: WorkspacePlan) {
  return plans[plan].label;
}

export function getPlanLimit(
  plan: WorkspacePlan,
  limit: PlanLimitKey,
  used: number,
): LimitStatus {
  const definition = plans[plan].limits[limit];

  if (definition.mode === "unlimited") {
    return {
      mode: "unlimited",
      value: null,
      used,
      remaining: null,
      reached: false,
    };
  }

  const value = definition.value ?? 0;
  const remaining = Math.max(value - used, 0);

  return {
    mode: "limited",
    value,
    used,
    remaining,
    reached: used >= value,
  };
}

export function canUsePlanFeature(plan: WorkspacePlan, feature: PlanFeatureKey) {
  return plans[plan].features[feature];
}

export function assertLimitAvailable(status: LimitStatus, message: string) {
  if (status.reached) {
    throw new Error(message);
  }
}
