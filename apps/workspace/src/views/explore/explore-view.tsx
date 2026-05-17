import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  PageSection,
  Stack,
  Text,
} from "@qoovex/ui";
import { ForkRecipeButton } from "@features/explore";
import type { WorkspacePlan } from "@shared/lib/workspace-types";
import { getPublicMenus } from "@shared/server/menu-service";
import { getPublicRecipes } from "@shared/server/recipe-service";

interface ExploreViewUser {
  id: string;
  plan: WorkspacePlan;
}

export async function ExploreView({
  user,
  query,
}: {
  user: ExploreViewUser;
  query?: string;
}) {
  const [recipes, menus] = await Promise.all([
    getPublicRecipes(user.id, query),
    getPublicMenus(user.id, query),
  ]);

  const hasResults = recipes.length > 0 || menus.length > 0;

  return (
    <PageSection
      title="Esplora"
      description="Ricette e menu pubblici della community Qoovex. In V1 puoi copiare le ricette nel tuo workspace."
    >
      <Stack gap="6">
        <form action="/explore">
          <Input
            name="q"
            label="Cerca"
            placeholder="Cerca ricette e menu pubblici"
            defaultValue={query ?? ""}
          />
        </form>

        {!hasResults ? (
          <EmptyState
            title="Nessun risultato"
            description="Quando ricette o menu saranno pubblici, appariranno qui."
          />
        ) : null}

        {recipes.length > 0 ? (
          <Stack gap="4">
            <Text as="h2" size="lg" weight="semibold">
              Ricette pubbliche
            </Text>
            <div className="grid gap-(--spacing-4) md:grid-cols-2 xl:grid-cols-3">
              {recipes.map((recipe) => (
                <Card key={recipe.id} variant="panel" padding="md">
                  <CardBody>
                    <Stack gap="4">
                      <div className="min-w-0">
                        <Text as="h3" size="lg" weight="semibold" className="truncate">
                          {recipe.title}
                        </Text>
                        <Text size="xs" tone="muted">
                          di {recipe.authorName}
                        </Text>
                      </div>
                      {recipe.description ? (
                        <Text size="sm" tone="muted" leading="relaxed">
                          {recipe.description}
                        </Text>
                      ) : null}
                      <div className="flex flex-wrap gap-(--spacing-2)">
                        <Badge size="sm" tone="primary">
                          {recipe.servings} porzioni
                        </Badge>
                        {recipe.allergens.slice(0, 3).map((allergen) => (
                          <Badge key={allergen} size="sm" tone="warning">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-(--spacing-2)">
                        <Button
                          as="a"
                          href={`/recipes/${recipe.id}`}
                          variant="ghost"
                          size="sm"
                        >
                          Apri
                        </Button>
                        {recipe.canEdit ? null : (
                          <ForkRecipeButton recipeId={recipe.id} />
                        )}
                      </div>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Stack>
        ) : null}

        {menus.length > 0 ? (
          <Stack gap="4">
            <Text as="h2" size="lg" weight="semibold">
              Menu pubblici
            </Text>
            <div className="grid gap-(--spacing-4) md:grid-cols-2 xl:grid-cols-3">
              {menus.map((menu) => (
                <Card key={menu.id} variant="panel" padding="md">
                  <CardBody>
                    <Stack gap="4">
                      <div className="min-w-0">
                        <Text as="h3" size="lg" weight="semibold" className="truncate">
                          {menu.title}
                        </Text>
                        <Text size="xs" tone="muted">
                          di {menu.authorName}
                        </Text>
                      </div>
                      {menu.description ? (
                        <Text size="sm" tone="muted" leading="relaxed">
                          {menu.description}
                        </Text>
                      ) : null}
                      <Badge size="sm" tone="primary">
                        {menu.itemsCount} ricette
                      </Badge>
                      <Button
                        as="a"
                        href={`/menus/${menu.id}`}
                        variant="secondary"
                        size="sm"
                        className="self-start"
                      >
                        Consulta
                      </Button>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Stack>
        ) : null}
      </Stack>
    </PageSection>
  );
}
