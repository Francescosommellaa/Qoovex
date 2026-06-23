import { WarningCircle } from '@phosphor-icons/react';
import type { HTMLAttributes, ReactNode, Ref } from 'react';

import { Heading, Text } from '../primitives/typography';
import { cx } from '../primitives/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerAccessibility =
  | { decorative: true; label?: never }
  | { decorative?: false; label: string };
export type SpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> &
  SpinnerAccessibility & { ref?: Ref<HTMLSpanElement>; size?: SpinnerSize };

export function Spinner({
  ref,
  size = 'md',
  decorative = false,
  label,
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      ref={ref}
      className={cx('qv-spinner', className)}
      data-size={size}
      role={decorative ? undefined : 'status'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      {...props}
    />
  );
}

export type SkeletonShape = 'text' | 'rectangular' | 'circular';
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  shape?: SkeletonShape;
}
export function Skeleton({ ref, shape = 'rectangular', className, ...props }: SkeletonProps) {
  return (
    <div
      ref={ref}
      className={cx('qv-skeleton', className)}
      data-shape={shape}
      aria-hidden="true"
      {...props}
    />
  );
}

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  mode?: 'spinner' | 'skeleton';
  label: string;
  skeletonCount?: number;
}
export function LoadingState({
  ref,
  mode = 'spinner',
  label,
  skeletonCount = 3,
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      ref={ref}
      className={cx('qv-loading-state', className)}
      data-mode={mode}
      role="status"
      aria-label={label}
      aria-busy="true"
      {...props}
    >
      {mode === 'spinner' ? (
        <>
          <Spinner decorative size="lg" />
          <Text as="span" size="body-sm" tone="muted">
            {label}
          </Text>
        </>
      ) : (
        <>
          {Array.from({ length: skeletonCount }, (_, index) => (
            <Skeleton key={index} shape="text" />
          ))}
          <span className="qv-visually-hidden">{label}</span>
        </>
      )}
    </div>
  );
}

export interface StateMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  ref?: Ref<HTMLDivElement>;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  layout?: 'compact' | 'page';
}

function StateMessage({
  ref,
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  layout = 'compact',
  className,
  tone,
  ...htmlProps
}: StateMessageProps & { tone: 'neutral' | 'danger' }) {
  return (
    <div
      ref={ref}
      className={cx('qv-state-message', className)}
      data-layout={layout}
      data-tone={tone}
      {...htmlProps}
    >
      <span className="qv-state-message__icon" aria-hidden="true">
        {icon ?? (tone === 'danger' ? <WarningCircle /> : null)}
      </span>
      <div className="qv-state-message__copy">
        <Heading
          as={layout === 'page' ? 'h2' : 'h3'}
          size={layout === 'page' ? 'heading-md' : 'heading-sm'}
        >
          {title}
        </Heading>
        {description ? (
          <Text tone="muted" size="body-sm">
            {description}
          </Text>
        ) : null}
      </div>
      {primaryAction || secondaryAction ? (
        <div className="qv-state-message__actions">
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}

export function EmptyState(props: StateMessageProps) {
  return <StateMessage tone="neutral" {...props} />;
}
export function ErrorState(props: StateMessageProps) {
  return <StateMessage tone="danger" {...props} />;
}

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  label: string;
  value?: number;
  max?: number;
  showValue?: boolean;
}
export function Progress({
  ref,
  label,
  value,
  max = 100,
  showValue = false,
  className,
  ...props
}: ProgressProps) {
  const normalized = value === undefined ? undefined : Math.min(Math.max(value, 0), max);
  const percentage = normalized === undefined ? undefined : Math.round((normalized / max) * 100);
  return (
    <div
      ref={ref}
      className={cx('qv-progress', className)}
      data-indeterminate={normalized === undefined || undefined}
      {...props}
    >
      <div className="qv-progress__label">
        <Text as="span" size="label" weight="semibold">
          {label}
        </Text>
        {showValue && percentage !== undefined ? (
          <Text as="span" size="data">
            {percentage}%
          </Text>
        ) : null}
      </div>
      <progress aria-label={label} value={normalized} max={max} />
    </div>
  );
}
