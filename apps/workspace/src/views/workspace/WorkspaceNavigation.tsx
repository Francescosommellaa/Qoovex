"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkspaceRole } from "./workspace-records";
import type { SupportContext } from "@qoovex/types";
import { WorkspaceLogoutButton } from "./WorkspaceSessionControls";
import styles from "./WorkspaceShell.module.css";

const navItems = [
  { label: "Dashboard", href: "/dashboard", roles: ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] },
  { label: "Notifiche", href: "/notifications", roles: ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] },
  { label: "Documenti", href: "/documents", roles: ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] },
  { label: "Scadenze", href: "/deadlines", roles: ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] },
  { label: "Lavoratori", href: "/workers", roles: ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] },
  { label: "Cantieri", href: "/job-sites", roles: ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] },
  { label: "Checklist", href: "/checklists", roles: ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER"] },
  { label: "Prove", href: "/evidence", roles: ["OWNER", "ADMIN", "SAFETY_CONSULTANT", "SITE_MANAGER", "WORKER"] },
  { label: "Pacchetti", href: "/document-packages", roles: ["OWNER", "ADMIN", "SAFETY_CONSULTANT"] },
  { label: "Accessi", href: "/access", roles: ["OWNER", "ADMIN"] },
  { label: "Audit", href: "/audit-log", roles: ["OWNER"] },
  { label: "Controllo dati", href: "/data-control", roles: ["OWNER"] },
] as const;

const platformNavItems = [
  { label: "Panoramica", href: "/qoovex-admin" },
  { label: "Utenti", href: "/qoovex-admin/users" },
  { label: "Aziende", href: "/qoovex-admin/organizations" },
  { label: "Errori", href: "/qoovex-admin/errors" },
] as const;

export function WorkspaceNavigation({ role, platformRole, support, authenticated }: { role: WorkspaceRole | null; platformRole: "USER" | "SUPER_ADMIN" | null; support: SupportContext | null; authenticated: boolean }) {
  const pathname = usePathname();
  const isPlatformConsole = pathname.startsWith("/qoovex-admin");
  if (isPlatformConsole && platformRole === "SUPER_ADMIN") {
    return (
      <nav className={styles.nav} aria-label="Navigazione Console Qoovex">
        {platformNavItems.map((item) => <Link aria-current={pathname === item.href || (item.href !== "/qoovex-admin" && pathname.startsWith(`${item.href}/`)) ? "page" : undefined} href={item.href} key={item.href}>{item.label}</Link>)}
        {support ? <Link href="/dashboard">Azienda assistita</Link> : null}
        <WorkspaceLogoutButton />
      </nav>
    );
  }
  const visibleItems = navItems.filter((item) => role && (item.roles as readonly WorkspaceRole[]).includes(role));
  return (
    <nav className={styles.nav} aria-label="Navigazione workspace">
      {platformRole === "SUPER_ADMIN" ? <Link href="/qoovex-admin">Console Qoovex</Link> : null}
      {visibleItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link aria-current={active ? "page" : undefined} href={item.href} key={item.href}>
            {item.label}
          </Link>
        );
      })}
      {authenticated ? <WorkspaceLogoutButton /> : null}
    </nav>
  );
}
