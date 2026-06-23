'use client';

import { X } from '@phosphor-icons/react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import {
  createContext,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

import { IconButton } from '../primitives/button';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger' | 'loading';
interface ToastBaseInput {
  tone?: ToastTone;
  title: ReactNode;
  description?: ReactNode;
  duration?: number;
}
type ToastAction =
  | { action?: undefined; actionAltText?: never }
  | { action: ReactElement; actionAltText: string };
export type ToastInput = ToastBaseInput & ToastAction;
type ToastRecord = ToastInput & { id: string };
interface ToastContextValue {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let toastSequence = 0;
const durations: Record<ToastTone, number> = {
  info: 5000,
  success: 5000,
  warning: 8000,
  danger: 8000,
  loading: 2_147_483_647
};

export interface ToastProviderProps {
  children: ReactNode;
  max?: number;
  label?: string;
}

export function ToastProvider({ children, max = 3, label = 'Notifiche' }: ToastProviderProps) {
  const [items, setItems] = useState<ToastRecord[]>([]);
  const dismiss = useCallback(
    (id: string) => setItems((current) => current.filter((item) => item.id !== id)),
    []
  );
  const toast = useCallback(
    (input: ToastInput) => {
      const id = `qv-toast-${++toastSequence}`;
      setItems((current) => [...current, { ...input, id }].slice(-max));
      return id;
    },
    [max]
  );
  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider label={label} swipeDirection="right">
        {children}
        {items.map((item) => {
          const tone = item.tone ?? 'info';
          return (
            <ToastPrimitive.Root
              key={item.id}
              className="qv-toast"
              data-tone={tone}
              type={tone === 'danger' ? 'foreground' : 'background'}
              duration={item.duration ?? durations[tone]}
              onOpenChange={(open) => {
                if (!open) dismiss(item.id);
              }}
            >
              <div className="qv-toast__content">
                <ToastPrimitive.Title className="qv-toast__title">
                  {item.title}
                </ToastPrimitive.Title>
                {item.description ? (
                  <ToastPrimitive.Description className="qv-toast__description">
                    {item.description}
                  </ToastPrimitive.Description>
                ) : null}
              </div>
              {item.action ? (
                <ToastPrimitive.Action asChild altText={item.actionAltText}>
                  {item.action}
                </ToastPrimitive.Action>
              ) : null}
              <ToastPrimitive.Close asChild>
                <IconButton
                  className="qv-toast__close"
                  variant="ghost"
                  size="sm"
                  icon={<X />}
                  aria-label="Chiudi notifica"
                />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="qv-toast-viewport" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve essere usato dentro ToastProvider');
  return context;
}
