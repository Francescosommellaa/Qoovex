"use client";

import Link from "next/link";
import { IconArrowRight, IconBuildingCommunity, IconKey, IconUserPlus, IconUsers } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@qoovex/ui/components/dialog";
import { cn } from "@qoovex/ui/lib/utils";
import { WorkspacePage, WorkspacePageHeader } from "@/views/workspace/WorkspacePrimitives";
import type { WorkspaceCapabilities } from "@/views/workspace/workspace-records";

interface PeopleOverview {
  generatedAt: string;
  cards: {
    workers: { total: number; attention: number };
    access: { pending: number; attention: number };
    assignments: { attention: number };
  };
}

function AreaCard({ href, icon: Icon, title, description, metric, attention }: { href: string; icon: typeof IconUsers; title: string; description: string; metric: string; attention: number }) {
  return (
    <Card className="group h-full transition-colors hover:border-primary/30" size="sm">
      <CardHeader>
        <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/50"><Icon aria-hidden="true" className="size-5" /></div>
        <CardTitle><h2>{title}</h2></CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction><Badge variant={attention ? "warning" : "outline"}>{attention ? `${attention} da verificare` : "In ordine"}</Badge></CardAction>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4">
        <p className="text-sm font-medium text-foreground">{metric}</p>
        <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }))} data-link="plain" href={href}>Apri <IconArrowRight aria-hidden="true" /></Link>
      </CardContent>
    </Card>
  );
}

export function PeopleOverviewView({ capabilities, overview }: { capabilities: WorkspaceCapabilities; overview: PeopleOverview }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Persone"
        description="Profili operativi, accessi a Qoovex e assegnazioni ai cantieri restano distinti, ma si gestiscono da un unico punto."
        action={capabilities.canCreateWorkers || capabilities.canManageMembers ? (
          <Dialog>
            <DialogTrigger render={<Button className="h-10 w-full sm:h-8 sm:w-auto" type="button" />}><IconUserPlus aria-hidden="true" />Aggiungi persona</DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Cosa vuoi fare?</DialogTitle>
                <DialogDescription>Scegli il percorso in base alla persona che devi registrare.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                {capabilities.canCreateWorkers ? (
                  <Link className="rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40" data-link="plain" href="/workers?intent=create">
                    <IconUsers aria-hidden="true" className="size-5" />
                    <strong className="mt-3 block">Aggiungi un lavoratore</strong>
                    <span className="mt-1 block text-sm text-muted-foreground">Crea il profilo, scegli accesso e cantieri.</span>
                  </Link>
                ) : null}
                {capabilities.canManageMembers ? (
                  <Link className="rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40" data-link="plain" href="/people/access/invite">
                    <IconKey aria-hidden="true" className="size-5" />
                    <strong className="mt-3 block">Invita una persona in Qoovex</strong>
                    <span className="mt-1 block text-sm text-muted-foreground">Invita Collaboratori e configura permessi, ambito e scadenza.</span>
                  </Link>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        ) : undefined}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <AreaCard href="/workers" icon={IconUsers} title="Lavoratori" description="Profili, documenti, scadenze e stato operativo." metric={`${overview.cards.workers.total} profili attivi`} attention={overview.cards.workers.attention} />
        <AreaCard href="/people/access" icon={IconKey} title="Accessi" description="Account, ruoli, inviti e configurazioni incomplete." metric={overview.cards.access.pending === 1 ? "1 invito in attesa" : `${overview.cards.access.pending} inviti in attesa`} attention={overview.cards.access.attention} />
        <AreaCard href="/people/assignments" icon={IconBuildingCommunity} title="Assegnazioni" description="Collaboratori e lavoratori organizzati per cantiere." metric="Ambito operativo per cantiere" attention={overview.cards.assignments.attention} />
      </div>
    </WorkspacePage>
  );
}
