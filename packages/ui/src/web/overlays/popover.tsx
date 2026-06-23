'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { ReactElement, ReactNode, Ref } from 'react';

import { cx } from '../primitives/utils';

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: ReactElement;
  children: ReactNode;
  'aria-label': string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  collisionPadding?: number;
  modal?: boolean;
  className?: string;
  contentRef?: Ref<HTMLDivElement>;
}

export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  children,
  'aria-label': ariaLabel,
  side = 'bottom',
  align = 'center',
  collisionPadding = 12,
  modal = false,
  className,
  contentRef
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={contentRef}
          className={cx('qv-popover', className)}
          aria-label={ariaLabel}
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={collisionPadding}
        >
          {children}
          <PopoverPrimitive.Arrow className="qv-popover__arrow" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
