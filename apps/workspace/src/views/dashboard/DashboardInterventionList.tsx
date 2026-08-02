"use client";

import { useEffect, useRef, useState } from "react";
import { IconAlertTriangle, IconArrowRight, IconClock } from "@tabler/icons-react";
import type { DashboardIntervention } from "@qoovex/types";
import Link from "next/link";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { WorkQueueItem, WorkQueueItemActions, WorkQueueItemContent } from "@qoovex/ui/components/work-queue-item";
import { cn } from "@qoovex/ui/lib/utils";

const INITIAL_INTERVENTION_COUNT = 5;

const kindLabels: Record<DashboardIntervention["kind"], string> = {
  DECISION: "Scelta richiesta",
  EXCEPTION: "Dato mancante",
  SHARING: "Review richiesta",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function DashboardInterventionList({ items }: { items: DashboardIntervention[] }) {
  const [expanded, setExpanded] = useState(false);
  const firstRevealedItem = useRef<HTMLElement>(null);
  const visibleItems = expanded ? items : items.slice(0, INITIAL_INTERVENTION_COUNT);
  const remaining = Math.max(0, items.length - INITIAL_INTERVENTION_COUNT);

  useEffect(() => {
    if (expanded) firstRevealedItem.current?.focus();
  }, [expanded]);

  return (
    <div className="grid gap-3">
      <div className="grid gap-3" id="dashboard-interventions">
        {visibleItems.map((item, index) => (
          <WorkQueueItem
            className="scroll-mt-20 shadow-none"
            key={`${item.kind}:${item.id}`}
            priority={item.overdue ? "blocking" : item.blocking || item.severity ? "attention" : "default"}
            ref={index === INITIAL_INTERVENTION_COUNT ? firstRevealedItem : undefined}
            tabIndex={index === INITIAL_INTERVENTION_COUNT ? -1 : undefined}
          >
            <WorkQueueItemContent>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <IconAlertTriangle aria-hidden="true" className="size-3.5" />
                  {kindLabels[item.kind]}
                </span>
                {item.overdue ? <span>Scaduto</span> : item.blocking ? <span>Processo in attesa</span> : null}
              </div>
              <h3 className="pt-1 text-base font-medium tracking-tight">{item.title}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
                {item.context ? item.context.href ? (
                  <Link className="break-words" data-link="quiet" href={item.context.href}>
                    {item.context.label ?? item.context.type.replace(/_/g, " ")}
                  </Link>
                ) : <span>{item.context.label ?? item.context.type.replace(/_/g, " ")}</span> : null}
                {item.dueAt ? <time className="inline-flex items-center gap-1" dateTime={item.dueAt}><IconClock aria-hidden="true" className="size-3.5" />{formatDate(item.dueAt)}</time> : null}
              </div>
              <div className="grid gap-3 pt-3 sm:grid-cols-2">
                <div className="border-l-2 border-success/50 pl-3">
                  <p className="text-xs font-semibold text-muted-foreground">Fatto da Qoovex</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-5">{item.handledSummary}</p>
                </div>
                <div className="border-l-2 border-warning/60 pl-3">
                  <p className="text-xs font-semibold text-muted-foreground">Serve da te</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-5">{item.missingSummary}</p>
                </div>
              </div>
            </WorkQueueItemContent>
            <WorkQueueItemActions>
              <Link className={cn(buttonVariants({ size: "sm" }), "min-h-10 whitespace-normal text-center sm:min-h-8")} href={item.primaryAction.href}>
                {item.primaryAction.label}
                <IconArrowRight aria-hidden="true" />
              </Link>
            </WorkQueueItemActions>
          </WorkQueueItem>
        ))}
      </div>
      {remaining > 0 ? (
        <Button
          aria-controls="dashboard-interventions"
          aria-expanded={expanded}
          className="w-fit min-h-10 sm:min-h-8"
          onClick={() => setExpanded((current) => !current)}
          type="button"
          variant="ghost"
        >
          {expanded ? "Mostra meno" : `Mostra altri ${remaining}`}
        </Button>
      ) : null}
    </div>
  );
}
