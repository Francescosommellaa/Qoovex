import * as React from "react";
import { cn } from "../../lib/utils";
import type { GrainTextureProps } from "./GrainTexture.types";

export function GrainTexture({
  tone = "primary",
  shape = "top-ellipse",
  intensity = "soft",
  grain = "fine",
  className,
  ...props
}: GrainTextureProps) {
  return (
    <span
      aria-hidden="true"
      {...props}
      className={cn(
        "qv-grain-texture",
        `qv-grain-texture--tone-${tone}`,
        `qv-grain-texture--shape-${shape}`,
        `qv-grain-texture--intensity-${intensity}`,
        `qv-grain-texture--grain-${grain}`,
        className,
      )}
    />
  );
}
