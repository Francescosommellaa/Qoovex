"use client";

import { useEffect, useState } from "react";
import { IconArrowRight, IconGitBranch } from "@tabler/icons-react";
import Link from "next/link";
import type { OperationalArtifactType, OperationalProcessPage, OperationalProcessSummary } from "@qoovex/types";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Skeleton } from "@qoovex/ui/components/skeleton";
import { cn } from "@qoovex/ui/lib/utils";

export function OperationalArtifactStatus({ artifactType, artifactId }: { artifactType: OperationalArtifactType; artifactId: string }) {
  const [process, setProcess] = useState<OperationalProcessSummary | null | undefined>(undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/operations/processes?artifactType=${artifactType}&artifactId=${encodeURIComponent(artifactId)}&take=1`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error("unavailable"); return await response.json() as OperationalProcessPage; })
      .then((result) => setProcess(result.items[0] ?? null))
      .catch((cause) => { if ((cause as Error).name !== "AbortError") setError(true); });
    return () => controller.abort();
  }, [artifactId, artifactType]);

  if (error) return <Alert variant="warning"><IconGitBranch /><AlertTitle>Stato operativo non disponibile</AlertTitle><AlertDescription>Riprova aggiornando la pagina.</AlertDescription></Alert>;
  if (process === undefined) return <Skeleton aria-label="Caricamento stato operativo" className="h-24 w-full" />;
  if (process === null) return <Card size="sm"><CardHeader><CardTitle><h2>Stato operativo</h2></CardTitle><CardDescription>Nessuna lavorazione persistente collegata a questo elemento.</CardDescription></CardHeader></Card>;

  return <Card size="sm"><CardHeader className="border-b"><CardTitle><h2>Stato operativo</h2></CardTitle><CardDescription>Ultimo processo collegato e prossimo punto di controllo.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{process.title}</p><Badge variant={process.status === "TECHNICAL_FAILURE" ? "destructive" : process.status.includes("COMPLETED") ? "success" : process.status === "BLOCKED" || process.status === "WAITING_FOR_DECISION" ? "warning" : "info"}>{process.status.replace(/_/g, " ")}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{process.openDecisionCount} decisioni · {process.openExceptionCount} eccezioni</p></div><Link className={cn(buttonVariants({ size: "sm", variant: "outline" }), "min-h-10 sm:min-h-8")} href={process.href}>Apri processo<IconArrowRight /></Link></CardContent></Card>;
}
