"use client";

import * as React from "react";
import {
  IconBrightness,
  IconCheck,
  IconDeviceDesktop,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { IconButton } from "#components/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "#components/dropdown-menu";
import { PREFERS_REDUCED_MOTION_QUERY } from "#lib/motion";

type ThemeChoice = "light" | "dark" | "system";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => setMounted(true), []);
  const currentThemeLabel = !mounted ? "di sistema" : theme === "light" ? "chiaro" : theme === "dark" ? "scuro" : "di sistema";

  const setThemeWithTransition = React.useCallback(
    (nextTheme: ThemeChoice) => {
      const root = document.documentElement;
      const triggerBounds = triggerRef.current?.getBoundingClientRect();
      const x = triggerBounds
        ? triggerBounds.left + triggerBounds.width / 2
        : window.innerWidth / 2;
      const y = triggerBounds
        ? triggerBounds.top + triggerBounds.height / 2
        : window.innerHeight / 2;
      const transitionDocument = document as ViewTransitionDocument;
      const reducedMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;

      root.style.setProperty("--x", `${x}px`);
      root.style.setProperty("--y", `${y}px`);

      if (!transitionDocument.startViewTransition || reducedMotion) {
        setTheme(nextTheme);
        return;
      }

      transitionDocument.startViewTransition(() => setTheme(nextTheme));
    },
    [setTheme],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <IconButton
            aria-label={`Cambia tema, attuale: ${currentThemeLabel}`}
            ref={triggerRef}
            size="default"
            variant="ghost"
          />
        }
      >
        <IconBrightness aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Tema</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setThemeWithTransition("light")}>
            <IconSun aria-hidden="true" /> Chiaro
            {mounted && theme === "light" ? <IconCheck aria-hidden="true" className="ml-auto" /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setThemeWithTransition("dark")}>
            <IconMoon aria-hidden="true" /> Scuro
            {mounted && theme === "dark" ? <IconCheck aria-hidden="true" className="ml-auto" /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setThemeWithTransition("system")}>
            <IconDeviceDesktop aria-hidden="true" /> Sistema
            {mounted && theme === "system" ? <IconCheck aria-hidden="true" className="ml-auto" /> : null}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
