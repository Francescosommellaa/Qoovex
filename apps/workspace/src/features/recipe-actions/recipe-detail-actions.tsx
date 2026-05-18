"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Archive, ShareNetwork, UploadSimple } from "@phosphor-icons/react";
import { Button, useToast } from "@qoovex/ui";
import {
  archiveRecipeAction,
  setRecipePublicationAction,
} from "@shared/actions/recipe-actions";

export function RecipeDetailActions({
  recipeId,
  title,
  isPublic,
  canEdit,
  canPublish,
}: {
  recipeId: string;
  title: string;
  isPublic: boolean;
  canEdit: boolean;
  canPublish: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingAction, setPendingAction] = React.useState<"publish" | "archive" | null>(null);

  async function updatePublication() {
    setPendingAction("publish");
    const result = await setRecipePublicationAction(recipeId, !isPublic);
    setPendingAction(null);

    if (!result.ok) {
      toast({ variant: "error", title: "Azione non completata", description: result.message });
      return;
    }

    toast({ variant: "success", title: isPublic ? "Ricetta ritirata" : "Ricetta pubblicata", description: result.message });
    router.refresh();
  }

  async function archiveRecipe() {
    setPendingAction("archive");
    const result = await archiveRecipeAction(recipeId);
    setPendingAction(null);

    if (!result.ok) {
      toast({ variant: "error", title: "Ricetta non archiviata", description: result.message });
      return;
    }

    toast({ variant: "success", title: "Ricetta archiviata", description: result.message });
    router.push("/recipes");
    router.refresh();
  }

  async function shareRecipe() {
    const url = `${window.location.origin}/recipes/${recipeId}`;
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    toast({ variant: "success", title: "Link copiato", description: "Puoi incollarlo dove vuoi condividere la ricetta." });
  }

  if (!canEdit) {
    return (
      <Button type="button" variant="secondary" size="sm" iconLeft={<ShareNetwork size={14} />} onClick={shareRecipe}>
        Condividi
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-(--spacing-2)">
      <Button as="a" href={`/recipes/${recipeId}/edit`} variant="primary" size="sm">
        Modifica
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        iconLeft={<UploadSimple size={14} />}
        disabled={!canPublish && !isPublic}
        loading={pendingAction === "publish"}
        loadingLabel="Aggiorno"
        onClick={updatePublication}
      >
        {isPublic ? "Ritira da Esplora" : "Pubblica"}
      </Button>
      <Button type="button" variant="secondary" size="sm" iconLeft={<ShareNetwork size={14} />} onClick={shareRecipe}>
        Condividi
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        iconLeft={<Archive size={14} />}
        loading={pendingAction === "archive"}
        loadingLabel="Archivio"
        onClick={archiveRecipe}
      >
        Archivia
      </Button>
    </div>
  );
}
