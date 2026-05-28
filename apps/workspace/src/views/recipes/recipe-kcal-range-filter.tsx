"use client";

import * as React from "react";
import { Text } from "@qoovex/ui";
import styles from "./recipe-kcal-range-filter.module.css";

const KCAL_MIN = 0;
const KCAL_DEFAULT_MAX = 5000;
const KCAL_STEP = 50;

type RangeStyle = React.CSSProperties & {
  "--range-start": string;
  "--range-end": string;
};

function roundToStep(value: number) {
  return Math.round(value / KCAL_STEP) * KCAL_STEP;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getMaxLimit(minValue?: number | null, maxValue?: number | null) {
  const biggestValue = Math.max(minValue ?? KCAL_MIN, maxValue ?? KCAL_DEFAULT_MAX);
  return Math.max(KCAL_DEFAULT_MAX, Math.ceil(biggestValue / 500) * 500);
}

function getInitialRange(minValue: number | null | undefined, maxValue: number | null | undefined) {
  const maxLimit = getMaxLimit(minValue, maxValue);
  const min = typeof minValue === "number" ? clamp(roundToStep(minValue), KCAL_MIN, maxLimit) : KCAL_MIN;
  const max = typeof maxValue === "number" ? clamp(roundToStep(maxValue), KCAL_MIN, maxLimit) : maxLimit;

  return {
    min: Math.min(min, max),
    max: Math.max(min, max),
    maxLimit,
  };
}

function formatKcal(value: number) {
  return new Intl.NumberFormat("it-IT").format(value);
}

export function RecipeKcalRangeFilter({
  minValue,
  maxValue,
}: {
  minValue?: number | null;
  maxValue?: number | null;
}) {
  const [{ min, max, maxLimit }, setRange] = React.useState(() =>
    getInitialRange(minValue, maxValue),
  );

  const minPercent = ((min - KCAL_MIN) / (maxLimit - KCAL_MIN)) * 100;
  const maxPercent = ((max - KCAL_MIN) / (maxLimit - KCAL_MIN)) * 100;
  const style: RangeStyle = {
    "--range-start": `${minPercent}%`,
    "--range-end": `${maxPercent}%`,
  };

  return (
    <div className={styles.root}>
      <input type="hidden" name="kcalMin" value={min > KCAL_MIN ? min : ""} />
      <input type="hidden" name="kcalMax" value={max < maxLimit ? max : ""} />
      <div className={styles.header}>
        <Text as="span" size="sm" weight="medium">
          Kcal
        </Text>
        <span className={styles.value}>
          {formatKcal(min)} - {formatKcal(max)} kcal
        </span>
      </div>
      <div className={styles.track} style={style}>
        <span className={styles.rail} aria-hidden="true" />
        <input
          aria-label="Kcal minime"
          className={styles.input}
          type="range"
          min={KCAL_MIN}
          max={maxLimit}
          step={KCAL_STEP}
          value={min}
          onChange={(event) => {
            const nextMin = clamp(Number(event.target.value), KCAL_MIN, max);
            setRange((current) => ({ ...current, min: nextMin }));
          }}
        />
        <input
          aria-label="Kcal massime"
          className={styles.input}
          type="range"
          min={KCAL_MIN}
          max={maxLimit}
          step={KCAL_STEP}
          value={max}
          onChange={(event) => {
            const nextMax = clamp(Number(event.target.value), min, maxLimit);
            setRange((current) => ({ ...current, max: nextMax }));
          }}
        />
      </div>
    </div>
  );
}
