import { notFound } from "next/navigation";
import { CaretDown, Funnel } from "@phosphor-icons/react/dist/ssr";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Modal,
  ModalBody,
  Select,
  Stack,
  Text,
} from "@qoovex/ui";
import {
  NutritionInsightCard,
  NutritionRows,
  RecipeAllergenChips,
  RecipeCategoryBadge,
  RecipeImage,
  RecipeStatusBadge,
} from "@entities/recipe";
import { RecipeDetailActions } from "@features/recipe-actions";
import { RecipeEditorForm } from "@features/recipe-editor";
import { IngredientVerificationBadge } from "@entities/ingredient";
import {
  RECIPE_CATEGORY_OPTIONS,
  getRecipeCategoryLabel,
} from "@shared/lib/ingredient-normalization";
import type {
  RecipeFiltersDto,
  WorkspacePlan,
} from "@shared/lib/workspace-types";
import { WorkspaceBreadcrumb, WorkspacePage } from "@shared/ui";
import {
  getRecipeDetail,
  getRecipesIndex,
} from "@shared/server/recipe-service";
import { RecipeCard, RecipeListHeader, RecipeListItem } from "@widgets/recipe-card";
import { RecipeKcalRangeFilter } from "./recipe-kcal-range-filter";
import { RecipeViewModeToggle } from "./recipe-view-mode-toggle";

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

const VERIFICATION_OPTIONS = [
  { value: "all", label: "Tutti" },
  { value: "verified", label: "Verificati" },
  { value: "pending", label: "Da rivedere" },
];

const ALLERGEN_MODE_OPTIONS = [
  { value: "contains", label: "Contiene" },
  { value: "without", label: "Esclude" },
];

function formatLimit(used: number, value: number | null) {
  return value === null ? `${used} / illimitato` : `${used} / ${value}`;
}

function getActiveFilterCount(filters: RecipeFiltersDto) {
  return [
    filters.query,
    filters.category && filters.category !== "all" ? filters.category : "",
    filters.visibility && filters.visibility !== "all" ? filters.visibility : "",
    filters.validity && filters.validity !== "all" ? filters.validity : "",
    filters.verification && filters.verification !== "all" ? filters.verification : "",
    filters.allergen,
    typeof filters.kcalMin === "number" ? filters.kcalMin.toString() : "",
    typeof filters.kcalMax === "number" ? filters.kcalMax.toString() : "",
  ].filter(Boolean).length;
}

function RecipeFilters({
  filters,
  layout,
}: {
  filters: RecipeFiltersDto;
  layout: "mobile" | "desktop";
}) {
  const isMobile = layout === "mobile";

  return (
    <div className={isMobile ? "grid gap-(--spacing-4)" : "grid gap-(--spacing-5)"}>
      <input type="hidden" name="view" value={filters.view ?? "cards"} />
      <Input
        name="q"
        label="Cerca"
        placeholder="Titolo o descrizione"
        defaultValue={filters.query ?? ""}
      />
      <div className={isMobile ? "grid gap-(--spacing-3) sm:grid-cols-2" : "grid gap-(--spacing-3)"}>
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
          label="Stato ricetta"
          options={VALIDITY_OPTIONS}
          defaultValue={filters.validity ?? "all"}
        />
        <FilterSelect
          name="verification"
          label="Ingredienti"
          options={VERIFICATION_OPTIONS}
          defaultValue={filters.verification ?? "all"}
        />
        <FilterSelect
          name="sort"
          label="Ordine"
          options={SORT_OPTIONS}
          defaultValue={filters.sort ?? "updated-desc"}
        />
      </div>
      <div className={isMobile ? "grid gap-(--spacing-3) sm:grid-cols-[minmax(0,1fr)_11rem]" : "grid gap-(--spacing-3)"}>
        <Input
          name="allergen"
          label="Allergene"
          placeholder="glutine"
          defaultValue={filters.allergen ?? ""}
        />
        <FilterSelect
          name="allergenMode"
          label="Modalita allergene"
          options={ALLERGEN_MODE_OPTIONS}
          defaultValue={filters.allergenMode ?? "contains"}
        />
      </div>
      <RecipeKcalRangeFilter minValue={filters.kcalMin} maxValue={filters.kcalMax} />
      <div className="grid grid-cols-2 gap-(--spacing-2)">
        <Button type="submit" variant="primary" size="sm">
          {isMobile ? "Mostra risultati" : "Applica"}
        </Button>
        <Button as="a" href="/recipes" variant="secondary" size="sm">
          Pulisci
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
    <Select
      name={name}
      label={label}
      options={options}
      defaultValue={defaultValue}
    />
  );
}

function ActiveFilters({ filters }: { filters: RecipeFiltersDto }) {
  const chips: string[] = [];
  if (filters.query) chips.push(`"${filters.query}"`);
  if (filters.category && filters.category !== "all") chips.push(getRecipeCategoryLabel(filters.category));
  if (filters.visibility && filters.visibility !== "all") chips.push(filters.visibility === "public" ? "Pubbliche" : "Private");
  if (filters.validity && filters.validity !== "all") chips.push(VALIDITY_OPTIONS.find((item) => item.value === filters.validity)?.label ?? filters.validity);
  if (filters.verification && filters.verification !== "all") chips.push(VERIFICATION_OPTIONS.find((item) => item.value === filters.verification)?.label ?? filters.verification);
  if (filters.allergen) chips.push(`${filters.allergenMode === "without" ? "Senza" : "Con"} ${filters.allergen}`);
  if (typeof filters.kcalMin === "number" || typeof filters.kcalMax === "number") {
    chips.push(`${filters.kcalMin ?? 0}-${filters.kcalMax ?? "max"} kcal`);
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-(--spacing-1)">
      {chips.map((chip) => (
        <Badge key={chip} size="sm" tone="neutral" variant="outline">
          {chip}
        </Badge>
      ))}
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
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <WorkspacePage
      title="RICETTE"
      description="Catalogo operativo con ingredienti verificati, allergeni automatici e pubblicazione su Esplora."
    >
      <Stack gap="5">
        <Card variant="panel" padding="md" overflow="visible">
          <CardBody>
            <div className="grid gap-(--spacing-4) lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <Text as="h2" size="xl" weight="semibold" className="uppercase">
                  Archivio ricette
                </Text>
                <Text size="sm" tone="muted" className="mt-(--spacing-1)">
                  {recipes.length} risultati visibili. Piano: {formatLimit(limit.used, limit.value)}.
                </Text>
              </div>
              <div className="flex flex-wrap items-center gap-(--spacing-2)">
                <RecipeViewModeToggle view={view} />
                <Modal
                  title="Filtri ricette"
                  description="Riduci la lista mantenendo visibili i criteri attivi."
                  placement="bottom"
                  size="md"
                  trigger={
                    <Button type="button" variant="secondary" size="sm" className="xl:hidden" iconLeft={<Funnel size={14} />}>
                      Filtri {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
                    </Button>
                  }
                >
                  <ModalBody>
                    <form action="/recipes">
                      <RecipeFilters filters={filters} layout="mobile" />
                    </form>
                  </ModalBody>
                </Modal>
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
            </div>
            {activeFilterCount > 0 ? (
              <div className="qv-motion-fade-up mt-(--spacing-4) flex flex-wrap items-center justify-between gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-divider) bg-(--color-surface-offset) p-(--spacing-3)">
                <ActiveFilters filters={filters} />
                <Button as="a" href="/recipes" variant="secondary" size="xs">
                  Reset filtri
                </Button>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <div className="grid gap-(--spacing-5) xl:grid-cols-[minmax(0,1fr)_20rem]">
          <Stack gap="4">
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
              <Card variant="panel" padding="none" overflow="visible">
                <RecipeListHeader />
                {recipes.map((recipe) => (
                  <RecipeListItem key={recipe.id} recipe={recipe} />
                ))}
              </Card>
            ) : (
              <div className="grid gap-(--spacing-4) md:grid-cols-2 2xl:grid-cols-3">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </Stack>

          <aside className="hidden xl:block xl:sticky xl:top-(--spacing-5) xl:self-start">
            <Card variant="panel" padding="none" overflow="visible">
              <details className="group/recipe-filters">
                <summary className="qv-motion-interactive flex cursor-pointer list-none items-center justify-between gap-(--spacing-3) px-(--spacing-4) py-(--spacing-4) transition-[border-color,background-color] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] group-open/recipe-filters:border-b group-open/recipe-filters:border-(--color-divider)">
                  <span className="flex min-w-0 items-center gap-(--spacing-3)">
                    <span className="grid size-9 shrink-0 place-items-center rounded-(--radius-full) border border-(--color-border) bg-(--color-surface-offset) text-(--color-text-muted)">
                      <Funnel size={15} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <Text as="span" size="lg" weight="semibold" className="block uppercase">
                        Filtri
                      </Text>
                      <Text as="span" size="xs" tone="muted" className="block truncate">
                        {activeFilterCount > 0
                          ? `${activeFilterCount} criteri attivi`
                          : "Clicca per aprire"}
                      </Text>
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-(--spacing-2)">
                    <Badge size="sm" tone={activeFilterCount > 0 ? "primary" : "neutral"} variant="outline">
                      {activeFilterCount}
                    </Badge>
                    <CaretDown size={14} className="text-(--color-text-muted) transition-transform duration-[var(--duration-base)] ease-[var(--ease-qoovex)] group-open/recipe-filters:rotate-180" aria-hidden />
                  </span>
                </summary>
                <CardBody padding="md" className="qv-motion-fade-up">
                  <form action="/recipes">
                    <RecipeFilters filters={filters} layout="desktop" />
                  </form>
                </CardBody>
              </details>
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
      title="NUOVA RICETTA"
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
        <section className="grid gap-(--spacing-4) overflow-hidden rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-sm) lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-stretch">
          <div className="grid content-between gap-(--spacing-6) p-(--spacing-5)">
            <div className="grid gap-(--spacing-3)">
              <div className="flex flex-wrap items-center gap-(--spacing-2)">
                <RecipeStatusBadge status={recipe.status} isPublic={recipe.isPublic} size="md" />
                <RecipeCategoryBadge category={recipe.category} />
                <Badge tone="neutral" variant="outline">{recipe.servings} porzioni</Badge>
                {recipe.prepTime ? <Badge tone="neutral" variant="outline">{recipe.prepTime} min prep</Badge> : null}
                {recipe.cookTime ? <Badge tone="neutral" variant="outline">{recipe.cookTime} min cottura</Badge> : null}
              </div>
              <RecipeAllergenChips allergens={recipe.allergens} max={6} />
            </div>
            <RecipeDetailActions
              recipeId={recipe.id}
              title={recipe.title}
              isPublic={recipe.isPublic}
              canEdit={recipe.canEdit}
              canPublish={recipe.canPublish}
            />
          </div>
          <RecipeImage src={recipe.imageUrl} title={recipe.title} size="detail" className="rounded-none border-0" />
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
            <NutritionInsightCard
              title="Totali stimati"
              description="Calcolati dagli ingredienti e normalizzati per quantita."
              nutrition={recipe.nutrition}
            />

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
                        <NutritionRows nutrition={ingredient.nutrition} compact />
                        <div className="flex flex-wrap items-center gap-(--spacing-1)">
                          <IngredientVerificationBadge status={ingredient.verificationStatus} />
                          <RecipeAllergenChips allergens={ingredient.allergens} max={4} compact />
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
      title={`MODIFICA ${recipe.title}`}
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
