"use client";

import * as React from "react";

import { Button } from "@qoovex/ui/components/button";
import { Switch } from "@qoovex/ui/components/switch";
import { PREFERS_REDUCED_MOTION_QUERY } from "@qoovex/ui/lib/motion";

import styles from "./motion-foundation-lab.module.css";

type MotionMode = "system" | "normal" | "reduced";
type MotionPhase = "rest" | "interaction" | "transition" | "settled";

const previewModes = [
  ["system", "Sistema"],
  ["normal", "Normale"],
  ["reduced", "Ridotto"],
] as const satisfies ReadonlyArray<readonly [MotionMode, string]>;

const phaseSteps = [
  ["rest", "Rest", "Stato stabile"],
  ["interaction", "Interaction", "Input ricevuto"],
  ["transition", "Transition", "Retarget in corso"],
  ["settled", "Settled", "Target allineato"],
] as const satisfies ReadonlyArray<readonly [MotionPhase, string, string]>;

export function MotionFoundationLab() {
  const [active, setActive] = React.useState(false);
  const [phase, setPhase] = React.useState<MotionPhase>("rest");
  const [mode, setMode] = React.useState<MotionMode>("system");
  const [systemReduced, setSystemReduced] = React.useState(false);
  const [surfaceMounted, setSurfaceMounted] = React.useState(false);
  const [surfaceOpen, setSurfaceOpen] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [visitedPhases, setVisitedPhases] = React.useState<Set<MotionPhase>>(
    () => new Set(["rest"]),
  );

  const phaseFrameRef = React.useRef<number | null>(null);
  const rapidFrameRef = React.useRef<number | null>(null);
  const surfaceFrameRef = React.useRef<number | null>(null);
  const interactionTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectiveReduced =
    mode === "reduced" || (mode === "system" && systemReduced);

  React.useEffect(() => {
    const preference = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY);
    const updatePreference = () => setSystemReduced(preference.matches);

    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  React.useEffect(() => {
    if (surfaceFrameRef.current !== null) {
      cancelAnimationFrame(surfaceFrameRef.current);
    }

    if (active) {
      setSurfaceMounted(true);
      surfaceFrameRef.current = requestAnimationFrame(() => {
        surfaceFrameRef.current = requestAnimationFrame(() => {
          setSurfaceOpen(true);
        });
      });
    } else {
      setSurfaceOpen(false);
    }

    return () => {
      if (surfaceFrameRef.current !== null) {
        cancelAnimationFrame(surfaceFrameRef.current);
      }
    };
  }, [active]);

  React.useEffect(
    () => () => {
      for (const frame of [
        phaseFrameRef.current,
        rapidFrameRef.current,
        surfaceFrameRef.current,
      ]) {
        if (frame !== null) cancelAnimationFrame(frame);
      }
      if (interactionTimeoutRef.current !== null) clearTimeout(interactionTimeoutRef.current);
      if (settleTimeoutRef.current !== null) clearTimeout(settleTimeoutRef.current);
    },
    [],
  );

  const cancelPendingInput = React.useCallback(() => {
    if (phaseFrameRef.current !== null) cancelAnimationFrame(phaseFrameRef.current);
    if (rapidFrameRef.current !== null) cancelAnimationFrame(rapidFrameRef.current);
    if (interactionTimeoutRef.current !== null) clearTimeout(interactionTimeoutRef.current);
    if (settleTimeoutRef.current !== null) clearTimeout(settleTimeoutRef.current);
  }, []);

  /* Accumulate visited phases for smooth visual progression */
  React.useEffect(() => {
    setVisitedPhases((prev) => {
      if (prev.has(phase)) return prev;
      const next = new Set(prev);
      next.add(phase);
      return next;
    });
  }, [phase]);

  const markTransition = React.useCallback(() => {
    setVisitedPhases(new Set(["interaction"]));
    setPhase("interaction");
    if (interactionTimeoutRef.current !== null) clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      setPhase("transition");
    }, 100);
  }, []);

  const triggerSettle = React.useCallback(() => {
    setPhase("settled");
    if (settleTimeoutRef.current !== null) clearTimeout(settleTimeoutRef.current);
    settleTimeoutRef.current = setTimeout(() => {
      setPhase("rest");
    }, 600);
  }, []);

  const setRealState = React.useCallback(
    (nextActive: boolean) => {
      cancelPendingInput();
      markTransition();
      setActive(nextActive);
    },
    [cancelPendingInput, markTransition],
  );

  const invertState = React.useCallback(() => {
    cancelPendingInput();
    markTransition();
    setActive((current) => !current);
  }, [cancelPendingInput, markTransition]);

  const runRapidInput = React.useCallback(() => {
    cancelPendingInput();
    setVisitedPhases(new Set(["interaction"]));
    setPhase("interaction");
    let inputsRemaining = 3;

    const applyNextInput = () => {
      setActive((current) => !current);
      setPhase("transition");
      inputsRemaining -= 1;

      if (inputsRemaining > 0) {
        rapidFrameRef.current = requestAnimationFrame(applyNextInput);
      }
    };

    interactionTimeoutRef.current = setTimeout(() => {
      rapidFrameRef.current = requestAnimationFrame(applyNextInput);
    }, 100);
  }, [cancelPendingInput]);

  const reset = React.useCallback(() => {
    cancelPendingInput();
    if (surfaceFrameRef.current !== null) cancelAnimationFrame(surfaceFrameRef.current);
    setResetting(true);
    setActive(false);
    setSurfaceOpen(false);
    setSurfaceMounted(false);
    setPhase("rest");
    setVisitedPhases(new Set(["rest"]));
    phaseFrameRef.current = requestAnimationFrame(() => setResetting(false));
  }, [cancelPendingInput]);

  const settleFromState = (event: React.TransitionEvent<HTMLSpanElement>) => {
    if (event.currentTarget !== event.target) return;
    if (event.propertyName === "transform" || effectiveReduced) {
      triggerSettle();
    }
  };

  const settleFromSurface = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) return;
    const terminalProperty = effectiveReduced ? "opacity" : "transform";
    if (event.propertyName !== terminalProperty) return;

    if (!active) setSurfaceMounted(false);
    triggerSettle();
  };

  return (
    <div
      className={styles.lab}
      data-active={active}
      data-motion-lab
      data-motion-mode={mode}
      data-motion-phase={phase}
      data-resetting={resetting}
    >
      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.modeControl}>
          <span className="text-xs font-medium text-muted-foreground">Anteprima movimento</span>
          <div className={styles.segmented} role="group" aria-label="Anteprima movimento">
            {previewModes.map(([value, label]) => (
              <Button
                key={value}
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
                size="sm"
                type="button"
                variant={mode === value ? "secondary" : "ghost"}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className={styles.actions} aria-label="Controlli del laboratorio">
          <Button
            aria-pressed={active}
            onClick={invertState}
            size="sm"
            type="button"
            variant="default"
          >
            {active ? "Ferma" : "Avvia"}
          </Button>
          <Button onClick={runRapidInput} size="sm" type="button" variant="outline">
            Input rapido ×3
          </Button>
          <Button onClick={reset} size="sm" type="button" variant="ghost">
            Reset
          </Button>
        </div>
      </div>

      {/* ── Status Row & Phase Stepper ──────────────────── */}
      <div className={styles.statusRow} aria-live="polite">
        <div className={styles.statusInfo}>
          <span>
            Stato: <strong className="text-foreground font-medium">{active ? "attivo" : "inattivo"}</strong>
          </span>
          <span>
            Preferenza:{" "}
            <strong className="text-foreground font-medium">
              {systemReduced ? "ridotto" : "normale"}
            </strong>
          </span>
        </div>

        <ol className={styles.phasePills} aria-label="Fasi dell'interazione">
          {phaseSteps.map(([value, label, description]) => (
            <li
              key={value}
              aria-current={phase === value ? "step" : undefined}
              aria-label={`${label}: ${description}`}
              data-motion-phase-step={value}
              data-visited={visitedPhases.has(value) || undefined}
            >
              {label}
            </li>
          ))}
        </ol>
      </div>

      {/* ── 4 Semantic Roles Specimens ──────────────────── */}
      <div className={styles.specimenGrid}>
        {/* 1. Instant (100ms) */}
        <article className={styles.specimen} data-motion-demo="instant">
          <header className={styles.specimenHeader}>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Instant</h3>
              <span className="font-mono text-xs text-muted-foreground">100 ms · opacity</span>
            </div>
            <span className={styles.badgeLabel}>CSS</span>
          </header>
          <div className={styles.stage}>
            <div className={styles.instantSignal}>
              <span className={styles.instantDot} />
              <span>{active ? "Conferma immediata" : "In attesa"}</span>
            </div>
          </div>
          <p className={styles.caption}>
            Percezione istantanea senza transizione spaziale. Ideale per badge e tooltip.
          </p>
        </article>

        {/* 2. Feedback (160ms) */}
        <article className={styles.specimen} data-motion-demo="feedback">
          <header className={styles.specimenHeader}>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Feedback</h3>
              <span className="font-mono text-xs text-muted-foreground">160 ms · scale + colore</span>
            </div>
            <span className={styles.badgeLabel}>CSS</span>
          </header>
          <div className={styles.stage}>
            <button
              type="button"
              className={styles.feedbackSignal}
              onClick={invertState}
            >
              {active ? "Pressione registrata" : "Risposta tattile (click/hover)"}
            </button>
          </div>
          <p className={styles.caption}>
            Risposta locale alla pressione del cursore o del tocco. Hover attivo solo su pointer fine.
          </p>
        </article>

        {/* 3. State (200ms) */}
        <article className={styles.specimen} data-motion-demo="state">
          <header className={styles.specimenHeader}>
            <div>
              <h3 className="text-sm font-semibold text-foreground">State</h3>
              <span className="font-mono text-xs text-muted-foreground">200 ms · transform</span>
            </div>
            <span className={styles.badgeLabel}>CSS + Base UI</span>
          </header>
          <div className={styles.stage}>
            <div className={styles.stateContainer}>
              <button
                aria-label="Inverti"
                aria-pressed={active}
                className={styles.track}
                data-motion-track
                data-settled={phase === "settled"}
                onClick={invertState}
                type="button"
              >
                <span
                  className={styles.indicator}
                  data-motion-indicator
                  onTransitionEnd={settleFromState}
                />
              </button>
              <div className="flex items-center gap-2">
                <Switch
                  aria-label="Switch condiviso Motion"
                  checked={active}
                  onCheckedChange={setRealState}
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {active ? "Checked" : "Unchecked"}
                </span>
              </div>
            </div>
          </div>
          <p className={styles.caption}>
            Continuità tra stati: se invertito durante il moto, retargetta dalla posizione corrente senza scatti.
          </p>
        </article>

        {/* 4. Surface (300ms) */}
        <article
          className={styles.specimen}
          data-motion-demo="surface"
          data-surface-mounted={surfaceMounted}
        >
          <header className={styles.specimenHeader}>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Surface</h3>
              <span className="font-mono text-xs text-muted-foreground">300 ms · ease-emphasized</span>
            </div>
            <span className={styles.badgeLabel}>CSS Surface</span>
          </header>
          <div className={styles.surfaceStage}>
            {surfaceMounted ? (
              <div
                className={styles.surface}
                data-open={surfaceOpen}
                onTransitionEnd={settleFromSurface}
              >
                <strong className="text-xs font-semibold text-foreground">
                  Superficie contestuale
                </strong>
                <span className="text-xs text-muted-foreground">
                  Il DOM resta montato fino al termine della chiusura.
                </span>
              </div>
            ) : (
              <span className={styles.unmounted}>Superficie chiusa (DOM smontato)</span>
            )}
          </div>
          <p className={styles.caption}>
            Decelerazione enfatizzata per orientamento spaziale. Lifecycle e presence rispettati in uscita.
          </p>
        </article>
      </div>
    </div>
  );
}
