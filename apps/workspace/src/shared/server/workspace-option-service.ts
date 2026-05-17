import "server-only";

import { listMenusForUser } from "@shared/server/repositories/menu-repository";

export async function getMenuOptionsForShoppingList(userId: string) {
  const menus = await listMenusForUser(userId, undefined, 100);
  return menus.map((menu) => ({
    id: menu.id,
    title: menu.title,
  }));
}
