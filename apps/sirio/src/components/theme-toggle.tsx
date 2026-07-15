"use client";

import * as React from "react";
import { IconBrightness, IconCheck, IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type ThemeChoice = "light" | "dark" | "system";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => setMounted(true), []);

  const setThemeWithTransition = React.useCallback((nextTheme: ThemeChoice) => {
    const root = document.documentElement;
    const triggerBounds = triggerRef.current?.getBoundingClientRect();
    const x = triggerBounds ? triggerBounds.left + triggerBounds.width / 2 : window.innerWidth / 2;
    const y = triggerBounds ? triggerBounds.top + triggerBounds.height / 2 : window.innerHeight / 2;
    const transitionDocument = document as ViewTransitionDocument;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.style.setProperty("--x", `${x}px`);
    root.style.setProperty("--y", `${y}px`);

    if (!transitionDocument.startViewTransition || prefersReducedMotion) {
      setTheme(nextTheme);
      return;
    }

    transitionDocument.startViewTransition(() => {
      setTheme(nextTheme);
    });
  }, [setTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button aria-label="Cambia tema" ref={triggerRef} size="icon" variant="ghost" />}>
        <IconBrightness />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Tema</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setThemeWithTransition("light")}>
            <IconSun /> Chiaro {mounted && theme === "light" ? <IconCheck className="ml-auto" /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setThemeWithTransition("dark")}>
            <IconMoon /> Scuro {mounted && theme === "dark" ? <IconCheck className="ml-auto" /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setThemeWithTransition("system")}>
            <IconDeviceDesktop /> Sistema {mounted && theme === "system" ? <IconCheck className="ml-auto" /> : null}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
