import type { HTMLAttributes, ReactNode, Ref } from 'react';

import { Container } from '../primitives/layout';
import { cx } from '../primitives/utils';

export interface AppShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  header?: ReactNode;
  rail?: ReactNode;
  railLabel?: string;
  support?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  mainId?: string;
  mainLabel?: string;
  skipLabel?: string;
  contentWidth?: 'page' | 'full';
}

export function AppShell({
  ref,
  header,
  rail,
  railLabel = 'Navigazione secondaria',
  support,
  footer,
  children,
  mainId = 'qv-main-content',
  mainLabel,
  skipLabel = 'Vai al contenuto',
  contentWidth = 'full',
  className,
  ...props
}: AppShellProps) {
  return (
    <div ref={ref} className={cx('qv-app-shell', className)} {...props}>
      <a className="qv-app-shell__skip-link" href={`#${mainId}`}>{skipLabel}</a>
      {header}
      {support ? <div className="qv-app-shell__support">{support}</div> : null}
      <div className="qv-app-shell__body" data-has-rail={Boolean(rail) || undefined}>
        {rail ? <aside className="qv-app-shell__rail" aria-label={railLabel}>{rail}</aside> : null}
        <main id={mainId} className="qv-app-shell__main" aria-label={mainLabel} tabIndex={-1}>
          {contentWidth === 'page' ? <Container size="page">{children}</Container> : children}
        </main>
      </div>
      {footer}
    </div>
  );
}
