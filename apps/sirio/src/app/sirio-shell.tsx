"use client";

import { List, X } from "@phosphor-icons/react";
import { QoovexMark } from "@qoovex/brand/qoovex-mark";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

const routes = [["/", "Scope e direzione"], ["/components", "Componenti"]] as const;

export function SirioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  const close = (restore = false) => {
    setOpen(false);
    if (restore) requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <a className="skip-link" href="#main-content">Vai al contenuto</a>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Sirio, pagina iniziale"><QoovexMark width={30} height={30} /><span><strong>Sirio</strong><small>Pre-Service Brain</small></span></Link>
        <nav className="desktop-nav" aria-label="Navigazione principale">
          {routes.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
        </nav>
        <span className="status"><i /> Direzione candidata</span>
        <button ref={triggerRef} className="menu-trigger" type="button" aria-label="Apri menu" aria-expanded={open} onClick={() => setOpen(true)}><List aria-hidden="true" /></button>
      </header>
      {open ? (
        <dialog open className="mobile-menu" aria-label="Menu Sirio" onKeyDown={(event) => { if (event.key === "Escape") close(true); }}>
          <header><span>Vai a</span><button ref={closeRef} type="button" aria-label="Chiudi menu" onClick={() => close(true)}><X aria-hidden="true" /></button></header>
          <nav aria-label="Navigazione mobile">{routes.map(([href, label]) => <Link key={href} href={href} onClick={() => close()}>{label}</Link>)}</nav>
        </dialog>
      ) : null}
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="site-footer"><span>Qoovex / Pre-Service Brain</span><span>Setup · Pre-Service · Service</span></footer>
    </>
  );
}
