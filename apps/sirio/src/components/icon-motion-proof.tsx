"use client";

import * as React from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@qoovex/ui/components/button";
import {
  resolveMotionTransition,
  type MotionTransition,
} from "@qoovex/ui/lib/motion";

const MotionChevron = motion.create(IconChevronDown);

const phases = ["rest", "interaction", "transition", "settled"] as const;
type IconMotionPhase = (typeof phases)[number];

export function IconMotionProof() {
  const [open, setOpen] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const [phase, setPhase] = React.useState<IconMotionPhase>("rest");
  const [transition, setTransition] = React.useState<MotionTransition>({ duration: 0 });
  const [mounted, setMounted] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = mounted && Boolean(prefersReducedMotion);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    setTransition(
      resolveMotionTransition(
        getComputedStyle(document.documentElement),
        "state",
        "standard",
        reducedMotion,
      ),
    );
  }, [reducedMotion]);

  const settleWithoutActivation = React.useCallback(() => {
    setPressed(false);
    setPhase("settled");
  }, []);

  const toggle = React.useCallback(() => {
    setOpen((current) => !current);
    setPhase(reducedMotion ? "settled" : "transition");
  }, [reducedMotion]);

  return (
    <div
      className="grid gap-5 rounded-xl border bg-card p-5 sm:grid-cols-[minmax(0,1fr)_minmax(15rem,0.8fr)]"
      data-icon-motion-proof
      data-icon-motion-phase={phase}
      data-icon-motion-state={open ? "open" : "closed"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <div className="flex min-w-0 flex-col items-start gap-3">
        <Button
          aria-controls="icon-motion-details"
          aria-expanded={open}
          data-icon-motion-trigger
          onClick={toggle}
          onPointerCancel={settleWithoutActivation}
          onPointerDown={() => {
            setPressed(true);
            setPhase("interaction");
          }}
          onPointerLeave={() => {
            if (pressed) settleWithoutActivation();
          }}
          onPointerUp={() => setPressed(false)}
          type="button"
          variant="outline"
        >
          Dettagli del contratto
          <span
            aria-hidden="true"
            className="grid size-4 shrink-0 place-items-center"
            data-icon-motion-glyph
          >
            {reducedMotion ? (
              open ? (
                <IconChevronUp className="qv-icon-default" />
              ) : (
                <IconChevronDown className="qv-icon-default" />
              )
            ) : (
              <MotionChevron
                animate={{ rotate: open ? 180 : 0 }}
                className="qv-icon-default"
                initial={false}
                onAnimationComplete={() => setPhase("settled")}
                transition={transition}
              />
            )}
          </span>
        </Button>

        <div
          className="min-h-14 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground"
          id="icon-motion-details"
        >
          {open
            ? "Aperto: orientamento e testo confermano lo stesso stato reale."
            : "Chiuso: input rapido può invertire il target senza accodare animazioni."}
        </div>
      </div>

      <div className="grid content-start gap-3 text-xs">
        <div className="flex flex-wrap gap-1.5" aria-label="Fasi del lifecycle icona">
          {phases.map((item) => (
            <span
              aria-current={phase === item ? "step" : undefined}
              className="rounded-full border px-2 py-1 font-medium aria-current:border-foreground aria-current:bg-foreground aria-current:text-background"
              data-icon-motion-step={item}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
          <dt>Stato</dt>
          <dd className="font-medium text-foreground">{open ? "open" : "closed"}</dd>
          <dt>Press</dt>
          <dd className="font-medium text-foreground">{pressed ? "attivo" : "rilasciato"}</dd>
          <dt>Reduced</dt>
          <dd className="font-medium text-foreground">
            {reducedMotion ? "replacement istantaneo" : "rotazione state-driven"}
          </dd>
        </dl>
      </div>
    </div>
  );
}
