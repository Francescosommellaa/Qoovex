"use client";

import type { ReactNode } from "react";
import { IconArrowLeft, IconArrowRight, IconCheck } from "@tabler/icons-react";
import { Button } from "#components/button";
import { FieldError } from "#components/field";

interface StepperStep {
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  children: ReactNode;
  error?: string | null;
  isPending?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  onFinal?: () => void;
  backLabel?: string;
  nextLabel?: string;
  finalLabel?: string;
  ariaLabel?: string;
}

export function Stepper({
  steps,
  currentStep,
  children,
  error = null,
  isPending = false,
  onBack,
  onNext,
  onFinal,
  backLabel = "Indietro",
  nextLabel = "Continua",
  finalLabel = "Crea",
  ariaLabel = "Avanzamento creazione",
}: StepperProps) {
  const isLastStep = currentStep >= steps.length - 1;

  return (
    <div>
      <ol
        aria-label={ariaLabel}
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
        role="list"
      >
        {steps.map((step, index) => (
          <li
            aria-current={index === currentStep ? "step" : undefined}
            key={step.label}
          >
            <span
              className={`block h-1.5 rounded-full ${
                index <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
            <span
              className={`mt-1 text-xs ${
                index === currentStep
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {index + 1}. {step.label}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-4">{children}</div>

      {error ? (
        <FieldError className="mt-4">{error}</FieldError>
      ) : null}

      <div className="mt-4 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-between">
        {onBack ? (
          <Button
            variant="outline"
            disabled={isPending || currentStep === 0}
            onClick={onBack}
          >
            <IconArrowLeft />
            {backLabel}
          </Button>
        ) : (
          <div />
        )}
        {!isLastStep && onNext ? (
          <Button disabled={isPending} onClick={onNext}>
            {nextLabel}
            <IconArrowRight />
          </Button>
        ) : null}
        {isLastStep && onFinal ? (
          <Button disabled={isPending} onClick={onFinal}>
            {finalLabel}
            <IconCheck />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
