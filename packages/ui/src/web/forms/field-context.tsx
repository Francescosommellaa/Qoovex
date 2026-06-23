"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type AriaAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

import { cx } from "../primitives/utils";

export type FieldLayout = "stacked" | "choice";

interface FieldContextValue {
  controlId: string;
  describedBy?: string;
  disabled: boolean;
  invalid: boolean;
  required: boolean;
  registerDescription: (kind: "hint" | "error", id: string) => () => void;
}

const FieldContext = createContext<FieldContextValue | null>(null);

function normalizeId(id: string) {
  return id.replace(/:/g, "");
}

function addUnique(values: readonly string[], value: string) {
  return values.includes(value) ? values : [...values, value];
}

function removeValue(values: readonly string[], value: string) {
  return values.filter((entry) => entry !== value);
}

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "id"> {
  ref?: Ref<HTMLDivElement>;
  id?: string;
  layout?: FieldLayout;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  children: ReactNode;
}

export function Field({
  ref,
  id,
  layout = "stacked",
  required = false,
  disabled = false,
  invalid = false,
  className,
  children,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? `qv-field-${normalizeId(generatedId)}`;
  const [hintIds, setHintIds] = useState<readonly string[]>([]);
  const [errorIds, setErrorIds] = useState<readonly string[]>([]);

  const registerDescription = useCallback((kind: "hint" | "error", descriptionId: string) => {
    const update = kind === "hint" ? setHintIds : setErrorIds;
    update((current) => addUnique(current, descriptionId));
    return () => update((current) => removeValue(current, descriptionId));
  }, []);

  const describedBy = [...hintIds, ...errorIds].join(" ") || undefined;
  const value = useMemo<FieldContextValue>(() => ({
    controlId,
    describedBy,
    disabled,
    invalid,
    required,
    registerDescription,
  }), [controlId, describedBy, disabled, invalid, registerDescription, required]);

  return (
    <FieldContext.Provider value={value}>
      <div
        ref={ref}
        className={cx("qv-field", className)}
        data-layout={layout}
        data-required={required || undefined}
        data-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
}

export function useFieldContext() {
  return useContext(FieldContext);
}

export function mergeIds(...values: Array<string | undefined>) {
  const ids = values.flatMap((value) => value?.split(/\s+/).filter(Boolean) ?? []);
  return [...new Set(ids)].join(" ") || undefined;
}

export function useFieldControl({
  id,
  required,
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  id?: string;
  required?: boolean;
  disabled?: boolean;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;
}) {
  const field = useFieldContext();
  return {
    id: field?.controlId ?? id,
    required: field?.required || required || undefined,
    disabled: field?.disabled || disabled || undefined,
    "aria-invalid": ariaInvalid ?? (field?.invalid || undefined),
    "aria-describedby": mergeIds(ariaDescribedBy, field?.describedBy),
  };
}
