"use client";

import { IconChevronDown } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@qoovex/ui/components/collapsible";

export type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y rounded-2xl border bg-card">
      {items.map((item) => (
        <Collapsible key={item.question} className="group px-4 sm:px-5">
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
            <span className="text-pretty">{item.question}</span>
            <IconChevronDown
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden text-sm leading-relaxed text-muted-foreground transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
            <p className="pb-4 text-pretty">{item.answer}</p>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
