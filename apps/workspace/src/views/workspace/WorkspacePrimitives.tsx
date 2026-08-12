import type { ReactNode } from "react";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconLock,
  IconMoodEmpty,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import type { ProductStatePresentation } from "@shared/lib/product-state-presentation";

export function WorkspacePage({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>;
}

export function WorkspacePageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p></div>{action}</header>;
}

export function WorkspacePanel({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return <Card>{title ? <CardHeader><CardTitle>{title}</CardTitle>{description ? <CardDescription>{description}</CardDescription> : null}</CardHeader> : null}<CardContent>{children}</CardContent></Card>;
}

export function WorkspaceEmptyState({ title, description }: { title: string; description: string }) {
  return <Empty><EmptyHeader><EmptyMedia variant="icon"><IconMoodEmpty /></EmptyMedia><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader></Empty>;
}

export function WorkspaceAccessState({ title = "Area non disponibile", description = "Questa sezione non è disponibile per il ruolo corrente." }) {
  return <WorkspacePage><Alert variant="warning"><IconLock /><AlertTitle>{title}</AlertTitle><AlertDescription>{description}</AlertDescription></Alert></WorkspacePage>;
}

export function WorkspaceState({ state }: { state: ProductStatePresentation }) {
  const variant = state.tone === "danger" ? "destructive" : state.tone === "good" ? "success" : state.tone === "neutral" ? "outline" : state.tone;
  const StateIcon = state.tone === "danger"
    ? IconAlertCircle
    : state.tone === "warning"
      ? IconAlertTriangle
      : state.tone === "info"
        ? IconInfoCircle
        : state.tone === "good"
          ? IconCircleCheck
          : null;
  return (
    <Badge title={state.description} variant={variant}>
      {StateIcon ? <StateIcon aria-hidden="true" data-slot="workspace-state-icon" /> : null}
      {state.label}
    </Badge>
  );
}
