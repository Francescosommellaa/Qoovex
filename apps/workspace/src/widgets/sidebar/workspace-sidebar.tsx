"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QoovexMark } from "@qoovex/brand/qoovex-mark";
import {
  BookOpen,
  CaretDown,
  ChartBar,
  ClipboardText,
  ForkKnife,
  GearSix,
  ListChecks,
  MagnifyingGlass,
  SignOut,
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
  return user.firstName || user.username || user.email;
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
      <Link
        key={item.label}
        href={item.href}
        prefetch
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
      </Link>
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

function UserMenu({
  user,
  onNavigate,
}: {
  user: WorkspaceUserSummary;
  onNavigate?: () => void;
}) {
  const isSignedIn = true;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const menuId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/dev-auth", { method: "DELETE" }).catch(() => null);

      if (process.env.NODE_ENV === "development" && !isSignedIn) {
        window.location.assign("/sign-in");
        return;
      }

      await signOut({ callbackUrl: "/sign-in" });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[workspace] logout failed", error);
      }

      window.location.assign("/sign-in");
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn("group/user-menu relative shrink-0", open && "z-(--z-dropdown)")}
    >
      <button
        type="button"
        data-state={open ? "open" : "closed"}
        className="flex w-full cursor-pointer items-center gap-(--spacing-3) rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface-2) p-(--spacing-3) text-left shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] hover:border-(--color-primary)/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) data-[state=open]:border-(--color-primary)/30 data-[state=open]:shadow-[var(--shadow-md)]"
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
      >
        <Avatar
          src={user.imageUrl ?? undefined}
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
          className={cn(
            "transition-transform duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          className="absolute bottom-full left-0 right-0 mb-(--spacing-2) grid max-h-[min(28rem,calc(100dvh-var(--spacing-12)))] gap-(--spacing-3) overflow-y-auto rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface-2) p-(--spacing-3) shadow-[var(--shadow-lg)]"
          role="dialog"
          aria-label="Menu profilo"
        >
          <div className="flex items-center justify-between gap-(--spacing-3)">
            <Text size="xs" tone="muted">
              Piano
            </Text>
            <Badge size="sm" variant="soft" tone="primary">
              {planLabel[user.plan]}
            </Badge>
          </div>

          <AccessibilityControls />

          <div className="grid gap-(--spacing-2) border-t border-(--color-divider) pt-(--spacing-3)">
            <Button
              as="a"
              href="/settings"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              iconLeft={<GearSix size={14} />}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
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
      ) : null}
    </div>
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
        <QoovexMark width={28} height={28} className="size-7 shrink-0" />
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
        <UserMenu user={user} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
