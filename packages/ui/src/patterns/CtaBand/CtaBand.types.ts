import type * as React from "react";
import type { HeroAction } from "../HeroSection";

export interface CtaBandProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  description: React.ReactNode;
  actions?: HeroAction[];
}
