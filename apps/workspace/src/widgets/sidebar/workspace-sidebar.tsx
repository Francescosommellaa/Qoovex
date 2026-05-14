"use client";

import * as React from "react";
import { SignOutButton } from "@clerk/nextjs";
import {
  Bell,
  BookOpen,
  CaretDown,
  ChartBar,
  ClipboardText,
  ForkKnife,
  GearSix,
  ListChecks,
  MagnifyingGlass,
  Receipt,
  SignOut,
  TextAa,
  type IconProps as PhosphorIconProps,
} from "@phosphor-icons/react";
import {
  Avatar,
  Badge,
  Button,
  Icon,
  Text,
  ThemeToggle,
  cn,
} from "@qoovex/ui";
import { useDisplayPreferences, type WorkspaceTextScale } from "@shared/ui";
import type { WorkspaceUserSummary } from "@widgets/workspace-shell";

interface WorkspaceSidebarProps {
  user: WorkspaceUserSummary;
  variant?: "desktop" | "sheet";
  onNavigate?: () => void;
}

interface WorkspaceNavigationItem {
  label: string;
  href?: string;
  icon: React.ComponentType<PhosphorIconProps>;
  disabled?: boolean;
}

const navigationItems: WorkspaceNavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: ChartBar },
  { label: "Ricette", icon: BookOpen, disabled: true },
  { label: "Menu", icon: ForkKnife, disabled: true },
  { label: "Lista spesa", icon: ListChecks, disabled: true },
  { label: "Piani di lavoro", icon: ClipboardText, disabled: true },
  { label: "Esplora", icon: MagnifyingGlass, disabled: true },
  { label: "Notifiche", icon: Bell, disabled: true },
];

const planLabel: Record<WorkspaceUserSummary["plan"], string> = {
  FREE: "Free",
  START: "Start",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

const textScaleOptions: Array<{
  value: WorkspaceTextScale;
  label: string;
}> = [
  { value: "regular", label: "A" },
  { value: "large", label: "A+" },
  { value: "xlarge", label: "A++" },
];

function getDisplayName(user: WorkspaceUserSummary) {
  return user.name || user.username || user.email;
}

function getInitials(user: WorkspaceUserSummary) {
  const source = getDisplayName(user);

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function WorkspaceSidebarNavigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-(--spacing-1)" aria-label="Workspace">
      {navigationItems.map((item) => {
        const itemIcon = <Icon icon={item.icon} size="md" weight="regular" />;

        if (item.disabled || !item.href) {
          return (
            <button
              key={item.label}
              type="button"
              className="flex h-10 w-full cursor-not-allowed items-center gap-(--spacing-3) rounded-(--radius-lg) px-(--spacing-3) text-left text-(length:--text-sm) font-medium text-(--color-text-faint) opacity-70"
              disabled
              aria-disabled="true"
            >
              {itemIcon}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <Badge size="sm" variant="soft" tone="neutral">
                presto
              </Badge>
            </button>
          );
        }

        return (
          <a
            key={item.label}
            href={item.href}
            className="flex h-10 items-center gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-primary-highlight) px-(--spacing-3) text-(length:--text-sm) font-medium text-(--color-text) shadow-[var(--shadow-sm)] transition-[background,border-color,color] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] hover:bg-(--color-surface-offset)"
            aria-current="page"
            onClick={onNavigate}
          >
            {itemIcon}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

function AccessibilityControls() {
  const { textScale, highContrast, setTextScale, setHighContrast } =
    useDisplayPreferences();

  return (
    <div className="grid gap-(--spacing-3)">
      <div className="grid gap-(--spacing-2)">
        <Text size="xs" tone="muted" weight="medium">
          Accessibilita
        </Text>
        <div className="flex rounded-(--radius-full) border border-(--color-border) bg-(--color-surface) p-1">
          {textScaleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "h-8 flex-1 rounded-(--radius-full) text-(length:--text-xs) font-semibold text-(--color-text-muted) transition-[background,color] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] hover:text-(--color-text)",
                textScale === option.value &&
                  "bg-(--color-surface-raised) text-(--color-text) shadow-[var(--shadow-sm)]",
              )}
              aria-pressed={textScale === option.value}
              onClick={() => setTextScale(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={cn(
          "flex h-9 items-center justify-between rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) px-(--spacing-3) text-(length:--text-xs) font-medium text-(--color-text-muted) transition-[background,color,border-color] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] hover:bg-(--color-surface-offset) hover:text-(--color-text)",
          highContrast &&
            "border-(--color-primary) bg-(--color-primary-highlight) text-(--color-text)",
        )}
        aria-pressed={highContrast}
        onClick={() => setHighContrast(!highContrast)}
      >
        <span>Contrasto aumentato</span>
        <span>{highContrast ? "On" : "Off"}</span>
      </button>
    </div>
  );
}

function UserMenu({ user }: { user: WorkspaceUserSummary }) {
  return (
    <details className="group rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface-2) p-(--spacing-3) shadow-[var(--shadow-sm)]">
      <summary className="flex cursor-pointer list-none items-center gap-(--spacing-3) rounded-(--radius-lg) outline-none transition-colors duration-[var(--duration-base)] ease-[var(--ease-qoovex)] focus-visible:ring-2 focus-visible:ring-(--color-primary-highlight)">
        <Avatar
          name={getDisplayName(user)}
          initials={getInitials(user)}
          size="md"
          tone="primary"
          status="online"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-(length:--text-sm) font-semibold text-(--color-text)">
            {getDisplayName(user)}
          </span>
          <span className="block truncate text-(length:--text-xs) text-(--color-text-muted)">
            {user.email}
          </span>
        </span>
        <Icon
          icon={CaretDown}
          size="sm"
          className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-qoovex)] group-open:rotate-180"
        />
      </summary>

      <div className="mt-(--spacing-4) grid gap-(--spacing-3)">
        <div className="flex items-center justify-between gap-(--spacing-3)">
          <Text size="xs" tone="muted">
            Piano
          </Text>
          <Badge size="sm" variant="soft" tone="primary">
            {planLabel[user.plan]}
          </Badge>
        </div>

        <ThemeToggle className="w-full justify-start" />

        <AccessibilityControls />

        <div className="grid gap-(--spacing-2) border-t border-(--color-divider) pt-(--spacing-3)">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            iconLeft={<GearSix size={14} />}
            disabled
          >
            Impostazioni
          </Button>
          <SignOutButton redirectUrl="/sign-in">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-(--color-error)"
              iconLeft={<SignOut size={14} />}
            >
              Esci
            </Button>
          </SignOutButton>
        </div>
      </div>
    </details>
  );
}

export function WorkspaceSidebar({
  user,
  variant = "desktop",
  onNavigate,
}: WorkspaceSidebarProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col bg-(--color-surface)",
        variant === "sheet"
          ? "max-h-[calc(100dvh-var(--spacing-8))] p-(--spacing-4)"
          : "p-(--spacing-4)",
      )}
    >
      <div className="mb-(--spacing-5) flex items-center gap-(--spacing-3)">
        <span className="flex size-10 items-center justify-center rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface-raised)">
          <Icon icon={Receipt} size="lg" weight="bold" />
        </span>
        <div className="min-w-0">
          <Text size="sm" weight="semibold">
            Qoovex
          </Text>
          <Text size="xs" tone="muted">
            Workspace
          </Text>
        </div>
      </div>

      <WorkspaceSidebarNavigation onNavigate={onNavigate} />

      <div className="mt-(--spacing-5) grid gap-(--spacing-3)">
        <div className="rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-(--spacing-3)">
          <div className="flex items-start gap-(--spacing-3)">
            <Icon icon={TextAa} size="md" tone="primary" />
            <div className="min-w-0">
              <Text size="xs" weight="semibold">
                Cura visiva
              </Text>
              <Text size="xs" tone="muted" leading="relaxed">
                Tema, testo e contrasto sempre a portata.
              </Text>
            </div>
          </div>
        </div>
        <UserMenu user={user} />
      </div>
    </div>
  );
}
