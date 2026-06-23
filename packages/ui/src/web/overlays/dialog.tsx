'use client';

import { X } from '@phosphor-icons/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useState
} from 'react';

import { IconButton } from '../primitives/button';
import { Heading, Text } from '../primitives/typography';
import { cx } from '../primitives/utils';

interface DialogBaseProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  closeOnInteractOutside?: boolean;
  className?: string;
  contentRef?: Ref<HTMLDivElement>;
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function useIsolatedContentRef(forwardedRef: Ref<HTMLDivElement> | undefined) {
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      setContent(node);
      setRef(forwardedRef, node);
    },
    [forwardedRef]
  );

  useEffect(() => {
    if (!content) return;
    const portal = content.parentElement;
    const previous = [...document.body.children]
      .filter((element) => element !== portal && !element.contains(content))
      .map((element) => ({
        element: element as HTMLElement,
        ariaHidden: element.getAttribute('aria-hidden'),
        inert: element.hasAttribute('inert')
      }));

    for (const { element } of previous) {
      element.setAttribute('aria-hidden', 'true');
      element.setAttribute('inert', '');
    }

    return () => {
      for (const { element, ariaHidden, inert } of previous) {
        if (ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
        if (!inert) element.removeAttribute('inert');
      }
    };
  }, [content]);

  return ref;
}

export interface ModalProps extends DialogBaseProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  closeLabel = 'Chiudi finestra',
  closeOnInteractOutside = true,
  size = 'md',
  className,
  contentRef
}: ModalProps) {
  const isolatedRef = useIsolatedContentRef(contentRef);
  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="qv-overlay" />
        <DialogPrimitive.Content
          ref={isolatedRef}
          className={cx('qv-modal', className)}
          data-size={size}
          onPointerDownOutside={(event) => {
            if (!closeOnInteractOutside) event.preventDefault();
          }}
        >
          <header className="qv-overlay-panel__header">
            <div>
              <DialogPrimitive.Title asChild>
                <Heading as="h2" size="heading-md">
                  {title}
                </Heading>
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description asChild>
                  <Text size="body-sm" tone="muted">
                    {description}
                  </Text>
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close asChild>
              <IconButton variant="ghost" icon={<X />} aria-label={closeLabel} />
            </DialogPrimitive.Close>
          </header>
          <div className="qv-overlay-panel__body">{children}</div>
          {footer ? <footer className="qv-overlay-panel__footer">{footer}</footer> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export interface DrawerProps extends DialogBaseProps {
  side?: 'left' | 'right' | 'bottom';
}

export function Drawer({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  closeLabel = 'Chiudi pannello',
  closeOnInteractOutside = true,
  side = 'right',
  className,
  contentRef
}: DrawerProps) {
  const isolatedRef = useIsolatedContentRef(contentRef);
  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="qv-overlay" />
        <DialogPrimitive.Content
          ref={isolatedRef}
          className={cx('qv-drawer', className)}
          data-side={side}
          onPointerDownOutside={(event) => {
            if (!closeOnInteractOutside) event.preventDefault();
          }}
        >
          <header className="qv-overlay-panel__header">
            <div>
              <DialogPrimitive.Title asChild>
                <Heading as="h2" size="heading-md">
                  {title}
                </Heading>
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description asChild>
                  <Text size="body-sm" tone="muted">
                    {description}
                  </Text>
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close asChild>
              <IconButton variant="ghost" icon={<X />} aria-label={closeLabel} />
            </DialogPrimitive.Close>
          </header>
          <div className="qv-overlay-panel__body">{children}</div>
          {footer ? <footer className="qv-overlay-panel__footer">{footer}</footer> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
