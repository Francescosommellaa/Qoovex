"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GitFork } from "@phosphor-icons/react";
import { Button, useToast } from "@qoovex/ui";
import { forkRecipeAction } from "@shared/actions/recipe-actions";

export function ForkRecipeButton({ recipeId }: { recipeId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);

  async function handleFork() {
    setSaving(true);
    const result = await forkRecipeAction(recipeId);
    setSaving(false);

    if (!result.ok || !result.data) {
      toast({
        variant: "error",
        title: "Ricetta non copiata",
        description: result.message,
      });
      return;
    }

    toast({
      variant: "success",
      title: "Ricetta copiata",
      description: result.message,
    });
    router.push(`/recipes/${result.data.id}`);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      iconLeft={<GitFork size={14} />}
      loading={saving}
      loadingLabel="Copia..."
      onClick={handleFork}
    >
      Copia
    </Button>
  );
}
