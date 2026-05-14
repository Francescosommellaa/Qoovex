"use client";

import * as React from "react";

export type WorkspaceTextScale = "regular" | "large" | "xlarge";

export interface DisplayPreferencesContextValue {
  textScale: WorkspaceTextScale;
  highContrast: boolean;
  setTextScale: (textScale: WorkspaceTextScale) => void;
  setHighContrast: (highContrast: boolean) => void;
}

interface DisplayPreferencesProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "qoovex-workspace-display-preferences";

const DisplayPreferencesContext =
  React.createContext<DisplayPreferencesContextValue | null>(null);

function isTextScale(value: unknown): value is WorkspaceTextScale {
  return value === "regular" || value === "large" || value === "xlarge";
}

function readStoredPreferences() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as {
      textScale?: unknown;
      highContrast?: unknown;
    };

    return {
      textScale: isTextScale(parsed.textScale) ? parsed.textScale : "regular",
      highContrast:
        typeof parsed.highContrast === "boolean" ? parsed.highContrast : false,
    };
  } catch {
    return null;
  }
}

export function DisplayPreferencesProvider({
  children,
}: DisplayPreferencesProviderProps) {
  const [textScale, setTextScale] =
    React.useState<WorkspaceTextScale>("regular");
  const [highContrast, setHighContrast] = React.useState(false);

  React.useEffect(() => {
    const stored = readStoredPreferences();
    if (!stored) return;

    setTextScale(stored.textScale);
    setHighContrast(stored.highContrast);
  }, []);

  React.useEffect(() => {
    document.documentElement.dataset.qvTextScale = textScale;
    document.documentElement.dataset.qvContrast = highContrast
      ? "more"
      : "standard";

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ textScale, highContrast }),
    );
  }, [highContrast, textScale]);

  const value = React.useMemo<DisplayPreferencesContextValue>(
    () => ({
      textScale,
      highContrast,
      setTextScale,
      setHighContrast,
    }),
    [highContrast, textScale],
  );

  return (
    <DisplayPreferencesContext.Provider value={value}>
      {children}
    </DisplayPreferencesContext.Provider>
  );
}

export function useDisplayPreferences() {
  const context = React.useContext(DisplayPreferencesContext);

  if (!context) {
    throw new Error(
      "useDisplayPreferences must be used inside DisplayPreferencesProvider",
    );
  }

  return context;
}
