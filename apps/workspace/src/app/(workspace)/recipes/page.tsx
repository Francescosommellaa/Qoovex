import { redirect } from "next/navigation";
import type {
  RecipeCategory,
  RecipeFiltersDto,
  RecipeSort,
  RecipeViewMode,
  RecipeVisibilityFilter,
  RecipeValidityFilter,
} from "@shared/lib/workspace-types";
import { getCurrentWorkspaceUser } from "@shared/server/current-workspace-user";
import { RecipesIndexView } from "@views/recipes";

const CATEGORY_VALUES = new Set(["ANTIPASTO", "PRIMO", "SECONDO", "CONTORNO", "DOLCE", "PANE_LIEVITATI", "SALSA_BASE", "BEVANDA", "ALTRO", "all"]);
const SORT_VALUES = new Set(["updated-desc", "updated-asc", "kcal-desc", "kcal-asc", "title-asc"]);
const VISIBILITY_VALUES = new Set(["all", "public", "private"]);
const VALIDITY_VALUES = new Set(["all", "ready", "pending", "archived"]);
const VIEW_VALUES = new Set(["cards", "list"]);

function parseNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    visibility?: string;
    validity?: string;
    allergen?: string;
    kcalMin?: string;
    kcalMax?: string;
    view?: string;
  }>;
}) {
  const user = await getCurrentWorkspaceUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  const filters: RecipeFiltersDto = {
    query: params.q,
    category: CATEGORY_VALUES.has(params.category ?? "")
      ? (params.category as RecipeCategory | "all")
      : "all",
    sort: SORT_VALUES.has(params.sort ?? "") ? (params.sort as RecipeSort) : "updated-desc",
    visibility: VISIBILITY_VALUES.has(params.visibility ?? "")
      ? (params.visibility as RecipeVisibilityFilter)
      : "all",
    validity: VALIDITY_VALUES.has(params.validity ?? "")
      ? (params.validity as RecipeValidityFilter)
      : "all",
    allergen: params.allergen,
    kcalMin: parseNumber(params.kcalMin),
    kcalMax: parseNumber(params.kcalMax),
    view: VIEW_VALUES.has(params.view ?? "") ? (params.view as RecipeViewMode) : "cards",
  };

  return <RecipesIndexView user={user} filters={filters} />;
}
