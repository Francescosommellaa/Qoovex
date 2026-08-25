"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@qoovex/ui/components/button";
import {
  resolveMotionTransition,
  type MotionTransition,
} from "@qoovex/ui/lib/motion";

const phases = [
  "rest",
  "interaction",
  "leaving-base",
  "transition",
  "settled",
  "return",
] as const;

type SurfaceMotionPhase = (typeof phases)[number];

export function SurfaceElevationProof() {
  const [open, setOpen] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const [phase, setPhase] = React.useState<SurfaceMotionPhase>("rest");
  const [transition, setTransition] = React.useState<MotionTransition>({ duration: 0 });
  const [mounted, setMounted] = React.useState(false);
  const openRef = React.useRef(open);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = mounted && Boolean(prefersReducedMotion);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    openRef.current = open;
  }, [open]);

  React.useEffect(() => {
    setTransition(
      resolveMotionTransition(
        getComputedStyle(document.documentElement),
        "surface",
        "emphasized",
        reducedMotion,
      ),
    );
  }, [reducedMotion]);

  const settleWithoutActivation = React.useCallback(() => {
    setPressed(false);
    setPhase(openRef.current ? "settled" : "rest");
  }, []);

  const toggle = React.useCallback(() => {
    setOpen((current) => {
      const next = !current;
      openRef.current = next;
      setPhase(reducedMotion ? (next ? "settled" : "rest") : next ? "leaving-base" : "return");
      return next;
    });
  }, [reducedMotion]);

  const hiddenPose = reducedMotion
    ? { opacity: 0, scale: 1, y: 0 }
    : { opacity: 0, scale: 0.98, y: 12 };

  return (
    <div
      className="grid gap-5 lg:grid-cols-[minmax(15rem,0.65fr)_minmax(0,1.35fr)]"
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-surface-motion-phase={phase}
      data-surface-motion-proof
      data-surface-motion-state={open ? "open" : "closed"}
    >
      <div className="flex min-w-0 flex-col items-start gap-4">
        <Button
          aria-controls="surface-motion-stage"
          aria-expanded={open}
          data-surface-motion-trigger
          onClick={toggle}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") setPhase("interaction");
          }}
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
          <span className="inline-grid items-center justify-items-center">
            <span
              aria-hidden={open}
              className={open ? "invisible col-start-1 row-start-1" : "col-start-1 row-start-1"}
            >
              Apri il piano flottante
            </span>
            <span
              aria-hidden={!open}
              className={open ? "col-start-1 row-start-1" : "invisible col-start-1 row-start-1"}
            >
              Riporta al piano base
            </span>
          </span>
        </Button>

        <div className="flex flex-wrap gap-1.5" aria-label="Fasi del lifecycle surface">
          {phases.map((item) => (
            <span
              aria-current={phase === item ? "step" : undefined}
              className="rounded-full border px-2 py-1 text-xs font-medium aria-current:border-foreground aria-current:bg-foreground aria-current:text-background"
              data-surface-motion-step={item}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <dt>Stato reale</dt>
          <dd className="font-medium text-foreground">{open ? "floating" : "contained"}</dd>
          <dt>Press</dt>
          <dd className="font-medium text-foreground">{pressed ? "attivo" : "rilasciato"}</dd>
          <dt>Reduced motion</dt>
          <dd className="font-medium text-foreground">
            {reducedMotion ? "gerarchia istantanea" : "continuità spaziale"}
          </dd>
        </dl>
      </div>

      <div
        className="qv-surface-contained relative isolate min-h-72 overflow-hidden rounded-xl p-5"
        id="surface-motion-stage"
      >
        <div className="grid h-full place-items-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Il piano di lavoro resta fermo e mantiene la propria geometria.
        </div>

        <AnimatePresence
          initial={false}
          onExitComplete={() => {
            if (!openRef.current) setPhase("rest");
          }}
        >
          {open ? (
            <React.Fragment key="floating-layer">
              <motion.div
                animate={{ opacity: 1 }}
                className="qv-backdrop-modal absolute inset-0"
                data-surface-motion-backdrop
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={transition}
              />
              <motion.div
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="qv-surface-floating absolute inset-x-6 top-1/2 rounded-xl p-5"
                data-surface-motion-layer
                exit={hiddenPose}
                initial={hiddenPose}
                onAnimationComplete={() => {
                  setPhase(openRef.current ? "settled" : "rest");
                }}
                onAnimationStart={() => {
                  if (!reducedMotion) setPhase(openRef.current ? "transition" : "return");
                }}
                style={{ translateY: "-50%" }}
                transition={transition}
              >
                <p className="font-medium">Piano flottante</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tono, bordo e shadow comunicano lo stato finale; Motion orienta soltanto il
                  cambio di piano.
                </p>
              </motion.div>
            </React.Fragment>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
