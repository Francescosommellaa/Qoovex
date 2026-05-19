import type { ReactNode } from "react";

export type WorkspacePlan = "FREE" | "START" | "PRO" | "ENTERPRISE";

export interface WorkspaceUserSummary {
  name: string | null;
  username: string | null;
  email: string;
  imageUrl?: string | null;
  plan: WorkspacePlan;
  isAdmin: boolean;
}

export interface WorkspaceShellProps {
  children: ReactNode;
  user: WorkspaceUserSummary;
  nowIso: string;
}
