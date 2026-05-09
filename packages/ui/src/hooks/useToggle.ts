"use client";

import * as React from "react";

export function useToggle(defaultValue = false) {
  const [enabled, setEnabled] = React.useState(defaultValue);

  const toggle = React.useCallback(() => {
    setEnabled((value) => !value);
  }, []);

  return [enabled, toggle, setEnabled] as const;
}

