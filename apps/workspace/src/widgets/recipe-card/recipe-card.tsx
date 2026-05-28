import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button, Card, CardBody, CardFooter, CardMedia, Text } from "@qoovex/ui";
import {
  RecipeAllergenChips,
  RecipeCategoryBadge,
  RecipeCompactMeta,
  RecipeImage,
  RecipeStatusBadge,
} from "@entities/recipe";
import { formatNutritionRange, getRecipeCategoryLabel } from "@shared/lib/ingredient-normalization";
import type { RecipeSummaryDto } from "@shared/lib/workspace-types";

export function RecipeCard({ recipe }: { recipe: RecipeSummaryDto }) {
  return (
    <Card variant="panel" padding="none" className="h-full">
      <CardMedia ratio="wide">
        <RecipeImage src={recipe.imageUrl} title={recipe.title} className="h-full rounded-none border-0" />
      </CardMedia>
      <CardBody padding="md">
        <div className="grid gap-(--spacing-4)">
          <div className="flex items-start justify-between gap-(--spacing-3)">
            <div className="min-w-0">
              <Text as="h2" size="lg" weight="semibold" className="truncate">
                {recipe.title}
              </Text>
              <Text size="xs" tone="muted" className="mt-(--spacing-1)">
                {getRecipeCategoryLabel(recipe.category)}
              </Text>
            </div>
            <RecipeStatusBadge status={recipe.status} isPublic={recipe.isPublic} />
          </div>

          {recipe.description ? (
            <Text size="sm" tone="muted" leading="relaxed" className="line-clamp-2 min-h-10">
              {recipe.description}
            </Text>
          ) : null}

          <RecipeCompactMeta recipe={recipe} />
          <RecipeAllergenChips allergens={recipe.allergens} max={3} compact />
        </div>
      </CardBody>
      <CardFooter padding="md" className="border-t border-(--color-divider)">
        <Button as="a" href={`/recipes/${recipe.id}`} variant="secondary" size="sm" iconRight={<ArrowRight size={14} />}>
          Apri
        </Button>
      </CardFooter>
    </Card>
  );
}

export function RecipeListItem({ recipe }: { recipe: RecipeSummaryDto }) {
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <Card variant="quiet" padding="none" overflow="visible" className="border-b border-(--color-divider) last:border-b-0">
      <CardBody noPadding>
        <div className="grid gap-(--spacing-3) px-(--spacing-3) py-(--spacing-3) sm:grid-cols-[auto_minmax(0,1.15fr)_7rem_7rem_minmax(8rem,0.8fr)_auto] sm:items-center">
          <RecipeImage src={recipe.imageUrl} title={recipe.title} size="list" />
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-(--spacing-2)">
              <Text as="h2" size="sm" weight="semibold" className="truncate">
                {recipe.title}
              </Text>
              <RecipeStatusBadge status={recipe.status} isPublic={recipe.isPublic} />
            </div>
            <div className="mt-(--spacing-1) flex flex-wrap items-center gap-(--spacing-2)">
              <RecipeCategoryBadge category={recipe.category} />
              <Text size="xs" tone="faint">
                {recipe.ingredientsCount} ingredienti
              </Text>
            </div>
          </div>
          <ListMetric label="Tempo" value={totalTime > 0 ? `${totalTime} min` : "-"} />
          <ListMetric label="Kcal" value={formatNutritionRange(recipe.nutrition.calories)} />
          <RecipeAllergenChips allergens={recipe.allergens} max={2} compact />
          <Button as="a" href={`/recipes/${recipe.id}`} variant="ghost" size="sm" className="justify-self-start sm:justify-self-end">
            Apri
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function ListMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <Text size="xs" tone="faint">
        {label}
      </Text>
      <Text size="xs" weight="semibold" className="truncate">
        {value}
      </Text>
    </div>
  );
}

export function RecipeListHeader() {
  return (
    <div className="hidden grid-cols-[auto_minmax(0,1.15fr)_7rem_7rem_minmax(8rem,0.8fr)_auto] gap-(--spacing-3) border-b border-(--color-divider) px-(--spacing-3) py-(--spacing-2) sm:grid">
      <span />
      {["Ricetta", "Tempo", "Kcal", "Allergeni", ""].map((label) => (
        <Text key={label || "actions"} size="xs" tone="faint" weight="medium">
          {label}
        </Text>
      ))}
    </div>
  );
}
