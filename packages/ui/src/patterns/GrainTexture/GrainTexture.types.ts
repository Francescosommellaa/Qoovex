import type * as React from "react";

export type GrainTextureTone = "primary" | "neutral";
export type GrainTextureShape = "top-ellipse" | "center-ellipse" | "full";
export type GrainTextureIntensity = "soft" | "medium";
export type GrainTextureGrain = "fine" | "medium" | "none";

export interface GrainTextureProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  tone?: GrainTextureTone;
  shape?: GrainTextureShape;
  intensity?: GrainTextureIntensity;
  grain?: GrainTextureGrain;
}
