'use client';

import { List } from '@phosphor-icons/react';
import {
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useState
} from 'react';

import { Drawer } from '../overlays/dialog';
import { IconButton } from '../primitives/button';
import { cx } from '../primitives/utils';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export interface NavigationLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export type NavigationLinkRenderer = (
  item: NavigationItem,
  props: NavigationLinkProps
) => ReactNode;

function renderNavigationLink(
  item: NavigationItem,
  activeId: string | undefined,
  renderLink: NavigationLinkRenderer | undefined,
  onNavigate?: () => void
) {
  const props: NavigationLinkProps = {
    href: item.href,
    className: 'qv-navigation-link',
    'aria-current': activeId === item.id ? 'page' : undefined,
    onClick: onNavigate,
    children: (
      <>
        {item.icon ? <span className="qv-navigation-link__icon" aria-hidden="true">{item.icon}</span> : null}
        <span className="qv-navigation-link__label">{item.label}</span>
        {item.badge ? <span className="qv-navigation-link__badge">{item.badge}</span> : null}
      </>
    )
  };

  return renderLink ? renderLink(item, props) : <a {...props} />;
}

export interface NavbarProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  ref?: Ref<HTMLElement>;
  brand: ReactNode;
  items: readonly NavigationItem[];
  activeId?: string;
  renderLink?: NavigationLinkRenderer;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  status?: ReactNode;
  mobileNavigation?: ReactNode;
  sticky?: boolean;
  navigationLabel?: string;
}

export function Navbar({
  ref,
  brand,
  items,
  activeId,
  renderLink,
  primaryAction,
  secondaryAction,
  status,
  mobileNavigation,
  sticky = false,
  navigationLabel = 'Navigazione principale',
  className,
  ...props
}: NavbarProps) {
  return (
    <header ref={ref} className={cx('qv-navbar', className)} data-sticky={sticky || undefined} {...props}>
      <div className="qv-navbar__brand">{brand}</div>
      <nav className="qv-navbar__navigation" aria-label={navigationLabel}>
        {items.map((item) => (
          <span className="qv-navbar__item" key={item.id}>
            {renderNavigationLink(item, activeId, renderLink)}
          </span>
        ))}
      </nav>
      <div className="qv-navbar__end">
        {status ? <div className="qv-navbar__status">{status}</div> : null}
        {secondaryAction ? <div className="qv-navbar__secondary-action">{secondaryAction}</div> : null}
        {primaryAction ? <div className="qv-navbar__primary-action">{primaryAction}</div> : null}
        {mobileNavigation ? <div className="qv-navbar__mobile">{mobileNavigation}</div> : null}
      </div>
    </header>
  );
}

export interface MobileNavProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  ref?: Ref<HTMLElement>;
  items: readonly NavigationItem[];
  activeId?: string;
  renderLink?: NavigationLinkRenderer;
  trigger?: ReactElement;
  action?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  triggerLabel?: string;
  closeLabel?: string;
  navigationLabel?: string;
}

export function MobileNav({
  ref,
  items,
  activeId,
  renderLink,
  trigger,
  action,
  open,
  defaultOpen = false,
  onOpenChange,
  title = 'Navigazione',
  description,
  triggerLabel = 'Apri menu',
  closeLabel = 'Chiudi menu',
  navigationLabel = 'Navigazione mobile',
  className,
  ...props
}: MobileNavProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const currentOpen = open ?? internalOpen;
  const setOpen = (nextOpen: boolean) => {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <Drawer
      open={currentOpen}
      onOpenChange={setOpen}
      side="right"
      title={title}
      description={description}
      closeLabel={closeLabel}
      trigger={trigger ?? <IconButton variant="ghost" icon={<List />} aria-label={triggerLabel} />}
      footer={action}
    >
      <nav ref={ref} className={cx('qv-mobile-nav', className)} aria-label={navigationLabel} {...props}>
        {items.map((item) => (
          <span className="qv-mobile-nav__item" key={item.id}>
            {renderNavigationLink(item, activeId, renderLink, () => setOpen(false))}
          </span>
        ))}
      </nav>
    </Drawer>
  );
}
