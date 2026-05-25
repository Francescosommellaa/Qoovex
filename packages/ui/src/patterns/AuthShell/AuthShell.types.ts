import type * as React from "react";

export interface AuthShellProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  logo?: React.ReactNode;
  steps?: { current: number; total: number };
  backAction?: React.ReactNode;
  variant?: "card" | "split";
  aside?: React.ReactNode;
}
