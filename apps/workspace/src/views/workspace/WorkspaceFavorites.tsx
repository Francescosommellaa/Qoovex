"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconBuilding,
  IconBuildingCommunity,
  IconCalendarDue,
  IconChecklist,
  IconFile,
  IconFileAlert,
  IconPackage,
  IconPhoto,
  IconPin,
  IconUsers,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@qoovex/ui/components/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@qoovex/ui/components/sidebar";
import type { WorkspaceRole } from "./workspace-records";
import type { WorkspaceFavoritesModel, WorkspaceNavigationItem } from "./workspace-navigation-policy";

export const MAX_FAVORITES = 4;
export const FAVORITES_STORAGE_KEY_PREFIX = "qoovex.workspace.favorites.v2";
const LEGACY_STORAGE_KEY_PREFIX = "qoovex.workspace.quick-links.v1";

interface FavoritesStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const iconByHref = {
  "/documents?view=attention": IconFileAlert,
  "/deadlines": IconCalendarDue,
  "/checklists?view=open": IconChecklist,
  "/evidence?sort=recent": IconPhoto,
  "/document-packages?view=ready": IconPackage,
  "/documents/company?view=attention": IconBuildingCommunity,
  "/documents/workers?view=attention": IconUsers,
  "/documents/job-sites?view=attention": IconBuilding,
} as const;

export function favoritesStorageKey(role: WorkspaceRole) {
  return `${FAVORITES_STORAGE_KEY_PREFIX}:${role}`;
}

function legacyStorageKey(role: WorkspaceRole) {
  const legacyCandidates: Record<WorkspaceRole, string[]> = {
    OWNER: ["/deadlines", "/evidence", "/checklists", "/document-packages"],
    ADMIN: ["/deadlines", "/evidence", "/checklists", "/document-packages"],
    SAFETY_CONSULTANT: ["/deadlines", "/evidence", "/checklists", "/document-packages"],
    SITE_MANAGER: ["/deadlines", "/evidence", "/checklists"],
    WORKER: ["/deadlines", "/evidence"],
  };
  return `${LEGACY_STORAGE_KEY_PREFIX}:${legacyCandidates[role].join("|")}`;
}

export function sanitizeFavoriteHrefs(value: unknown, candidates: readonly WorkspaceNavigationItem[]) {
  if (!Array.isArray(value)) return null;
  const allowed = new Set(candidates.map((item) => item.href));
  const sanitized = value
    .filter((href): href is string => typeof href === "string" && allowed.has(href))
    .filter((href, index, hrefs) => hrefs.indexOf(href) === index)
    .slice(0, MAX_FAVORITES);
  return value.length > 0 && sanitized.length === 0 ? null : sanitized;
}

function parseStoredFavorites(raw: string | null, candidates: readonly WorkspaceNavigationItem[]) {
  if (raw === null) return null;
  try {
    return sanitizeFavoriteHrefs(JSON.parse(raw) as unknown, candidates);
  } catch {
    return null;
  }
}

function parseLegacyFavorites(raw: string | null, candidates: readonly WorkspaceNavigationItem[]) {
  if (raw === null) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return null;
    const migratedHrefs = value.map((href) => {
      if (href === "/evidence") return "/evidence?sort=recent";
      if (href === "/checklists") return "/checklists?view=open";
      if (href === "/document-packages") return "/document-packages?view=ready";
      return href;
    });
    return sanitizeFavoriteHrefs(migratedHrefs, candidates);
  } catch {
    return null;
  }
}

function persistFavorites(storage: FavoritesStorage, storageKey: string, hrefs: readonly string[]) {
  try {
    storage.setItem(storageKey, JSON.stringify(hrefs));
  } catch {
    // I Preferiti restano disponibili per la sessione quando lo storage non e accessibile.
  }
}

export function loadFavoriteHrefs(
  storage: FavoritesStorage,
  favorites: WorkspaceFavoritesModel,
) {
  if (!favorites.role) return [];
  const storageKey = favoritesStorageKey(favorites.role);
  try {
    const currentRaw = storage.getItem(storageKey);
    if (currentRaw !== null) {
      const current = parseStoredFavorites(currentRaw, favorites.candidates) ?? favorites.defaultHrefs;
      persistFavorites(storage, storageKey, current);
      return [...current];
    }

    const legacy = parseLegacyFavorites(storage.getItem(legacyStorageKey(favorites.role)), favorites.candidates);
    const migrated = legacy ?? favorites.defaultHrefs;
    persistFavorites(storage, storageKey, migrated);
    return [...migrated];
  } catch {
    return [...favorites.defaultHrefs];
  }
}

export function WorkspaceFavorites({
  favorites,
  current,
}: {
  favorites: WorkspaceFavoritesModel;
  current: (href: string) => boolean;
}) {
  const { isMobile, setOpenMobile, state } = useSidebar();
  const { candidates, defaultHrefs, role } = favorites;
  const [favoriteHrefs, setFavoriteHrefs] = useState(defaultHrefs);

  useEffect(() => {
    setFavoriteHrefs(loadFavoriteHrefs(window.localStorage, favorites));
  }, [favorites]);

  function changeFavorite(href: string, checked: boolean) {
    if (!role) return;
    setFavoriteHrefs((currentHrefs) => {
      const next = checked
        ? currentHrefs.length >= MAX_FAVORITES || currentHrefs.includes(href) ? currentHrefs : [...currentHrefs, href]
        : currentHrefs.filter((item) => item !== href);
      persistFavorites(window.localStorage, favoritesStorageKey(role), next);
      return next;
    });
  }

  if (!candidates.length) return null;
  const selectedFavorites = favoriteHrefs
    .map((href) => candidates.find((item) => item.href === href))
    .filter((item): item is WorkspaceNavigationItem => Boolean(item));
  const atLimit = selectedFavorites.length >= MAX_FAVORITES;
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup aria-label="Preferiti" role="group">
      <SidebarGroupLabel>Preferiti</SidebarGroupLabel>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={collapsed
            ? <SidebarMenuButton aria-label="Personalizza Preferiti" tooltip="Personalizza Preferiti" />
            : <SidebarGroupAction aria-label="Personalizza Preferiti" title="Personalizza Preferiti" />}
        >
          <IconPin />
          {collapsed ? <span className="sr-only">Personalizza Preferiti</span> : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-64" side="right">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span>Preferiti</span>
              <span className="font-normal">Scegli fino a {MAX_FAVORITES} viste da tenere nella sidebar.</span>
            </DropdownMenuLabel>
            {candidates.map((item) => {
              const checked = favoriteHrefs.includes(item.href);
              const Icon = iconByHref[item.href as keyof typeof iconByHref] ?? IconFile;
              return (
                <DropdownMenuCheckboxItem
                  checked={checked}
                  disabled={!checked && atLimit}
                  key={item.href}
                  onCheckedChange={(nextChecked) => changeFavorite(item.href, nextChecked)}
                >
                  <Icon />{item.label}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <SidebarGroupContent>
        <SidebarMenu>
          {selectedFavorites.map((item) => {
            const Icon = iconByHref[item.href as keyof typeof iconByHref] ?? IconFile;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={current(item.href)}
                  render={<Link href={item.href} onClick={() => { if (isMobile) setOpenMobile(false); }} />}
                  tooltip={item.label}
                >
                  <Icon /><span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
