import { notFound } from "next/navigation";
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
import { RecipeEditorForm } from "@features/recipe-editor";
import type { WorkspacePlan } from "@shared/lib/workspace-types";
import { WorkspacePage } from "@shared/ui";
import {
  getRecipeDetail,
  getRecipesIndex,
} from "@shared/server/recipe-service";

interface RecipesViewUser {
  id: string;
  plan: WorkspacePlan;
}

function formatLimit(used: number, value: number | null) {
  return value === null ? `${used} / illimitato` : `${used} / ${value}`;
}

export async function RecipesIndexView({
  user,
  query,
}: {
  user: RecipesViewUser;
  query?: string;
}) {
  const { recipes, limit } = await getRecipesIndex(user.id, user.plan, query);

  return (
    <WorkspacePage
      title="Ricette"
      description="Archivio operativo delle preparazioni, con allergeni e valori nutrizionali collegati agli ingredienti."
    >
      <Stack gap="6">
        <div className="flex flex-col gap-(--spacing-3) lg:flex-row lg:items-end lg:justify-between">
          <form className="min-w-0 flex-1" action="/recipes">
            <Input
              name="q"
              label="Cerca ricette"
              placeholder="Cerca per titolo o descrizione"
              defaultValue={query ?? ""}
            />
          </form>
          <div className="flex items-center gap-(--spacing-3)">
            <Badge tone={limit.reached ? "warning" : "primary"}>
              {formatLimit(limit.used, limit.value)}
            </Badge>
            <Button
              as="a"
              href="/recipes/new"
              variant="primary"
              size="md"
              disabled={limit.reached}
            >
              Nuova ricetta
            </Button>
          </div>
        </div>

        {recipes.length === 0 ? (
          <EmptyState
            title="Nessuna ricetta trovata"
            description="Crea la prima preparazione per alimentare menu, spesa e piani di lavoro."
            action={
              <Button as="a" href="/recipes/new" variant="primary" size="md">
                Crea ricetta
              </Button>
            }
          />
        ) : (
          <div className="grid gap-(--spacing-4) md:grid-cols-2 xl:grid-cols-3">
            {recipes.map((recipe) => (
              <Card key={recipe.id} variant="panel" padding="md">
                <CardBody>
                  <Stack gap="4">
                    <div className="flex items-start justify-between gap-(--spacing-3)">
                      <div className="min-w-0">
                        <Text as="h2" size="lg" weight="semibold" className="truncate">
                          {recipe.title}
                        </Text>
                        {recipe.description ? (
                          <Text size="sm" tone="muted" leading="relaxed">
                            {recipe.description}
                          </Text>
                        ) : null}
                      </div>
                      <Badge tone={recipe.isPublic ? "success" : "neutral"}>
                        {recipe.isPublic ? "Pubblica" : "Privata"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-(--spacing-2)">
                      <Badge size="sm" tone="neutral">
                        {recipe.servings} porzioni
                      </Badge>
                      <Badge size="sm" tone="neutral">
                        {recipe.ingredientsCount} ingredienti
                      </Badge>
                      {recipe.allergens.slice(0, 3).map((allergen) => (
                        <Badge key={allergen} size="sm" tone="warning">
                          {allergen}
                        </Badge>
                      ))}
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
            ))}
          </div>
        )}
      </Stack>
    </WorkspacePage>
  );
}

export function NewRecipeView() {
  return (
    <WorkspacePage
      title="Nuova ricetta"
      description="Crea una preparazione completa di ingredienti, allergeni e valori nutrizionali."
    >
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
      <Stack gap="6">
        <div className="flex flex-wrap items-center gap-(--spacing-2)">
          <Badge tone={recipe.isPublic ? "success" : "neutral"}>
            {recipe.isPublic ? "Pubblica" : "Privata"}
          </Badge>
          <Badge tone="primary">{recipe.servings} porzioni</Badge>
          {recipe.prepTime ? <Badge tone="neutral">{recipe.prepTime} min prep</Badge> : null}
          {recipe.cookTime ? <Badge tone="neutral">{recipe.cookTime} min cottura</Badge> : null}
          {recipe.canEdit ? (
            <Button as="a" href={`/recipes/${recipe.id}/edit`} variant="secondary" size="sm">
              Modifica
            </Button>
          ) : null}
        </div>

        <div className="grid gap-(--spacing-4) lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card variant="panel" padding="lg">
            <CardBody>
              <Stack gap="4">
                <Text as="h2" size="lg" weight="semibold">
                  Procedura
                </Text>
                <Text size="sm" tone="muted" leading="relaxed" className="whitespace-pre-line">
                  {recipe.instructions ?? "Nessuna istruzione inserita."}
                </Text>
              </Stack>
            </CardBody>
          </Card>

          <Card variant="panel" padding="lg">
            <CardBody>
              <Stack gap="4">
                <Text as="h2" size="lg" weight="semibold">
                  Nutrizione
                </Text>
                <div className="grid gap-(--spacing-2)">
                  {recipe.ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="grid gap-(--spacing-2) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3)"
                    >
                      <div className="flex items-center justify-between gap-(--spacing-3)">
                        <Text size="sm" weight="medium">
                          {ingredient.name}
                        </Text>
                        <Text size="xs" tone="muted">
                          {ingredient.quantity} {ingredient.unit}
                        </Text>
                      </div>
                      <div className="flex flex-wrap gap-(--spacing-1)">
                        {ingredient.allergens.length === 0 ? (
                          <Badge size="sm" tone="success">
                            nessun allergene
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
      description="Aggiorna ingredienti, allergeni, valori nutrizionali e visibilita."
    >
      <RecipeEditorForm mode="edit" initialRecipe={recipe} />
    </WorkspacePage>
  );
}
