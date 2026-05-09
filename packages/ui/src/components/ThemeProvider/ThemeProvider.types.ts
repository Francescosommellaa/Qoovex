import type * as React from "react";
import type { QoovexThemeName } from "../../../styles/themes";

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: QoovexThemeName;
  storageKey?: string;
}

export interface ThemeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export interface ThemeContextValue {
  theme: QoovexThemeName;
  setTheme: (theme: QoovexThemeName) => void;
  toggleTheme: () => void;
}

