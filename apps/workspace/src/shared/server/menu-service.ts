import "server-only";

import { assertLimitAvailable, canUsePlanFeature, getPlanLimit } from "@shared/config/plan-rules";
import type {
  LimitStatus,
  MenuBuilderInput,
  MenuDetailDto,
  MenuSummaryDto,
  WorkspacePlan,
} from "@shared/lib/workspace-types";
import {
  countMenusForUser,
  createMenuForUser,
  findMenuDetailForUser,
  findMenuDetailVisibleToUser,
  listMenusForUser,
  listPublicMenus,
  updateMenuForUser,
} from "@shared/server/repositories/menu-repository";
import { WorkspaceValidationError } from "@shared/server/recipe-service";

function uniqueAllergens(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "it"));
}

export function normalizeMenuInput(input: MenuBuilderInput): MenuBuilderInput {
  const title = input.title.trim();
  if (!title) {
    throw new WorkspaceValidationError("Il titolo del menu e obbligatorio.");
  }

  const items = input.items
    .map((item) => ({
      recipeId: item.recipeId.trim(),
      section: item.section?.trim() || undefined,
    }))
    .filter((item) => item.recipeId);

  if (items.length === 0) {
    throw new WorkspaceValidationError("Aggiungi almeno una ricetta al menu.");
  }

  return {
    title,
    description: input.description?.trim() || undefined,
    isPublic: Boolean(input.isPublic),
    items,
  };
}

function mapMenuSummary(menu: Awaited<ReturnType<typeof listMenusForUser>>[number]): MenuSummaryDto {
  return {
    id: menu.id,
    title: menu.title,
    description: menu.description,
    isPublic: menu.isPublic,
    qrCodeUrl: menu.qrCodeUrl,
    itemsCount: menu._count.items,
    updatedAt: menu.updatedAt.toISOString(),
    authorName: menu.author.name,
  };
}

function mapMenuDetail(
  menu: NonNullable<Awaited<ReturnType<typeof findMenuDetailForUser>>>,
  userId: string,
): MenuDetailDto {
  return {
    ...mapMenuSummary(menu),
    canEdit: menu.author.id === userId,
    items: menu.items.map((item) => ({
      id: item.id,
      recipeId: item.recipeId,
      title: item.recipe.title,
      section: item.section,
      position: item.position,
      allergens: uniqueAllergens(
        item.recipe.ingredients.flatMap((ingredient) => ingredient.ingredient.allergens),
      ),
    })),
  };
}

export async function getMenuLimitStatus(userId: string, plan: WorkspacePlan): Promise<LimitStatus> {
  return getPlanLimit(plan, "menus", await countMenusForUser(userId));
}

export async function getMenusIndex(userId: string, plan: WorkspacePlan, query?: string) {
  const [menus, limit] = await Promise.all([
    listMenusForUser(userId, query),
    getMenuLimitStatus(userId, plan),
  ]);

  return {
    menus: menus.map(mapMenuSummary),
    limit,
    canUseCustomQr: canUsePlanFeature(plan, "custom_qr"),
    hasMenuWatermark: canUsePlanFeature(plan, "menu_watermark"),
  };
}

export async function getMenuDetail(userId: string, menuId: string) {
  const menu = await findMenuDetailVisibleToUser(menuId, userId);
  return menu ? mapMenuDetail(menu, userId) : null;
}

export async function createMenu(userId: string, plan: WorkspacePlan, input: MenuBuilderInput) {
  const limit = await getMenuLimitStatus(userId, plan);
  assertLimitAvailable(limit, "Hai raggiunto il limite di menu del piano.");
  return await createMenuForUser(userId, normalizeMenuInput(input));
}

export async function updateMenu(userId: string, menuId: string, input: MenuBuilderInput) {
  return await updateMenuForUser(menuId, userId, normalizeMenuInput(input));
}

export async function getPublicMenus(userId: string, query?: string) {
  const menus = await listPublicMenus(query);
  return menus.map((menu) => ({
    ...mapMenuSummary(menu),
    canEdit: menu.author.id === userId,
  }));
}
