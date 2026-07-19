"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  IconChecklist,
  IconFile,
  IconPin,
  IconShare3,
  IconShieldCheck,
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
import type { WorkspaceNavigationItem } from "./workspace-navigation-policy";

const STORAGE_KEY = "qoovex.workspace.quick-links.v1";
const MAX_PINNED_LINKS = 4;

const iconByHref = {
  "/evidence": IconFile,
  "/checklists": IconChecklist,
  "/document-packages": IconShare3,
  "/access": IconShieldCheck,
} as const;

function persistPinnedLinks(storageKey: string, hrefs: string[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(hrefs));
  } catch {
    // The shortcuts still work for the current session when storage is unavailable.
  }
}

export function WorkspaceQuickLinks({
  candidates,
  current,
}: {
  candidates: readonly WorkspaceNavigationItem[];
  current: (href: string) => boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const candidateKey = candidates.map((item) => item.href).join("|");
  const storageKey = `${STORAGE_KEY}:${candidateKey}`;
  const defaultHrefs = useMemo(() => candidates.slice(0, 2).map((item) => item.href), [candidateKey]);
  const [pinnedHrefs, setPinnedHrefs] = useState(defaultHrefs);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "null") as unknown;
      if (!Array.isArray(stored)) return;
      const allowed = new Set(candidates.map((item) => item.href));
      const sanitized = stored
        .filter((href): href is string => typeof href === "string" && allowed.has(href))
        .slice(0, MAX_PINNED_LINKS);
      setPinnedHrefs(sanitized);
    } catch {
      setPinnedHrefs(defaultHrefs);
    }
  }, [candidateKey, candidates, defaultHrefs, storageKey]);

  function changePin(href: string, checked: boolean) {
    setPinnedHrefs((currentHrefs) => {
      const next = checked
        ? [...currentHrefs, href].filter((item, index, list) => list.indexOf(item) === index).slice(0, MAX_PINNED_LINKS)
        : currentHrefs.filter((item) => item !== href);
      persistPinnedLinks(storageKey, next);
      return next;
    });
  }

  if (!candidates.length) return null;
  const pinned = pinnedHrefs
    .map((href) => candidates.find((item) => item.href === href))
    .filter((item): item is WorkspaceNavigationItem => Boolean(item));
  const atLimit = pinned.length >= MAX_PINNED_LINKS;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Collegamenti rapidi</SidebarGroupLabel>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<SidebarGroupAction aria-label="Personalizza collegamenti rapidi" title="Personalizza collegamenti rapidi" />}
        >
          <IconPin />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-64" side="right">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span>Collegamenti rapidi</span>
              <span className="font-normal">Scegli fino a {MAX_PINNED_LINKS} link da tenere nella sidebar.</span>
            </DropdownMenuLabel>
            {candidates.map((item) => {
              const checked = pinnedHrefs.includes(item.href);
              const Icon = iconByHref[item.href as keyof typeof iconByHref] ?? IconFile;
              return (
                <DropdownMenuCheckboxItem
                  checked={checked}
                  disabled={!checked && atLimit}
                  key={item.href}
                  onCheckedChange={(nextChecked) => changePin(item.href, nextChecked)}
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
          {pinned.map((item) => {
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
