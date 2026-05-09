import type * as React from "react";

export interface HeroAction {
  label: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}

export interface HeroProofItem {
  value: React.ReactNode;
  label: React.ReactNode;
}

export interface HeroSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  actions?: HeroAction[];
  visual?: React.ReactNode;
  proof?: React.ReactNode | HeroProofItem[];
}
