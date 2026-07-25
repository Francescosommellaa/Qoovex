"use client";

import { useCallback, useRef, useState } from "react";
import type { Validator } from "#lib/validation";

export interface FieldErrorEntry {
  field: string;
  message: string;
}

export interface FieldErrors {
  [field: string]: string;
}

interface UseFormValidationReturn {
  errors: FieldErrors;
  errorList: FieldErrorEntry[];
  setError: (field: string, message: string) => void;
  setErrors: (entries: FieldErrorEntry[]) => void;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  validateFields: (
    form: HTMLFormElement,
    schema: Record<string, Validator[]>,
  ) => boolean;
  firstErrorField: React.RefObject<string | null>;
}

export function useFormValidation(): UseFormValidationReturn {
  const [errorList, setErrorList] = useState<FieldErrorEntry[]>([]);
  const firstErrorField = useRef<string | null>(null);

  const errors: FieldErrors = {};
  for (const entry of errorList) {
    if (!errors[entry.field]) errors[entry.field] = entry.message;
  }

  const setError = useCallback((field: string, message: string) => {
    setErrorList((prev) => [
      ...prev.filter((e) => e.field !== field),
      { field, message },
    ]);
  }, []);

  const setErrors = useCallback((entries: FieldErrorEntry[]) => {
    setErrorList(entries);
  }, []);

  const clearErrors = useCallback(() => setErrorList([]), []);

  const clearFieldError = useCallback((field: string) => {
    setErrorList((prev) => prev.filter((e) => e.field !== field));
  }, []);

  const validateFields = useCallback(
    (
      form: HTMLFormElement,
      schema: Record<string, Validator[]>,
    ): boolean => {
      const entries: FieldErrorEntry[] = [];
      let first: string | null = null;

      for (const [name, fieldValidators] of Object.entries(schema)) {
        const input = form.elements.namedItem(name);
        if (!input || !("value" in input)) continue;
        const value = String((input as unknown as HTMLInputElement).value ?? "");

        for (const v of fieldValidators) {
          const message = v(value);
          if (message) {
            entries.push({ field: name, message });
            if (!first) first = name;
            break;
          }
        }
      }

      setErrorList(entries);
      firstErrorField.current = first;

      if (first) {
        const el = form.elements.namedItem(first);
        if (el && "focus" in el) (el as HTMLInputElement).focus();
      }

      return entries.length === 0;
    },
    [],
  );

  return {
    errors,
    errorList,
    setError,
    setErrors,
    clearErrors,
    clearFieldError,
    validateFields,
    firstErrorField,
  };
}
