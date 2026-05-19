import "server-only";

import { db } from "@qoovex/db";
import type { MenuBuilderInput } from "@shared/lib/workspace-types";

const menuSummarySelect = {
  id: true,
  title: true,
  description: true,
  isPublic: true,
  qrCodeUrl: true,
  updatedAt: true,
  author: { select: { id: true, username: true } },
  _count: { select: { items: true } },
} as const;

const menuDetailSelect = {
  ...menuSummarySelect,
  items: {
    orderBy: { position: "asc" },
    select: {
      id: true,
      recipeId: true,
      position: true,
      section: true,
      recipe: {
        select: {
          title: true,
          ingredients: {
            select: {
              ingredient: { select: { allergens: true } },
            },
          },
        },
      },
    },
  },
} as const;

function buildMenuWhere(userId: string, query?: string) {
  const search = query?.trim();

  return {
    authorId: userId,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function countMenusForUser(userId: string) {
  return await db.menu.count({ where: { authorId: userId } });
}

export async function listMenusForUser(userId: string, query?: string, take = 50) {
  return await db.menu.findMany({
    where: buildMenuWhere(userId, query),
    orderBy: { updatedAt: "desc" },
    take,
    select: menuSummarySelect,
  });
}

export async function findMenuDetailForUser(menuId: string, userId: string) {
  return await db.menu.findFirst({
    where: { id: menuId, authorId: userId },
    select: menuDetailSelect,
  });
}

export async function findMenuDetailVisibleToUser(menuId: string, userId: string) {
  return await db.menu.findFirst({
    where: {
      id: menuId,
      OR: [{ authorId: userId }, { isPublic: true }],
    },
    select: menuDetailSelect,
  });
}

export async function createMenuForUser(userId: string, input: MenuBuilderInput) {
  return await db.$transaction(async (tx) => {
    const ownedRecipes = await tx.recipe.findMany({
      where: {
        authorId: userId,
        id: { in: input.items.map((item) => item.recipeId) },
      },
      select: { id: true },
    });
    const allowedRecipeIds = new Set(ownedRecipes.map((recipe) => recipe.id));
    const items = input.items.filter((item) => allowedRecipeIds.has(item.recipeId));

    const menu = await tx.menu.create({
      data: {
        title: input.title,
        description: input.description || null,
        isPublic: input.isPublic,
        authorId: userId,
        items: {
          create: items.map((item, index) => ({
            recipeId: item.recipeId,
            section: item.section || null,
            position: index,
          })),
        },
      },
      select: { id: true },
    });

    return menu;
  });
}

export async function updateMenuForUser(
  menuId: string,
  userId: string,
  input: MenuBuilderInput,
) {
  return await db.$transaction(async (tx) => {
    const existing = await tx.menu.findFirst({
      where: { id: menuId, authorId: userId },
      select: { id: true },
    });
    if (!existing) return null;

    const ownedRecipes = await tx.recipe.findMany({
      where: {
        authorId: userId,
        id: { in: input.items.map((item) => item.recipeId) },
      },
      select: { id: true },
    });
    const allowedRecipeIds = new Set(ownedRecipes.map((recipe) => recipe.id));
    const items = input.items.filter((item) => allowedRecipeIds.has(item.recipeId));

    await tx.menu.update({
      where: { id: menuId },
      data: {
        title: input.title,
        description: input.description || null,
        isPublic: input.isPublic,
      },
    });

    await tx.menuItem.deleteMany({ where: { menuId } });
    await tx.menuItem.createMany({
      data: items.map((item, index) => ({
        menuId,
        recipeId: item.recipeId,
        section: item.section || null,
        position: index,
      })),
    });

    return { id: menuId };
  });
}

export async function listPublicMenus(query?: string, take = 40) {
  const search = query?.trim();

  return await db.menu.findMany({
    where: {
      isPublic: true,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take,
    select: menuSummarySelect,
  });
}
