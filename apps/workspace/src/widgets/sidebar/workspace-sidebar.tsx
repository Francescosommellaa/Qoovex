"use client";

import * as React from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CaretDown,
  ChartBar,
  ClipboardText,
  ForkKnife,
  GearSix,
  ListChecks,
  MagnifyingGlass,
  Moon,
  SignOut,
  Sun,
  type IconProps as PhosphorIconProps,
} from "@phosphor-icons/react";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Icon,
  Text,
  Toggle,
  cn,
  useTheme,
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
  { label: "Ricette", href: "/recipes", icon: BookOpen },
  { label: "Menu", href: "/menus", icon: ForkKnife },
  { label: "Lista spesa", href: "/shopping-list", icon: ListChecks },
  { label: "Piani di lavoro", href: "/work-plans", icon: ClipboardText },
  { label: "Esplora", href: "/explore", icon: MagnifyingGlass },
  { label: "Impostazioni", href: "/settings", icon: GearSix },
];

const adminNavigationItems: WorkspaceNavigationItem[] = [
  { label: "Admin", href: "/admin", icon: GearSix },
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

function WorkspaceSidebarNavigation({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const renderNavigationItem = (item: WorkspaceNavigationItem) => {
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

    const isActive =
      pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
      <a
        key={item.label}
        href={item.href}
        className={cn(
          "flex h-10 items-center gap-(--spacing-3) rounded-(--radius-lg) px-(--spacing-3) text-(length:--text-sm) font-medium transition-[background,border-color,color] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] hover:bg-(--color-surface-offset)",
          isActive
            ? "border border-(--color-border) bg-(--color-primary-highlight) text-(--color-text) shadow-[var(--shadow-sm)]"
            : "text-(--color-text-muted) hover:text-(--color-text)",
        )}
        aria-current={isActive ? "page" : undefined}
        onClick={onNavigate}
      >
        {itemIcon}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      </a>
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-(--spacing-3)">
      <nav className="flex flex-col gap-(--spacing-1)" aria-label="Workspace">
        {navigationItems.map(renderNavigationItem)}
      </nav>

      {isAdmin ? (
        <>
          <Divider spacing="none" decorative className="my-(--spacing-1)" />
          <nav className="flex flex-col gap-(--spacing-1)" aria-label="Admin">
            {adminNavigationItems.map(renderNavigationItem)}
          </nav>
        </>
      ) : null}
    </div>
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
                "h-8 flex-1 rounded-(--radius-full) border border-transparent text-(length:--text-xs) font-semibold text-(--color-text-muted) transition-[background,border-color,color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] hover:border-(--color-border) hover:bg-(--color-surface-offset) hover:text-(--color-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)",
                textScale === option.value &&
                  "border-(--color-primary)/40 bg-(--color-primary-highlight) text-(--color-text) shadow-[var(--shadow-sm)]",
              )}
              aria-pressed={textScale === option.value}
              onClick={() => setTextScale(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-10 items-center justify-between gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) px-(--spacing-3) transition-[background,border-color] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] hover:border-(--color-primary)/40 hover:bg-(--color-surface-offset)">
        <Text size="xs" tone="muted" weight="medium">
          Contrasto aumentato
        </Text>
        <Toggle
          checked={highContrast}
          onCheckedChange={setHighContrast}
          size="sm"
          aria-label={
            highContrast
              ? "Disattiva contrasto aumentato"
              : "Attiva contrasto aumentato"
          }
        />
      </div>
    </div>
  );
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const isWhite = theme === "white";

  return (
    <div className="flex h-10 items-center justify-between gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) px-(--spacing-3) transition-[background,border-color] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] hover:border-(--color-primary)/40 hover:bg-(--color-surface-offset)">
      <Text size="xs" tone="muted" weight="medium">
        Tema
      </Text>
      <Toggle
        checked={isWhite}
        onCheckedChange={(checked) => setTheme(checked ? "white" : "dark")}
        size="sm"
        iconChecked={<Sun size={10} weight="bold" />}
        iconUnchecked={<Moon size={10} weight="bold" />}
        aria-label={isWhite ? "Attiva tema scuro" : "Attiva tema chiaro"}
      />
    </div>
  );
}

function UserMenu({ user }: { user: WorkspaceUserSummary }) {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/dev-auth", { method: "DELETE" }).catch(() => null);

      if (process.env.NODE_ENV === "development" && !isSignedIn) {
        window.location.assign("/sign-in");
        return;
      }

      await signOut({ redirectUrl: "/sign-in" });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[workspace] logout failed", error);
      }

      window.location.assign("/sign-in");
    }
  }

  return (
    <details className="group/user-menu overflow-hidden rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface-2) p-(--spacing-3) shadow-[var(--shadow-sm)]">
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
          <span className="workspace-sidebar-profile-email text-(length:--text-xs) text-(--color-text-muted)">
            <span className="workspace-sidebar-profile-email__text">
              {user.email}
            </span>
          </span>
        </span>
        <Icon
          icon={CaretDown}
          size="sm"
          className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-qoovex)] group-open/user-menu:rotate-180"
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

        <ThemeSwitch />

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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-(--color-error)"
            iconLeft={<SignOut size={14} />}
            loading={isLoggingOut}
            loadingLabel="Uscita..."
            onClick={handleLogout}
          >
            Esci
          </Button>
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
      <div className="flex items-center gap-(--spacing-3)">
        <Image
          src="/logo-icon/qoovex-icona-bianca-no-sfondo.svg"
          alt=""
          width={28}
          height={28}
          className="size-7 shrink-0"
          priority
        />
        <Text size="sm" weight="semibold" className="min-w-0 truncate">
          Qoovex
        </Text>
      </div>

      <Divider spacing="none" decorative className="my-(--spacing-5)" />

      <WorkspaceSidebarNavigation
        isAdmin={user.isAdmin}
        onNavigate={onNavigate}
      />

      <div className="mt-(--spacing-5) grid gap-(--spacing-3)">
        <UserMenu user={user} />
      </div>
    </div>
  );
}
