import "server-only";

import type { DashboardSummaryDto, WorkspacePlan } from "@shared/lib/workspace-types";
import { getMenuLimitStatus, getMenusIndex } from "@shared/server/menu-service";
import { getNotificationFeed } from "@shared/server/notification-service";
import { getRecipeLimitStatus, getRecipesIndex } from "@shared/server/recipe-service";
import { getShoppingListsIndex } from "@shared/server/shopping-list-service";
import { getWorkPlansIndex } from "@shared/server/work-plan-service";

export async function getWorkspaceDashboard(
  userId: string,
  plan: WorkspacePlan,
): Promise<DashboardSummaryDto> {
  const [
    recipesIndex,
    menusIndex,
    shoppingLists,
    workPlansIndex,
    notifications,
    recipeLimit,
    menuLimit,
  ] = await Promise.all([
    getRecipesIndex(userId, plan),
    getMenusIndex(userId, plan),
    getShoppingListsIndex(userId),
    getWorkPlansIndex(userId, plan),
    getNotificationFeed(userId),
    getRecipeLimitStatus(userId, plan),
    getMenuLimitStatus(userId, plan),
  ]);

  return {
    stats: {
      recipes: recipesIndex.recipes.length,
      menus: menusIndex.menus.length,
      shoppingLists: shoppingLists.length,
      createdWorkPlans: workPlansIndex.createdCount,
      joinedWorkPlans: workPlansIndex.joinedCount,
      unreadNotifications: notifications.unreadCount,
    },
    limits: {
      recipes: recipeLimit,
      menus: menuLimit,
      workPlans: workPlansIndex.creationLimit,
    },
    recentRecipes: recipesIndex.recipes.slice(0, 4),
    recentMenus: menusIndex.menus.slice(0, 4),
    recentShoppingLists: shoppingLists.slice(0, 4),
    recentWorkPlans: workPlansIndex.workPlans.slice(0, 4),
  };
}
