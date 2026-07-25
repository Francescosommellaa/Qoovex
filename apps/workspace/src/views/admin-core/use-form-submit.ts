"use client";

import { useCallback, useRef, useState } from "react";
import { ApiError } from "./admin-api-client";

export function useFormSubmit() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearErrors = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const handleSubmit = useCallback(
    async (fn: () => Promise<unknown>) => {
      setPending(true);
      clearErrors();

      if (formRef.current && !formRef.current.checkValidity()) {
        formRef.current.reportValidity();
        setPending(false);
        return;
      }

      try {
        await fn();
      } catch (submitError) {
        if (submitError instanceof ApiError && submitError.fieldErrors.length) {
          const mapped: Record<string, string> = {};
          for (const fe of submitError.fieldErrors) mapped[fe.field] = fe.message;
          setFieldErrors(mapped);
          setError(null);
        } else {
          setError(submitError instanceof Error ? submitError.message : "Operazione non riuscita.");
        }
      } finally {
        setPending(false);
      }
    },
    [clearErrors],
  );

  return { formRef, pending, error, fieldErrors, setError, handleSubmit } as const;
}
