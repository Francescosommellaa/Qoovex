import { X } from '@phosphor-icons/react';
import type { HTMLAttributes, ReactNode, Ref } from 'react';

import { IconButton } from '../primitives/button';
import { cx } from '../primitives/utils';

export type AlertTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type AlertLive = 'off' | 'polite' | 'assertive';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  ref?: Ref<HTMLDivElement>;
  tone?: AlertTone;
  title?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  live?: AlertLive;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export function Alert({
  ref,
  tone = 'neutral',
  title,
  icon,
  action,
  live = 'off',
  onDismiss,
  dismissLabel = 'Chiudi avviso',
  children,
  className,
  ...props
}: AlertProps) {
  const role = live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined;
  return (
    <div
      ref={ref}
      className={cx('qv-alert', className)}
      data-tone={tone}
      role={role}
      aria-live={live === 'off' ? undefined : live}
      {...props}
    >
      {icon ? (
        <span className="qv-alert__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="qv-alert__content">
        {title ? <strong className="qv-alert__title">{title}</strong> : null}
        {children ? <div className="qv-alert__description">{children}</div> : null}
      </div>
      {action ? <div className="qv-alert__action">{action}</div> : null}
      {onDismiss ? (
        <IconButton
          className="qv-alert__dismiss"
          variant="ghost"
          size="sm"
          icon={<X />}
          aria-label={dismissLabel}
          onClick={onDismiss}
        />
      ) : null}
    </div>
  );
}
