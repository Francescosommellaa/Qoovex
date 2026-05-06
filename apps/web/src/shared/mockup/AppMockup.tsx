"use client";

import { AnimatePresence, motion, type Transition } from "motion/react";
import { Skeleton } from "@qoovex/ui";
import {
  BookOpen,
  ForkKnife,
  ClipboardText,
  MagnifyingGlass,
  QrCode,
  Check,
  SquaresFour,
} from "@phosphor-icons/react";

// ── Types ──────────────────────────────────────────────────────────────────

export type AppScreen = "recipes" | "menus" | "workplan" | "explore" | "qr";

interface AppMockupProps {
  activeScreen: AppScreen;
}

// ── Nav ────────────────────────────────────────────────────────────────────

const NAV: { id: AppScreen; label: string; icon: React.ElementType }[] = [
  { id: "recipes",  label: "Ricette",  icon: BookOpen },
  { id: "menus",    label: "Menu",     icon: ForkKnife },
  { id: "workplan", label: "Lavoro",   icon: ClipboardText },
  { id: "explore",  label: "Esplora",  icon: MagnifyingGlass },
  { id: "qr",       label: "QR",       icon: QrCode },
];

// ── Easing — typed correctly for Framer Motion 12 ────────────────────────
// Framer requires the tuple cast to [number,number,number,number] or a string.
const EASE_OUT = "easeOut" as const;
const EASE_SPRING: Transition = { type: "spring", stiffness: 380, damping: 34 };

// ── Component ──────────────────────────────────────────────────────────────

export function AppMockup({ activeScreen }: AppMockupProps) {
  return (
    <div
      className="
        w-full max-w-[460px] overflow-hidden
        rounded-[--radius-2xl] border border-[--color-border]
        bg-[--color-surface] shadow-[--shadow-lg]
        will-change-transform
      "
      role="img"
      aria-label="Anteprima Qoovex Workspace"
    >
      {/* Browser chrome */}
      <div className="flex h-10 items-center gap-3 border-b border-[--color-border] bg-[--color-surface-2] px-3">
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex flex-1 justify-center">
          <span className="
            rounded-full border border-[--color-border]
            bg-[--color-surface-offset] px-3 py-0.5
            text-(length:--text-xs) text-[--color-text-faint]
            select-none
          ">
            app.qoovex.com
          </span>
        </div>
        <div className="w-12 shrink-0" />
      </div>

      {/* App shell */}
      <div className="flex" style={{ height: 480 }}>

        {/* Sidebar */}
        <aside className="flex w-[112px] shrink-0 flex-col gap-1 border-r border-[--color-border] bg-[--color-surface-2] p-3">
          {/* Logo mark */}
          <div className="mb-3 border-b border-[--color-divider] pb-3 pl-1">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-[--radius-sm] bg-[--color-primary-highlight] text-[--color-primary]">
              <SquaresFour size={12} weight="bold" aria-hidden />
            </span>
          </div>

          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeScreen === id;
            return (
              <div
                key={id}
                className={`
                  flex items-center gap-2 rounded-[--radius-md] px-2 py-2
                  transition-colors duration-[--duration-base]
                  ${active
                    ? "bg-[--color-surface-offset] text-[--color-text]"
                    : "text-[--color-text-faint]"
                  }
                `}
              >
                <Icon size={14} weight={active ? "bold" : "regular"} className="shrink-0" />
                <span className="text-(length:--text-xs) leading-none">{label}</span>
              </div>
            );
          })}
        </aside>

        {/* Screen area */}
        <main className="relative flex-1 overflow-hidden bg-[--color-bg]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.34, ease: EASE_OUT } }}
              exit={{ opacity: 0, y: -5, scale: 0.99, transition: { duration: 0.18, ease: EASE_OUT } }}
              className="absolute inset-0 overflow-hidden"
            >
              <ScreenContent screen={activeScreen} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ── Screen dispatcher ─────────────────────────────────────────────────────

function ScreenContent({ screen }: { screen: AppScreen }) {
  switch (screen) {
    case "recipes":  return <RecipesScreen />;
    case "menus":    return <MenusScreen />;
    case "workplan": return <WorkplanScreen />;
    case "explore":  return <ExploreScreen />;
    case "qr":       return <QrScreen />;
  }
}

// ── Shared primitives ─────────────────────────────────────────────────────

function ScreenTopbar({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[--color-divider] px-4 py-3">
      <span className="text-(length:--text-sm) font-semibold text-[--color-text]">{title}</span>
      {action && (
        <span className="
          rounded-full border border-[--color-border]
          bg-[--color-primary-highlight] px-2.5 py-0.5
          text-(length:--text-xs) font-medium text-[--color-primary]
        ">
          {action}
        </span>
      )}
    </div>
  );
}

// ── Item spring helper ────────────────────────────────────────────────────

function itemTransition(i: number): Transition {
  return { ...EASE_SPRING, delay: i * 0.055 };
}

// ── Screens ───────────────────────────────────────────────────────────────

const RECIPES = [
  { name: "Risotto al limone e timo",    meta: "4 porz · 35 min", dot: "success" },
  { name: "Tartare di tonno e avocado",  meta: "2 porz · 15 min", dot: "primary" },
  { name: "Crème brûlée alla vaniglia",  meta: "6 porz · 50 min", dot: "success" },
  { name: "Pappardelle al cinghiale",    meta: "4 porz · 90 min", dot: "warning" },
];

const DOT_COLOR: Record<string, string> = {
  success: "bg-[--color-success]",
  primary: "bg-[--color-primary]",
  warning: "bg-[--color-warning]",
};

function RecipesScreen() {
  return (
    <div className="flex h-full flex-col">
      <ScreenTopbar title="Le mie ricette" action="+ Nuova" />
      <div className="flex flex-col gap-1.5 overflow-hidden p-3">
        {RECIPES.map(({ name, meta, dot }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0, transition: itemTransition(i) }}
            className="flex items-center gap-3 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-2.5"
          >
            <Skeleton variant="block" size="sm" radius="md" className="h-9 w-9 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-(length:--text-xs) font-medium text-[--color-text]">{name}</span>
              <span className="text-(length:--text-xs) text-[--color-text-faint]">{meta}</span>
            </div>
            <span className={`h-2 w-2 shrink-0 rounded-full opacity-80 ${DOT_COLOR[dot]}`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const MENUS = [
  { name: "Menu degustazione", count: "8 piatti",  tone: "primary" },
  { name: "Carta estate 2025", count: "14 piatti", tone: "success" },
  { name: "Menu vegano",       count: "6 piatti",  tone: "warning" },
];

const MENU_BG: Record<string, string> = {
  primary: "bg-[--color-primary-highlight]",
  success: "bg-[--color-success-highlight]",
  warning: "bg-[--color-warning-highlight]",
};

function MenusScreen() {
  return (
    <div className="flex h-full flex-col">
      <ScreenTopbar title="Menu digitali" action="+ Menu" />
      <div className="grid grid-cols-2 gap-2 p-3">
        {MENUS.map(({ name, count, tone }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: itemTransition(i) }}
            className="flex flex-col gap-2 rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] p-3"
          >
            <div className={`h-7 w-7 rounded-[--radius-md] ${MENU_BG[tone]}`} />
            <span className="text-(length:--text-xs) font-medium leading-snug text-[--color-text]">{name}</span>
            <span className="text-(length:--text-xs) text-[--color-text-faint]">{count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const TASKS = [
  { label: "Prep basi fondi bruni",     done: true },
  { label: "Tartare × 12 coperti",      done: true },
  { label: "Crema al limone",           done: false },
  { label: "Mise en place dessert",     done: false },
  { label: "Pre-cottura risotto",       done: false },
];

function WorkplanScreen() {
  return (
    <div className="flex h-full flex-col">
      <ScreenTopbar title="Piano di lavoro" action="Oggi" />
      <div className="flex flex-col gap-1.5 overflow-hidden p-3">
        {TASKS.map(({ label, done }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0, transition: itemTransition(i) }}
            className={`flex items-center gap-2.5 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] px-3 py-2.5 ${done ? "opacity-50" : ""}`}
          >
            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[--radius-sm] border border-[--color-border] ${done ? "border-[--color-primary] bg-[--color-primary]" : ""}`}>
              {done && <Check size={10} weight="bold" className="text-white" />}
            </span>
            <span className={`text-(length:--text-xs) text-[--color-text] ${done ? "line-through text-[--color-text-faint]" : ""}`}>
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const CHEFS = [
  { name: "Chef Mario Russo",   sub: "18 ricette pubbliche" },
  { name: "Osteria del Porto",  sub: "9 menu condivisi" },
  { name: "Ristorante Alma",    sub: "24 ricette pubbliche" },
];

function ExploreScreen() {
  return (
    <div className="flex h-full flex-col">
      <ScreenTopbar title="Esplora" />
      <div className="flex flex-col gap-1.5 p-3">
        {CHEFS.map(({ name, sub }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: itemTransition(i) }}
            className="flex items-center gap-3 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-2.5"
          >
            <Skeleton variant="avatar" size="sm" radius="full" className="shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-(length:--text-xs) font-medium text-[--color-text]">{name}</span>
              <span className="text-(length:--text-xs) text-[--color-text-faint]">{sub}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function QrScreen() {
  const cells = Array.from({ length: 49 }, (_, i) => {
    const corners = [0,1,2,3,4,5,6,7,13,14,20,21,27,28,42,43,44,45,46,47,48];
    return corners.includes(i) ? true : Math.random() > 0.48;
  });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <span className="text-(length:--text-xs) font-medium text-[--color-text-muted]">
        Menu degustazione
      </span>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, transition: { ...EASE_SPRING, delay: 0.05 } }}
        className="rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] p-4 shadow-[--shadow-md]"
      >
        <div className="grid grid-cols-7 gap-[2px]" style={{ width: 112, height: 112 }}>
          {cells.map((filled, i) => (
            <div key={i} className={`rounded-[1px] ${filled ? "bg-[--color-text]" : "bg-transparent"}`} />
          ))}
        </div>
      </motion.div>
      <span className="text-(length:--text-xs) text-[--color-text-faint]">
        Scansiona per aprire il menu
      </span>
    </div>
  );
}