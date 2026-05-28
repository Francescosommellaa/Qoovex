import { CheckCircle, ClockCounterClockwise, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { Badge, Text } from "@qoovex/ui";
import type { IngredientVerificationStatus } from "@shared/lib/workspace-types";

export function getIngredientVerificationTone(status?: IngredientVerificationStatus) {
  if (status === "PENDING_REVIEW") return "warning";
  if (status === "REJECTED") return "error";
  if (status === "VERIFIED" || status === "SUGGESTED") return "success";
  return "neutral";
}

export function getIngredientVerificationLabel(status?: IngredientVerificationStatus) {
  if (status === "PENDING_REVIEW") return "In revisione";
  if (status === "REJECTED") return "Rifiutato";
  if (status === "SUGGESTED") return "Suggerito";
  if (status === "VERIFIED") return "Verificato";
  return "Da verificare";
}

export function IngredientVerificationBadge({
  status,
  size = "sm",
}: {
  status?: IngredientVerificationStatus;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Badge size={size} tone={getIngredientVerificationTone(status)} variant="outline">
      {getIngredientVerificationLabel(status)}
    </Badge>
  );
}

export function IngredientVerificationNote({
  status,
  pendingCount,
}: {
  status?: IngredientVerificationStatus;
  pendingCount?: number;
}) {
  const isPending = status === "PENDING_REVIEW" || (pendingCount ?? 0) > 0;
  const Icon = isPending ? WarningCircle : status === "VERIFIED" || status === "SUGGESTED" ? CheckCircle : ClockCounterClockwise;

  return (
    <div className="flex items-start gap-(--spacing-2)">
      <Icon
        size={18}
        className={isPending ? "mt-0.5 text-(--color-warning)" : "mt-0.5 text-(--color-success)"}
        aria-hidden
      />
      <div>
        <Text size="sm" weight="semibold">
          {isPending ? "Bozza non pubblicabile" : "Pronta per Esplora"}
        </Text>
        <Text size="xs" tone="muted" leading="relaxed">
          {isPending
            ? `${pendingCount ?? 1} ingredienti richiedono revisione prima della pubblicazione.`
            : "Gli ingredienti hanno dati di catalogo o suggerimenti verificabili."}
        </Text>
      </div>
    </div>
  );
}
