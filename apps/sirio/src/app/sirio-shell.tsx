'use client';

import qoovexIcon from '@qoovex/brand/logo-Icon/qoovex-icona-nera-no-sfondo.svg';

/* eslint-disable @next/next/no-img-element -- Qoovex brand SVGs are canonical assets and must be rendered directly. */

import {
  AppShell,
  MobileNav,
  Navbar,
  type NavigationItem,
  type NavigationLinkRenderer
} from '@qoovex/ui/web';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type StaticSvgImport = string | { src: string };

const qoovexIconAsset = qoovexIcon as StaticSvgImport;
const qoovexIconSrc =
  typeof qoovexIconAsset === 'string' ? qoovexIconAsset : qoovexIconAsset.src;

const routes: readonly NavigationItem[] = [
  { id: 'direction', href: '/', label: 'Scope e direzione' },
  { id: 'components', href: '/components', label: 'Componenti' }
];

const renderLink: NavigationLinkRenderer = (item, props) => (
  <Link {...props} href={item.href} />
);

export function SirioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeId = pathname === '/components' ? 'components' : 'direction';

  return (
    <AppShell
      mainId="main-content"
      header={
        <Navbar
          sticky
          brand={
            <Link className="sirio-brand" href="/" aria-label="Sirio, pagina iniziale">
              <img src={qoovexIconSrc} width={30} height={30} alt="" aria-hidden="true" />
              <span>
                <strong>Sirio</strong>
                <small>Pre-Service Brain</small>
              </span>
            </Link>
          }
          items={routes}
          activeId={activeId}
          renderLink={renderLink}
          status={<span className="sirio-status"><i /> Direzione candidata</span>}
          mobileNavigation={
            <MobileNav
              items={routes}
              activeId={activeId}
              renderLink={renderLink}
              title="Menu Sirio"
              description="Vai a una sezione"
            />
          }
        />
      }
      footer={
        <footer className="site-footer">
          <span>Qoovex / Pre-Service Brain</span>
          <span>Setup · Pre-Service · Service</span>
        </footer>
      }
    >
      {children}
    </AppShell>
  );
}
