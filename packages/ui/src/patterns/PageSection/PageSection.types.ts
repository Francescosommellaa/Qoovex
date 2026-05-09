import type * as React from "react";
import type { QvSpacing } from "../../../config/variants";

export interface PageSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  width?: "content" | "wide" | "full";
  spacing?: QvSpacing;
}
