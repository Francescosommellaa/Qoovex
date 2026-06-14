import type { ComponentPropsWithRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export type SurfaceElevation = "flat" | "raised" | "floating";
export type SurfacePurpose = "navigation" | "focus" | "overlay" | "feature";
export type SurfaceTone = "light" | "inverse";

export type SurfaceStyleProps =
  | {
      material?: "paper";
      elevation?: SurfaceElevation;
      purpose?: never;
      tone?: never;
    }
  | {
      material: "crystal";
      purpose: SurfacePurpose;
      tone?: SurfaceTone;
      elevation?: never;
    }
  | {
      material: "inverse";
      elevation?: Exclude<SurfaceElevation, "floating">;
      purpose?: never;
      tone?: never;
    };

export type SurfaceProps = ComponentPropsWithRef<"div"> & SurfaceStyleProps;

export function getSurfaceAttributes(props: SurfaceStyleProps) {
  const material = props.material ?? "paper";

  return {
    "data-elevation":
      material === "crystal" ? undefined : (props.elevation ?? "flat"),
    "data-material": material,
    "data-purpose": material === "crystal" ? props.purpose : undefined,
    "data-tone": material === "crystal" ? (props.tone ?? "light") : undefined,
  } as const;
}

export function Surface({ className, ...props }: SurfaceProps) {
  const attributes = getSurfaceAttributes(props);
  const htmlProps = { ...props };
  delete htmlProps.elevation;
  delete htmlProps.material;
  delete htmlProps.purpose;
  delete htmlProps.tone;

  return (
    <div
      className={mergeClassNames("qv-surface", className)}
      {...attributes}
      {...htmlProps}
    />
  );
}
