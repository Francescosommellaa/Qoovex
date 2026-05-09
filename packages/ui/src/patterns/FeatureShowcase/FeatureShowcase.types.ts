import type * as React from "react";
import type { QvTone } from "../../../config/variants";

export interface FeatureShowcaseItem {
  title: React.ReactNode;
  body: React.ReactNode;
  tone?: QvTone;
  label?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface FeatureShowcaseProps extends React.HTMLAttributes<HTMLDivElement> {
  items: FeatureShowcaseItem[];
}

