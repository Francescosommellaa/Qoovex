import "server-only";

import type { DashboardSummaryDto, WorkspacePlan } from "@shared/lib/workspace-types";
import { getMenusIndex } from "@shared/server/menu-service";
import { getUnreadNotificationCount } from "@shared/server/notification-service";
import { getRecipesIndex } from "@shared/server/recipe-service";
import {
  getShoppingListCount,
  getShoppingListsIndex,
} from "@shared/server/shopping-list-service";
import { getWorkPlansIndex } from "@shared/server/work-plan-service";

const DASHBOARD_RECENT_LIMIT = 4;

export async function getWorkspaceDashboard(
  userId: string,
  plan: WorkspacePlan,
): Promise<DashboardSummaryDto> {
  const [
    recipesIndex,
    menusIndex,
    shoppingListsCount,
    shoppingLists,
    workPlansIndex,
    unreadNotifications,
  ] = await Promise.all([
    getRecipesIndex(userId, plan, undefined, DASHBOARD_RECENT_LIMIT),
    getMenusIndex(userId, plan, undefined, DASHBOARD_RECENT_LIMIT),
    getShoppingListCount(userId),
    getShoppingListsIndex(userId, DASHBOARD_RECENT_LIMIT),
    getWorkPlansIndex(userId, plan, DASHBOARD_RECENT_LIMIT),
    getUnreadNotificationCount(userId),
  ]);

  return {
    stats: {
      recipes: recipesIndex.limit.used,
      menus: menusIndex.limit.used,
      shoppingLists: shoppingListsCount,
      createdWorkPlans: workPlansIndex.createdCount,
      joinedWorkPlans: workPlansIndex.joinedCount,
      unreadNotifications,
    },
    limits: {
      recipes: recipesIndex.limit,
      menus: menusIndex.limit,
      workPlans: workPlansIndex.creationLimit,
    },
    recentRecipes: recipesIndex.recipes,
    recentMenus: menusIndex.menus,
    recentShoppingLists: shoppingLists,
    recentWorkPlans: workPlansIndex.workPlans,
  };
}
