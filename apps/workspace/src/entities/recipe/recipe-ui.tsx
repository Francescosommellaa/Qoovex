import type * as React from "react";
import { Clock, ForkKnife, ImageSquare, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { Badge, Card, CardBody, Text, cn } from "@qoovex/ui";
import {
  NUTRITION_DISPLAY_ROWS,
  formatGdaRange,
  formatNutritionRange,
  getRecipeCategoryLabel,
} from "@shared/lib/ingredient-normalization";
import type {
  NutritionRangesDto,
  RecipeCategory,
  RecipeStatus,
  RecipeSummaryDto,
} from "@shared/lib/workspace-types";

export function getRecipeStatusTone(recipe: Pick<RecipeSummaryDto, "status" | "isPublic">) {
  if (recipe.status === "PENDING_REVIEW") return "warning";
  if (recipe.status === "PUBLISHED" || recipe.isPublic) return "success";
  if (recipe.status === "ARCHIVED") return "neutral";
  return "primary";
}

export function getRecipeStatusLabel(recipe: Pick<RecipeSummaryDto, "status" | "isPublic">) {
  if (recipe.status === "PENDING_REVIEW") return "In revisione";
  if (recipe.status === "PUBLISHED" || recipe.isPublic) return "Pubblica";
  if (recipe.status === "ARCHIVED") return "Archiviata";
  if (recipe.status === "DRAFT") return "Bozza";
  return "Pronta";
}

export function RecipeStatusBadge({
  status,
  isPublic,
  size = "sm",
}: {
  status: RecipeStatus;
  isPublic: boolean;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Badge size={size} tone={getRecipeStatusTone({ status, isPublic })}>
      {getRecipeStatusLabel({ status, isPublic })}
    </Badge>
  );
}

export function RecipeImage({
  src,
  title,
  size = "card",
  className,
}: {
  src: string | null;
  title: string;
  size?: "card" | "list" | "detail";
  className?: string;
}) {
  const frameClass =
    size === "list"
      ? "size-14 sm:size-16"
      : size === "detail"
        ? "min-h-64 lg:min-h-full"
        : "aspect-[4/3]";

  return (
    <div
      className={cn(
        frameClass,
        "overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface-offset)",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-qoovex)] hover:scale-[1.025]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-(--color-text-faint)">
          <ImageSquare size={size === "list" ? 18 : 32} aria-label={`Immagine ${title}`} />
        </div>
      )}
    </div>
  );
}

export function RecipeAllergenChips({
  allergens,
  max = 4,
  emptyLabel = "Nessun allergene noto",
  compact = false,
}: {
  allergens: string[];
  max?: number;
  emptyLabel?: string;
  compact?: boolean;
}) {
  const visible = allergens.slice(0, max);
  const overflow = allergens.length - visible.length;

  return (
    <div className="flex flex-wrap gap-(--spacing-1)">
      {visible.length > 0 ? (
        visible.map((allergen) => (
          <Badge key={allergen} size="sm" tone="neutral" variant="outline">
            {allergen}
          </Badge>
        ))
      ) : (
        <Badge size="sm" tone="neutral" variant="outline">
          {emptyLabel}
        </Badge>
      )}
      {overflow > 0 ? (
        <Badge size="sm" tone="neutral" variant="outline">
          +{overflow}
        </Badge>
      ) : null}
      {!compact && allergens.length > 0 ? (
        <span className="sr-only">Allergeni: {allergens.join(", ")}</span>
      ) : null}
    </div>
  );
}

export function RecipeMetric({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-(--radius-md) border border-(--color-divider) bg-(--color-surface-offset) px-(--spacing-3) py-(--spacing-2)">
      <div className="flex items-center gap-(--spacing-1) text-(--color-text-faint)">
        {icon}
        <Text size="xs" tone="faint" className="truncate">
          {label}
        </Text>
      </div>
      <Text size="sm" weight="semibold" className="mt-(--spacing-1) truncate">
        {value}
      </Text>
    </div>
  );
}

export function RecipeCompactMeta({ recipe }: { recipe: RecipeSummaryDto }) {
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <div className="grid grid-cols-2 gap-(--spacing-2)">
      <RecipeMetric
        icon={<ForkKnife size={13} aria-hidden />}
        label="Ingredienti"
        value={`${recipe.ingredientsCount}`}
      />
      <RecipeMetric
        icon={<Clock size={13} aria-hidden />}
        label="Tempo"
        value={totalTime > 0 ? `${totalTime} min` : "-"}
      />
      <RecipeMetric label="Porzioni" value={`${recipe.servings}`} />
      <RecipeMetric label="Energia" value={formatNutritionRange(recipe.nutrition.calories)} />
    </div>
  );
}

export function RecipeCategoryBadge({ category }: { category: RecipeCategory }) {
  return (
    <Badge size="sm" tone="primary" variant="outline">
      {getRecipeCategoryLabel(category)}
    </Badge>
  );
}

export function NutritionRows({
  nutrition,
  compact = false,
}: {
  nutrition: NutritionRangesDto;
  compact?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface)">
      {NUTRITION_DISPLAY_ROWS.map((row) => (
        <div
          key={row.key}
          className={cn(
            "grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-(--spacing-3) border-b border-(--color-divider) px-(--spacing-3) py-(--spacing-2) last:border-b-0",
            row.indented && "pl-(--spacing-5)",
          )}
        >
          <Text size="xs" tone="muted">
            {row.label}
          </Text>
          <Text size={compact ? "xs" : "sm"} weight={row.indented ? "medium" : "semibold"} className="text-right">
            {formatNutritionRange(nutrition[row.key])}
          </Text>
        </div>
      ))}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-(--spacing-3) bg-(--color-surface-offset) px-(--spacing-3) py-(--spacing-2)">
        <Text size="xs" tone="muted">
          GDA
        </Text>
        <Text size={compact ? "xs" : "sm"} weight="semibold" className="text-right">
          {formatGdaRange(nutrition.calories)}
        </Text>
      </div>
    </div>
  );
}

export function NutritionInsightCard({
  title,
  description,
  nutrition,
  warnings = [],
}: {
  title: string;
  description?: string;
  nutrition: NutritionRangesDto;
  warnings?: string[];
}) {
  return (
    <Card variant="panel" padding="lg">
      <CardBody>
        <div className="grid gap-(--spacing-4)">
          <div>
            <Text as="h2" size="lg" weight="semibold">
              {title}
            </Text>
            {description ? (
              <Text size="sm" tone="muted" className="mt-(--spacing-1)">
                {description}
              </Text>
            ) : null}
          </div>
          <NutritionRows nutrition={nutrition} />
          {warnings.length > 0 ? (
            <div className="grid gap-(--spacing-2) rounded-(--radius-lg) border border-(--color-warning)/30 bg-(--color-warning-highlight) p-(--spacing-3)">
              {warnings.map((warning) => (
                <div key={warning} className="flex items-start gap-(--spacing-2)">
                  <WarningCircle size={16} className="mt-0.5 shrink-0 text-(--color-warning)" aria-hidden />
                  <Text size="xs" tone="muted" leading="relaxed">
                    {warning}
                  </Text>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
