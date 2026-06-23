import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  ActivityItem,
  CalculationTrace,
  DataPanel,
  MetricCard,
  NotificationItem,
  QuantityStatus,
  StatusBadge,
  TaskItem,
  UserCard
} from './index';

describe('canonical product and data-display components', () => {
  it('preserves props, ref and numeric rendering on MetricCard', () => {
    const ref = createRef<HTMLElement>();
    render(
      <MetricCard
        ref={ref}
        label="Approvato"
        value={35}
        description="Cotolette bambini"
        tone="success"
        data-testid="metric"
      />
    );

    expect(screen.getByTestId('metric')).toHaveAttribute('data-tone', 'success');
    expect(ref.current).toBe(screen.getByTestId('metric'));
    expect(screen.getByText('35')).toHaveAttribute('data-qv-numeric');
  });

  it('lets TaskItem update completion and expose status text', async () => {
    const onCheckedChange = vi.fn();
    render(
      <TaskItem
        title="Cotolette"
        description="35 approvate"
        status="attention"
        checked={false}
        onCheckedChange={onCheckedChange}
      />
    );

    await userEvent.click(screen.getByRole('checkbox', { name: 'Completa: Cotolette' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('attention')).toBeVisible();
  });

  it('maps StatusBadge tones from product statuses', () => {
    render(
      <>
        <StatusBadge status="verified">Verificato</StatusBadge>
        <StatusBadge status="critical">Critico</StatusBadge>
      </>
    );

    expect(screen.getByText('Verificato')).toHaveAttribute('data-tone', 'success');
    expect(screen.getByText('Critico')).toHaveAttribute('data-tone', 'danger');
  });

  it('keeps CalculationTrace independent from Sirio sample classes', () => {
    render(
      <CalculationTrace
        title="Cotolette bambini"
        input="22 bambini"
        rule="1 cad. + 10%"
        result="25"
        formula="22 × 1,10 = 24,2 → 25"
        source="Regola v3"
        data-testid="trace"
      />
    );

    const trace = screen.getByTestId('trace');
    expect(trace).toHaveClass('qv-calculation-trace');
    expect([...trace.classList]).not.toContain(`sample-${'trace'}`);
    expect(screen.getByRole('list', { name: 'Formula: 22 × 1,10 = 24,2 → 25' })).toBeVisible();
  });

  it('preserves quantity states independently', () => {
    render(
      <QuantityStatus
        items={[
          { label: 'Richiesto', value: 25 },
          { label: 'Approvato', value: 35, state: 'verified' },
          { label: 'Extra teorico', value: 3, state: 'theoretical' }
        ]}
      />
    );

    expect(screen.getByText('Richiesto')).toBeVisible();
    expect(screen.getByText('Approvato').closest('.qv-metric-card')).toHaveAttribute('data-tone', 'success');
    expect(screen.getByText('Extra teorico').closest('.qv-metric-card')).toHaveAttribute('data-tone', 'warning');
  });

  it('composes panel, notification, activity and user patterns accessibly', async () => {
    const { container } = render(
      <main>
        <DataPanel title="Produzione" description="Stato preparazioni">
          <NotificationItem title="Dato mancante" description="Orario torta" tone="warning" unread />
          <ActivityItem title="Approvazione" description="35 cotolette" actor="Marco Chef" timestamp="12:30" />
          <UserCard name="Elena Sala" email="sala@rossi.it" role="HEAD_OF_HALL" />
        </DataPanel>
      </main>
    );

    expect(screen.getByRole('heading', { name: 'Produzione' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Elena Sala' })).toBeVisible();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
