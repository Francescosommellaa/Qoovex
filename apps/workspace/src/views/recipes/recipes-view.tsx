import type * as React from "react";
import { notFound } from "next/navigation";
import { Clock, ForkKnife, ListBullets, SquaresFour } from "@phosphor-icons/react/dist/ssr";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Stack,
  Text,
} from "@qoovex/ui";
import { RecipeDetailActions } from "@features/recipe-actions";
import { RecipeEditorForm } from "@features/recipe-editor";
import {
  NUTRITION_DISPLAY_ROWS,
  RECIPE_CATEGORY_OPTIONS,
  formatGdaRange,
  formatNutritionRange,
  getRecipeCategoryLabel,
} from "@shared/lib/ingredient-normalization";
import type {
  NutritionRangesDto,
  RecipeFiltersDto,
  RecipeSummaryDto,
  WorkspacePlan,
} from "@shared/lib/workspace-types";
import { WorkspaceBreadcrumb, WorkspacePage } from "@shared/ui";
import {
  getRecipeDetail,
  getRecipesIndex,
} from "@shared/server/recipe-service";

interface RecipesViewUser {
  id: string;
  plan: WorkspacePlan;
}

const SORT_OPTIONS = [
  { value: "updated-desc", label: "Piu recenti" },
  { value: "updated-asc", label: "Meno recenti" },
  { value: "kcal-desc", label: "Kcal alte" },
  { value: "kcal-asc", label: "Kcal basse" },
  { value: "title-asc", label: "A-Z" },
];

const VISIBILITY_OPTIONS = [
  { value: "all", label: "Tutte" },
  { value: "public", label: "Pubbliche" },
  { value: "private", label: "Private" },
];

const VALIDITY_OPTIONS = [
  { value: "all", label: "Attive" },
  { value: "ready", label: "Valide" },
  { value: "pending", label: "In revisione" },
  { value: "archived", label: "Archiviate" },
];

const VIEW_OPTIONS = [
  { value: "cards", label: "Card" },
  { value: "list", label: "Lista" },
];

function formatLimit(used: number, value: number | null) {
  return value === null ? `${used} / illimitato` : `${used} / ${value}`;
}

function statusTone(recipe: RecipeSummaryDto) {
  if (recipe.status === "PENDING_REVIEW") return "warning";
  if (recipe.status === "PUBLISHED" || recipe.isPublic) return "success";
  if (recipe.status === "ARCHIVED") return "neutral";
  return "primary";
}

function statusLabel(recipe: RecipeSummaryDto) {
  if (recipe.status === "PENDING_REVIEW") return "In revisione";
  if (recipe.status === "PUBLISHED" || recipe.isPublic) return "Pubblica";
  if (recipe.status === "ARCHIVED") return "Archiviata";
  if (recipe.status === "DRAFT") return "Bozza";
  return "Privata";
}

function filterParams(filters: RecipeFiltersDto) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.sort && filters.sort !== "updated-desc") params.set("sort", filters.sort);
  if (filters.visibility && filters.visibility !== "all") params.set("visibility", filters.visibility);
  if (filters.validity && filters.validity !== "all") params.set("validity", filters.validity);
  if (filters.allergen) params.set("allergen", filters.allergen);
  if (typeof filters.kcalMin === "number") params.set("kcalMin", String(filters.kcalMin));
  if (typeof filters.kcalMax === "number") params.set("kcalMax", String(filters.kcalMax));
  if (filters.view && filters.view !== "cards") params.set("view", filters.view);
  return params.toString();
}

function hrefForFilters(filters: RecipeFiltersDto) {
  const params = filterParams(filters);
  return params ? `/recipes?${params}` : "/recipes";
}

function RecipeFilters({ filters }: { filters: RecipeFiltersDto }) {
  return (
    <div className="grid gap-(--spacing-4)">
      <Input
        name="q"
        label="Cerca"
        placeholder="Titolo, descrizione"
        defaultValue={filters.query ?? ""}
      />
      <FilterSelect
        name="category"
        label="Categoria"
        options={[{ value: "all", label: "Tutte le categorie" }, ...RECIPE_CATEGORY_OPTIONS]}
        defaultValue={filters.category ?? "all"}
      />
      <FilterSelect
        name="visibility"
        label="Visibilita"
        options={VISIBILITY_OPTIONS}
        defaultValue={filters.visibility ?? "all"}
      />
      <FilterSelect
        name="validity"
        label="Stato"
        options={VALIDITY_OPTIONS}
        defaultValue={filters.validity ?? "all"}
      />
      <FilterSelect
        name="sort"
        label="Ordine"
        options={SORT_OPTIONS}
        defaultValue={filters.sort ?? "updated-desc"}
      />
      <FilterSelect
        name="view"
        label="Vista"
        options={VIEW_OPTIONS}
        defaultValue={filters.view ?? "cards"}
      />
      <Input
        name="allergen"
        label="Allergene"
        placeholder="glutine"
        defaultValue={filters.allergen ?? ""}
      />
      <div className="grid grid-cols-2 gap-(--spacing-3)">
        <Input
          name="kcalMin"
          label="Kcal min"
          type="number"
          min={0}
          defaultValue={filters.kcalMin ?? ""}
        />
        <Input
          name="kcalMax"
          label="Kcal max"
          type="number"
          min={0}
          defaultValue={filters.kcalMax ?? ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-(--spacing-2)">
        <Button type="submit" variant="primary" size="sm">
          Applica
        </Button>
        <Button as="a" href="/recipes" variant="secondary" size="sm">
          Reset
        </Button>
      </div>
    </div>
  );
}

function FilterSelect({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  defaultValue: string;
}) {
  return (
    <label className="grid gap-(--spacing-1)">
      <span className="text-(length:--text-xs) font-(--font-weight-medium) text-(--color-text-muted)">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-(--input-height-md) rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) px-(--spacing-3) text-(length:--text-sm) text-(--color-text) outline-none transition-colors focus:border-(--color-primary)"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function RecipeCard({ recipe, compact = false }: { recipe: RecipeSummaryDto; compact?: boolean }) {
  return (
    <Card variant="panel" padding="md" className="h-full">
      <CardBody>
        <Stack gap="4">
          {recipe.imageUrl ? (
            <div className="aspect-[16/10] overflow-hidden rounded-(--radius-lg) bg-(--color-surface-muted)">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={recipe.imageUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-200 hover:scale-[1.03]"
              />
            </div>
          ) : null}

          <div className="flex items-start justify-between gap-(--spacing-3)">
            <div className="min-w-0">
              <Text as="h2" size={compact ? "base" : "lg"} weight="semibold" className="truncate">
                {recipe.title}
              </Text>
              <Text size="xs" tone="muted">
                {getRecipeCategoryLabel(recipe.category)}
              </Text>
            </div>
            <Badge tone={statusTone(recipe)}>{statusLabel(recipe)}</Badge>
          </div>

          {recipe.description ? (
            <Text size="sm" tone="muted" leading="relaxed" className="line-clamp-2">
              {recipe.description}
            </Text>
          ) : null}

          <div className="grid grid-cols-2 gap-(--spacing-2)">
            <Metric icon={<ForkKnife size={14} />} label={`${recipe.ingredientsCount} ingr.`} />
            <Metric icon={<Clock size={14} />} label={`${(recipe.prepTime ?? 0) + (recipe.cookTime ?? 0)} min`} />
            <Metric label={`${recipe.servings} porzioni`} />
            <Metric label={formatNutritionRange(recipe.nutrition.calories)} />
          </div>

          <div className="flex flex-wrap gap-(--spacing-2)">
            {recipe.allergens.slice(0, 4).map((allergen) => (
              <Badge key={allergen} size="sm" tone="warning">
                {allergen}
              </Badge>
            ))}
            {recipe.allergens.length === 0 ? (
              <Badge size="sm" tone="neutral">
                allergeni non noti
              </Badge>
            ) : null}
          </div>

          <Button
            as="a"
            href={`/recipes/${recipe.id}`}
            variant="secondary"
            size="sm"
            className="self-start"
          >
            Apri ricetta
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );
}

function Metric({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="flex min-h-9 items-center gap-(--spacing-2) rounded-(--radius-md) bg-(--color-surface-muted) px-(--spacing-2) text-(length:--text-xs) font-(--font-weight-medium) text-(--color-text-muted)">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

function NutritionSummaryRows({ nutrition }: { nutrition: NutritionRangesDto }) {
  return (
    <div className="grid gap-(--spacing-2)">
      {NUTRITION_DISPLAY_ROWS.map((row) => (
        <div
          key={row.key}
          className={`flex items-baseline justify-between gap-(--spacing-3) rounded-(--radius-md) bg-(--color-surface-muted) px-(--spacing-3) py-(--spacing-2) ${
            row.indented ? "ml-(--spacing-3)" : ""
          }`}
        >
          <Text size="xs" tone="muted">
            {row.label}
          </Text>
          <Text size="sm" weight={row.indented ? "medium" : "semibold"} className="text-right">
            {formatNutritionRange(nutrition[row.key])}
          </Text>
        </div>
      ))}
      <div className="flex items-baseline justify-between gap-(--spacing-3) rounded-(--radius-md) bg-(--color-surface-muted) px-(--spacing-3) py-(--spacing-2)">
        <Text size="xs" tone="muted">
          GDA
        </Text>
        <Text size="sm" weight="semibold" className="text-right">
          {formatGdaRange(nutrition.calories)}
        </Text>
      </div>
    </div>
  );
}

export async function RecipesIndexView({
  user,
  filters,
}: {
  user: RecipesViewUser;
  filters: RecipeFiltersDto;
}) {
  const { recipes, limit } = await getRecipesIndex(user.id, user.plan, filters);
  const view = filters.view ?? "cards";

  return (
    <WorkspacePage
      title="Ricette"
      description="Catalogo operativo con ingredienti verificati, allergeni automatici e pubblicazione su Esplora."
    >
      <Stack gap="5">
        <section className="grid gap-(--spacing-4) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-4) shadow-(--shadow-sm) lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <Text as="h2" size="xl" weight="semibold">
              Archivio ricette
            </Text>
            <Text size="sm" tone="muted">
              {recipes.length} risultati visibili. Piano: {formatLimit(limit.used, limit.value)}.
            </Text>
          </div>
          <div className="flex flex-wrap gap-(--spacing-2)">
            <Button
              as="a"
              href={hrefForFilters({ ...filters, view: "cards" })}
              variant={view === "cards" ? "primary" : "secondary"}
              size="sm"
              iconLeft={<SquaresFour size={14} />}
            >
              Card
            </Button>
            <Button
              as="a"
              href={hrefForFilters({ ...filters, view: "list" })}
              variant={view === "list" ? "primary" : "secondary"}
              size="sm"
              iconLeft={<ListBullets size={14} />}
            >
              Lista
            </Button>
            <Button
              as="a"
              href="/recipes/new"
              variant="primary"
              size="sm"
              disabled={limit.reached}
            >
              Nuova ricetta
            </Button>
          </div>
        </section>

        <div className="grid gap-(--spacing-5) xl:grid-cols-[minmax(0,1fr)_20rem]">
          <Stack gap="4">
            <details className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3) xl:hidden">
              <summary className="cursor-pointer text-(length:--text-sm) font-(--font-weight-semibold)">
                Filtri ricette
              </summary>
              <form action="/recipes" className="mt-(--spacing-4)">
                <RecipeFilters filters={filters} />
              </form>
            </details>

            {recipes.length === 0 ? (
              <EmptyState
                title="Nessuna ricetta trovata"
                description="Regola i filtri o crea una nuova preparazione per alimentare menu, spesa e piani di lavoro."
                action={
                  <Button as="a" href="/recipes/new" variant="primary" size="md">
                    Crea ricetta
                  </Button>
                }
              />
            ) : view === "list" ? (
              <div className="grid gap-(--spacing-3)">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} compact />
                ))}
              </div>
            ) : (
              <div className="grid gap-(--spacing-4) md:grid-cols-2 2xl:grid-cols-3">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </Stack>

          <aside className="hidden xl:block xl:sticky xl:top-(--spacing-5) xl:self-start">
            <Card variant="panel" padding="lg">
              <CardBody>
                <Stack gap="4">
                  <div>
                    <Text as="h2" size="lg" weight="semibold">
                      Filtri
                    </Text>
                    <Text size="sm" tone="muted">
                      Riduci la lista senza perdere contesto.
                    </Text>
                  </div>
                  <form action="/recipes">
                    <RecipeFilters filters={filters} />
                  </form>
                </Stack>
              </CardBody>
            </Card>
          </aside>
        </div>
      </Stack>
    </WorkspacePage>
  );
}

export function NewRecipeView() {
  return (
    <WorkspacePage
      title="Nuova ricetta"
      description="Crea una preparazione con ingredienti verificati, allergeni automatici e valori nutrizionali calcolati."
    >
      <WorkspaceBreadcrumb
        items={[
          { label: "Ricette", href: "/recipes" },
          { label: "Nuova ricetta" },
        ]}
      />
      <RecipeEditorForm mode="create" />
    </WorkspacePage>
  );
}

export async function RecipeDetailView({
  user,
  recipeId,
}: {
  user: RecipesViewUser;
  recipeId: string;
}) {
  const recipe = await getRecipeDetail(user.id, recipeId);
  if (!recipe) notFound();

  return (
    <WorkspacePage title={recipe.title} description={recipe.description ?? undefined}>
      <WorkspaceBreadcrumb
        items={[
          { label: "Ricette", href: "/recipes" },
          { label: recipe.title },
        ]}
      />

      <Stack gap="5">
        <section className="grid gap-(--spacing-4) overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-sm) lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch">
          <div className="grid gap-(--spacing-4) p-(--spacing-4)">
            <div className="flex flex-wrap items-center gap-(--spacing-2)">
              <Badge tone={statusTone(recipe)}>{statusLabel(recipe)}</Badge>
              <Badge tone="primary">{getRecipeCategoryLabel(recipe.category)}</Badge>
              <Badge tone="neutral">{recipe.servings} porzioni</Badge>
              {recipe.prepTime ? <Badge tone="neutral">{recipe.prepTime} min prep</Badge> : null}
              {recipe.cookTime ? <Badge tone="neutral">{recipe.cookTime} min cottura</Badge> : null}
            </div>
            <RecipeDetailActions
              recipeId={recipe.id}
              title={recipe.title}
              isPublic={recipe.isPublic}
              canEdit={recipe.canEdit}
              canPublish={recipe.canPublish}
            />
          </div>
          {recipe.imageUrl ? (
            <div className="min-h-48 bg-(--color-surface-muted) lg:min-h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={recipe.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </section>

        <div className="grid gap-(--spacing-4) xl:grid-cols-[minmax(0,1fr)_22rem]">
          <Card variant="panel" padding="lg">
            <CardBody>
              <Stack gap="4">
                <Text as="h2" size="xl" weight="semibold">
                  Procedura
                </Text>
                <Text size="sm" tone="muted" leading="relaxed" className="whitespace-pre-line">
                  {recipe.instructions ?? "Nessuna istruzione inserita."}
                </Text>
              </Stack>
            </CardBody>
          </Card>

          <Stack gap="4">
            <Card variant="panel" padding="lg">
              <CardBody>
                <Stack gap="4">
                  <Text as="h2" size="lg" weight="semibold">
                    Totali stimati
                  </Text>
                  <NutritionSummaryRows nutrition={recipe.nutrition} />
                </Stack>
              </CardBody>
            </Card>

            <Card variant="panel" padding="lg">
              <CardBody>
                <Stack gap="4">
                  <Text as="h2" size="lg" weight="semibold">
                    Ingredienti
                  </Text>
                  <div className="grid gap-(--spacing-2)">
                    {recipe.ingredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="grid gap-(--spacing-2) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface-muted) p-(--spacing-3)"
                      >
                        <div className="flex items-center justify-between gap-(--spacing-3)">
                          <Text size="sm" weight="medium">
                            {ingredient.name}
                          </Text>
                          <Text size="xs" tone="muted">
                            {ingredient.quantity} {ingredient.unit}
                          </Text>
                        </div>
                        <NutritionSummaryRows nutrition={ingredient.nutrition} />
                        <div className="flex flex-wrap gap-(--spacing-1)">
                          <Badge
                            size="sm"
                            tone={ingredient.verificationStatus === "PENDING_REVIEW" ? "warning" : "success"}
                          >
                            {ingredient.verificationStatus === "PENDING_REVIEW" ? "in revisione" : "verificato"}
                          </Badge>
                          {ingredient.allergens.length === 0 ? (
                            <Badge size="sm" tone="neutral">
                              nessun allergene noto
                            </Badge>
                          ) : (
                            ingredient.allergens.map((allergen) => (
                              <Badge key={allergen} size="sm" tone="warning">
                                {allergen}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </div>
      </Stack>
    </WorkspacePage>
  );
}

export async function EditRecipeView({
  user,
  recipeId,
}: {
  user: RecipesViewUser;
  recipeId: string;
}) {
  const recipe = await getRecipeDetail(user.id, recipeId);
  if (!recipe || !recipe.canEdit) notFound();

  return (
    <WorkspacePage
      title={`Modifica ${recipe.title}`}
      description="Aggiorna ingredienti verificati, categoria, procedura e pubblicazione."
    >
      <WorkspaceBreadcrumb
        items={[
          { label: "Ricette", href: "/recipes" },
          { label: recipe.title, href: `/recipes/${recipe.id}` },
          { label: "Modifica" },
        ]}
      />
      <RecipeEditorForm mode="edit" initialRecipe={recipe} />
    </WorkspacePage>
  );
}
