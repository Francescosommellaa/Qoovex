"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SupportContext } from "@qoovex/types";
import { WorkspaceLogoutButton } from "./WorkspaceSessionControls";
import type { WorkspaceNavigationModel } from "./workspace-navigation-policy";
import styles from "./WorkspaceShell.module.css";

const platformNavItems = [
  { label: "Panoramica", href: "/qoovex-admin" },
  { label: "Utenti", href: "/qoovex-admin/users" },
  { label: "Aziende", href: "/qoovex-admin/organizations" },
  { label: "Errori", href: "/qoovex-admin/errors" },
  { label: "Sicurezza", href: "/account/security" },
] as const;

interface WorkspaceNavigationProps {
  authenticated: boolean;
  navigation: WorkspaceNavigationModel;
  unreadNotificationCount: number;
  platformRole: "USER" | "SUPER_ADMIN" | null;
  support: SupportContext | null;
}

export function WorkspaceNavigation({ navigation, unreadNotificationCount, platformRole, support, authenticated }: WorkspaceNavigationProps) {
  const pathname = usePathname();
  const isPlatformConsole = pathname.startsWith("/qoovex-admin");

  const isCurrent = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  function WorkspaceLinks() {
    return (
      <>
        <div className={styles.primaryNav}>
          {navigation.primary.map((item) => (
            <Link aria-current={isCurrent(item.href) ? "page" : undefined} href={item.href} key={item.href}>{item.label}</Link>
          ))}
        </div>
        <div className={styles.navigationTools}>
          {unreadNotificationCount >= 0 && navigation.primary.length > 0 && navigation.account.some((item) => item.href === "/settings") ? (
            <Link className={styles.notificationLink} aria-current={isCurrent("/notifications") ? "page" : undefined} href="/notifications">
              <span>Notifiche</span>
              {unreadNotificationCount > 0 ? <strong aria-label={`${unreadNotificationCount} notifiche non lette`}>{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</strong> : null}
            </Link>
          ) : null}
          {navigation.add.length > 0 ? (
            <details className={styles.navMenu}>
              <summary>Aggiungi</summary>
              <div className={styles.navMenuPanel}>
                {navigation.add.map((item) => <Link href={item.href} key={`${item.href}-${item.label}`}>{item.label}</Link>)}
              </div>
            </details>
          ) : null}
          {authenticated ? (
            <details className={styles.navMenu}>
              <summary>Azienda e account</summary>
              <div className={styles.navMenuPanel}>
                {navigation.account.map((item) => <Link aria-current={isCurrent(item.href) ? "page" : undefined} href={item.href} key={item.href}>{item.label}</Link>)}
                <WorkspaceLogoutButton />
              </div>
            </details>
          ) : null}
        </div>
      </>
    );
  }

  function Links() {
    if (isPlatformConsole && platformRole === "SUPER_ADMIN") {
      return <>{platformNavItems.map((item) => <Link aria-current={pathname === item.href || (item.href !== "/qoovex-admin" && pathname.startsWith(`${item.href}/`)) ? "page" : undefined} href={item.href} key={item.href}>{item.label}</Link>)}{support ? <Link href="/dashboard">Azienda assistita</Link> : null}<WorkspaceLogoutButton /></>;
    }
    return <WorkspaceLinks />;
  }

  return (
    <nav className={styles.navigation} aria-label={isPlatformConsole ? "Navigazione Console Qoovex" : "Navigazione workspace"}>
      <div className={styles.desktopNav}><Links /></div>
      <details className={styles.mobileNav}>
        <summary>Menu</summary>
        <div className={styles.mobileNavPanel}><Links /></div>
      </details>
    </nav>
  );
}
