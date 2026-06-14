import type { ComponentPropsWithRef } from "react";

import {
  getSurfaceAttributes,
  type SurfaceStyleProps,
} from "./surface";
import { mergeClassNames } from "./merge-class-names";

export type CardProps = ComponentPropsWithRef<"article"> & SurfaceStyleProps;

export function Card({ className, ...props }: CardProps) {
  const attributes = getSurfaceAttributes(props);
  const htmlProps = { ...props };
  delete htmlProps.elevation;
  delete htmlProps.material;
  delete htmlProps.purpose;
  delete htmlProps.tone;

  return (
    <article
      className={mergeClassNames("qv-surface", "qv-card", className)}
      {...attributes}
      {...htmlProps}
    />
  );
}
