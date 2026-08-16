"use client";

import * as React from "react";
import { IconChevronDown } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@qoovex/ui/components/collapsible";
import { Card } from "@qoovex/ui/components/card";

export type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openFaq, setOpenFaq] = React.useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openFaq === item.question;
        return (
          <Collapsible
            key={item.question}
            open={isOpen}
            onOpenChange={() => toggleFaq(item.question)}
            className="w-full"
          >
            <Card
              className={`border transition-all duration-300 ${
                isOpen
                  ? "border-primary/50 bg-card/80 shadow-sm backdrop-blur-md"
                  : "border-border/70 bg-card/40 hover:border-foreground/20 hover:bg-card/60 backdrop-blur-xs"
              }`}
            >
              <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between p-4 text-left outline-none select-none group focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-lg">
                <span className="text-sm font-semibold font-accent tracking-tight text-foreground text-pretty">
                  {item.question}
                </span>

                <div
                  aria-hidden="true"
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full border border-border/40 bg-background/50 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? "rotate-180 text-foreground bg-accent" : "group-hover:text-foreground"
                  }`}
                >
                  <IconChevronDown className="size-4" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[ending-style]:h-0 data-[starting-style]:h-0">
                <div className="border-t border-border/40 px-4 pt-3 pb-4">
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                    {item.answer}
                  </p>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
