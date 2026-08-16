"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "@qoovex/ui/components/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@qoovex/ui/components/collapsible";
import { IconChevronDown } from "@tabler/icons-react";

const FOCUSABLE_CONTROL_SELECTOR = [
  "input:not([type='hidden']):not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function JobSiteFormDisclosure({
  children,
  description,
  triggerLabel,
}: {
  children: ReactNode;
  description: string;
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const descriptionId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      contentRef.current?.querySelector<HTMLElement>(FOCUSABLE_CONTROL_SELECTOR)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function closeForm() {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return <Collapsible onOpenChange={setOpen} open={open}>
    <div className="space-y-2">
      <CollapsibleTrigger
        aria-describedby={descriptionId}
        render={<Button className="w-full justify-between" ref={triggerRef} type="button" variant="outline" />}
      >
        <span>{open ? "Chiudi modulo" : triggerLabel}</span>
        <IconChevronDown aria-hidden="true" className={open ? "size-4 rotate-180" : "size-4"} />
      </CollapsibleTrigger>
      <p className="text-sm text-muted-foreground" id={descriptionId}>{description}</p>
    </div>
    <CollapsibleContent className="transition-none" keepMounted ref={contentRef}>
      <div className="space-y-3 pt-4">
        {children}
        <Button onClick={closeForm} type="button" variant="ghost">Chiudi modulo</Button>
      </div>
    </CollapsibleContent>
  </Collapsible>;
}
