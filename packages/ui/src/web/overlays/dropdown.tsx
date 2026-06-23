'use client';

import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode, Ref } from 'react';

import { cx } from '../primitives/utils';

export interface DropdownProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: ReactElement;
  children: ReactNode;
  'aria-label': string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function Dropdown({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  children,
  'aria-label': ariaLabel,
  side = 'bottom',
  align = 'end'
}: DropdownProps) {
  return (
    <DropdownPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          className="qv-dropdown"
          aria-label={ariaLabel}
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={12}
        >
          {children}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}

export interface DropdownItemProps extends ComponentPropsWithoutRef<typeof DropdownPrimitive.Item> {
  ref?: Ref<HTMLDivElement>;
  icon?: ReactNode;
  shortcut?: string;
  destructive?: boolean;
}
export function DropdownItem({
  ref,
  icon,
  shortcut,
  destructive = false,
  children,
  className,
  ...props
}: DropdownItemProps) {
  return (
    <DropdownPrimitive.Item
      ref={ref}
      className={cx('qv-dropdown__item', className)}
      data-destructive={destructive || undefined}
      {...props}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
      {shortcut ? <kbd>{shortcut}</kbd> : null}
    </DropdownPrimitive.Item>
  );
}

export function DropdownLabel({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>) {
  return <DropdownPrimitive.Label className={cx('qv-dropdown__label', className)} {...props} />;
}
export function DropdownSeparator({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>) {
  return (
    <DropdownPrimitive.Separator className={cx('qv-dropdown__separator', className)} {...props} />
  );
}
