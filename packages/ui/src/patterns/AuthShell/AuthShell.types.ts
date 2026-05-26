import type * as React from "react";

export interface AuthShellSteps {
  current: number;
  total: number;
  labels?: readonly React.ReactNode[];
}

export interface AuthShellProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  logo?: React.ReactNode;
  steps?: AuthShellSteps;
  backAction?: React.ReactNode;
  variant?: "card" | "split" | "split-open";
  aside?: React.ReactNode;
}
