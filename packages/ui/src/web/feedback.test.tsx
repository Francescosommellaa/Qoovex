import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { readFileSync } from 'node:fs';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Alert,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Progress,
  Skeleton,
  Spinner,
  ToastProvider,
  useToast
} from './index';

function ToastHarness() {
  const { toast } = useToast();
  return (
    <>
      <Button onClick={() => toast({ tone: 'success', title: 'Salvato' })}>Success</Button>
      <Button onClick={() => toast({ tone: 'loading', title: 'Caricamento' })}>Loading</Button>
      <Button
        onClick={() => {
          toast({ title: 'Uno' });
          toast({ title: 'Due' });
          toast({ title: 'Tre' });
          toast({ title: 'Quattro' });
        }}
      >
        Four
      </Button>
    </>
  );
}

describe('canonical feedback components', () => {
  afterEach(() => vi.useRealTimers());

  it('preserves alert props and ref while keeping live announcements explicit', async () => {
    const ref = createRef<HTMLDivElement>();
    const dismiss = vi.fn();
    const user = userEvent.setup();
    render(
      <Alert
        ref={ref}
        className="consumer"
        tone="danger"
        live="assertive"
        title="Errore"
        onDismiss={dismiss}
      >
        Riprova.
      </Alert>
    );
    expect(ref.current).toHaveClass('qv-alert', 'consumer');
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    await user.click(screen.getByRole('button', { name: 'Chiudi avviso' }));
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('keeps static alerts out of live regions', () => {
    render(<Alert title="Nota">Contenuto persistente.</Alert>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Contenuto persistente.').closest('.qv-alert')).not.toHaveAttribute(
      'aria-live'
    );
  });

  it('labels spinners, hides skeletons and composes loading states', () => {
    const { rerender } = render(<Spinner label="Calcolo in corso" />);
    expect(screen.getByRole('status', { name: 'Calcolo in corso' })).toBeInTheDocument();
    rerender(
      <>
        <Skeleton data-testid="skeleton" />
        <LoadingState mode="skeleton" label="Caricamento riepilogo" skeletonCount={2} />
      </>
    );
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
    expect(
      screen.getByRole('status', { name: 'Caricamento riepilogo' }).querySelectorAll('.qv-skeleton')
    ).toHaveLength(2);
  });

  it('renders empty/error actions and native progress semantics', () => {
    render(
      <>
        <EmptyState title="Nessun dato" primaryAction={<Button>Aggiungi</Button>} />
        <ErrorState title="Errore" primaryAction={<Button>Riprova</Button>} />
        <Progress label="Completamento" value={25} max={50} showValue />
      </>
    );
    expect(screen.getByRole('button', { name: 'Aggiungi' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Riprova' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Completamento' })).toHaveAttribute(
      'value',
      '25'
    );
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('limits the toast queue and keeps loading notifications persistent', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider max={3}>
        <ToastHarness />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Four' }));
    expect(screen.queryByText('Uno')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Due|Tre|Quattro/)).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Loading' }));
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText('Caricamento')).toBeInTheDocument();
  });

  it('has no automated accessibility violations', async () => {
    const { container } = render(
      <main>
        <Alert tone="info" title="Nota">
          Dettaglio
        </Alert>
        <LoadingState label="Caricamento" />
        <EmptyState
          title="Vuoto"
          description="Nessun elemento"
          primaryAction={<Button>Aggiungi</Button>}
        />
        <Progress label="Avanzamento" value={40} />
      </main>
    );
    expect((await axe.run(container)).violations).toEqual([]);
  });

  it('uses only generated foundation variables in feedback CSS', () => {
    const css = readFileSync('styles/components/feedback.css', 'utf8');
    const tokens = readFileSync('styles/tokens.css', 'utf8');
    const defined = new Set([...tokens.matchAll(/(--qv-[\w-]+)\s*:/g)].map((match) => match[1]));
    const used = [...new Set([...css.matchAll(/var\((--qv-[\w-]+)/g)].map((match) => match[1]))];
    expect(used.filter((token) => !defined.has(token))).toEqual([]);
  });
});
