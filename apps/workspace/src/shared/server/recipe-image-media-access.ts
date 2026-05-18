import "server-only";

import { db } from "@qoovex/db";

export async function canAccessRecipeImagePathname(pathname: string, userId: string | null) {
  const normalizedPath = pathname.replace(/^\/+/, "");

  const publicRecipe = await db.recipe.findFirst({
    where: {
      deletedAt: null,
      isPublic: true,
      OR: [
        { imageUrl: { contains: normalizedPath } },
        { imageUrl: { endsWith: normalizedPath } },
      ],
    },
    select: { id: true },
  });

  if (publicRecipe) return true;
  if (!userId) return false;

  const ownedRecipe = await db.recipe.findFirst({
    where: {
      authorId: userId,
      deletedAt: null,
      OR: [
        { imageUrl: { contains: normalizedPath } },
        { imageUrl: { endsWith: normalizedPath } },
      ],
    },
    select: { id: true },
  });

  return Boolean(ownedRecipe);
}
