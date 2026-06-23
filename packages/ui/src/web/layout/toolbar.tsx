import type { HTMLAttributes, ReactNode, Ref } from 'react';

import { cx } from '../primitives/utils';

export interface ToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  'aria-label': string;
  search?: ReactNode;
  filters?: ReactNode;
  secondaryActions?: ReactNode;
  primaryActions?: ReactNode;
  sticky?: boolean;
}

export function Toolbar({ ref, search, filters, secondaryActions, primaryActions, sticky = false, className, ...props }: ToolbarProps) {
  return (
    <div ref={ref} className={cx('qv-toolbar', className)} data-sticky={sticky || undefined} role="region" {...props}>
      {search ? <div className="qv-toolbar__search">{search}</div> : null}
      {filters ? <div className="qv-toolbar__filters">{filters}</div> : null}
      {secondaryActions ? <div className="qv-toolbar__secondary-actions">{secondaryActions}</div> : null}
      {primaryActions ? <div className="qv-toolbar__primary-actions">{primaryActions}</div> : null}
    </div>
  );
}
