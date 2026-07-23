import { describe, expect, it } from "vitest";
import type { WorkspaceFavoritesModel, WorkspaceNavigationItem } from "./workspace-navigation-policy";
import {
  FAVORITES_STORAGE_KEY_PREFIX,
  MAX_FAVORITES,
  favoritesStorageKey,
  loadFavoriteHrefs,
  sanitizeFavoriteHrefs,
} from "./WorkspaceFavorites";

const candidates: WorkspaceNavigationItem[] = [
  { label: "Documenti da controllare", href: "/documents?view=attention" },
  { label: "Scadenze", href: "/deadlines" },
  { label: "Checklist aperte", href: "/checklists?view=open" },
  { label: "Prove recenti", href: "/evidence?sort=recent" },
  { label: "Pacchetti pronti", href: "/document-packages?view=ready" },
];

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values,
  };
}

function ownerFavorites(): WorkspaceFavoritesModel {
  return {
    role: "OWNER",
    candidates,
    defaultHrefs: ["/documents?view=attention", "/deadlines"],
  };
}

describe("Workspace Favorites", () => {
  it("uses a stable versioned key scoped only by effective role", () => {
    expect(favoritesStorageKey("OWNER")).toBe(`${FAVORITES_STORAGE_KEY_PREFIX}:OWNER`);
    expect(favoritesStorageKey("WORKER")).toBe("qoovex.workspace.favorites.v2:WORKER");
  });

  it("sanitizes unauthorized, duplicate and excessive hrefs", () => {
    expect(sanitizeFavoriteHrefs([
      "/deadlines",
      "/notifications",
      "/deadlines",
      "/checklists?view=open",
      "/evidence?sort=recent",
      "/document-packages?view=ready",
      "/documents?view=attention",
      42,
    ], candidates)).toEqual([
      "/deadlines",
      "/checklists?view=open",
      "/evidence?sort=recent",
      "/document-packages?view=ready",
    ]);
    expect(MAX_FAVORITES).toBe(4);
    expect(sanitizeFavoriteHrefs([], candidates)).toEqual([]);
    expect(sanitizeFavoriteHrefs("/deadlines", candidates)).toBeNull();
  });

  it("loads the role-scoped preference and repairs invalid JSON with explicit defaults", () => {
    const key = favoritesStorageKey("OWNER");
    const storage = memoryStorage({ [key]: "not-json" });
    expect(loadFavoriteHrefs(storage, ownerFavorites())).toEqual(["/documents?view=attention", "/deadlines"]);
    expect(JSON.parse(storage.values.get(key) ?? "null")).toEqual(["/documents?view=attention", "/deadlines"]);
  });

  it("migrates the exact legacy key once and never migrates unauthorized links", () => {
    const legacyKey = "qoovex.workspace.quick-links.v1:/deadlines|/evidence|/checklists|/document-packages";
    const storage = memoryStorage({
      [legacyKey]: JSON.stringify(["/notifications", "/deadlines", "/evidence", "/deadlines"]),
    });
    expect(loadFavoriteHrefs(storage, ownerFavorites())).toEqual(["/deadlines", "/evidence?sort=recent"]);
    expect(JSON.parse(storage.values.get(favoritesStorageKey("OWNER")) ?? "null")).toEqual(["/deadlines", "/evidence?sort=recent"]);

    storage.values.set(legacyKey, JSON.stringify(["/checklists?view=open"]));
    expect(loadFavoriteHrefs(storage, ownerFavorites())).toEqual(["/deadlines", "/evidence?sort=recent"]);
  });

  it("falls back without throwing when localStorage is unavailable", () => {
    const unavailable = {
      getItem: () => { throw new Error("storage disabled"); },
      setItem: () => { throw new Error("storage disabled"); },
    };
    expect(loadFavoriteHrefs(unavailable, ownerFavorites())).toEqual(["/documents?view=attention", "/deadlines"]);
  });
});
