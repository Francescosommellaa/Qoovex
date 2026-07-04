"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./WorkspaceShell.module.css";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Notifiche", href: "/notifications" },
  { label: "Documenti", href: "/documents" },
  { label: "Scadenze", href: "/deadlines" },
  { label: "Lavoratori", href: "/workers" },
  { label: "Cantieri", href: "/job-sites" },
  { label: "Checklist", href: "/checklists" },
  { label: "Prove", href: "/evidence" },
  { label: "Pacchetti", href: "/document-packages" },
] as const;

export function WorkspaceNavigation() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Navigazione workspace">
      {navItems.map((item) => {
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
