"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkspaceRole } from "./workspace-records";
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

export function WorkspaceNavigation({ role }: { role: WorkspaceRole | null }) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => role && (item.roles as readonly WorkspaceRole[]).includes(role));
  return (
    <nav className={styles.nav} aria-label="Navigazione workspace">
      {visibleItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link aria-current={active ? "page" : undefined} href={item.href} key={item.href}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
