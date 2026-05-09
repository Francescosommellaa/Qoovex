"use client";

import * as React from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";
import { Icon } from "../../primitives";
import type {
  ThemeContextValue,
  ThemeProviderProps,
  ThemeToggleProps,
} from "./ThemeProvider.types";
import { themeToggleClassName } from "./ThemeProvider.variants";

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "qoovex-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState(defaultTheme);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "dark" || stored === "white") {
      setThemeState(stored);
    }
  }, [storageKey]);

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme === "white" ? "light" : "dark";
    window.localStorage.setItem(storageKey, theme);
  }, [storageKey, theme]);

  const value = React.useMemo<ThemeContextValue>(() => {
    function setTheme(nextTheme: ThemeContextValue["theme"]) {
      setThemeState(nextTheme);
    }

    function toggleTheme() {
      setThemeState((current) => (current === "dark" ? "white" : "dark"));
    }

    return { theme, setTheme, toggleTheme };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}

export const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(
  function ThemeToggle({ label = "Tema", className, ...props }, ref) {
    const { theme, toggleTheme } = useTheme();
    const isWhite = theme === "white";

    return (
      <button
        ref={ref}
        type="button"
        className={cn(themeToggleClassName, className)}
        onClick={toggleTheme}
        aria-label={isWhite ? "Attiva tema scuro" : "Attiva tema chiaro"}
        {...props}
      >
        <Icon icon={isWhite ? Sun : Moon} size="sm" tone="current" weight="bold" />
        <span>{label}</span>
      </button>
    );
  },
);

ThemeToggle.displayName = "ThemeToggle";

