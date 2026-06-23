import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

import {
  Button,
  Drawer,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  Modal,
  Popover,
  Tooltip
} from './index';

describe('canonical overlay components', () => {
  it('traps modal focus, closes with Escape and restores the trigger', async () => {
    const user = userEvent.setup();
    render(
      <>
        <main data-testid="background">Contenuto pagina</main>
        <Modal
          title="Conferma"
          description="Verifica la decisione"
          trigger={<Button>Apri modal</Button>}
        >
          <Button>Conferma</Button>
          <Button variant="secondary">Secondaria</Button>
        </Modal>
      </>
    );
    const trigger = screen.getByRole('button', { name: 'Apri modal' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Conferma' });
    expect(dialog).toBeInTheDocument();
    expect(document.body).toHaveStyle({ overflow: 'hidden' });
    const backgroundRoot = screen.getByTestId('background').parentElement;
    expect(backgroundRoot).toHaveAttribute('inert');
    expect(backgroundRoot).toHaveAttribute('aria-hidden', 'true');
    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    expect(backgroundRoot).not.toHaveAttribute('inert');
  });

  it('can prevent outside dismissal and closes drawer from its close action', async () => {
    const user = userEvent.setup();
    render(
      <Drawer
        title="Dettaglio"
        description="Pannello operativo"
        defaultOpen
        closeOnInteractOutside={false}
      >
        <Button>Contenuto</Button>
      </Drawer>
    );
    const dialog = screen.getByRole('dialog', { name: 'Dettaglio' });
    fireEvent.pointerDown(document.body);
    expect(dialog).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Chiudi pannello' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Dettaglio' })).not.toBeInTheDocument()
    );
  });

  it('opens popover, closes with Escape and returns focus', async () => {
    const user = userEvent.setup();
    render(
      <Popover aria-label="Dettaglio" trigger={<Button>Apri dettaglio</Button>}>
        <Button>Azione contestuale</Button>
      </Popover>
    );
    const trigger = screen.getByRole('button', { name: 'Apri dettaglio' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Dettaglio' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Dettaglio' })).not.toBeInTheDocument()
    );
    expect(trigger).toHaveFocus();
  });

  it('supports dropdown arrow navigation, disabled items and Escape', async () => {
    const select = vi.fn();
    const user = userEvent.setup();
    render(
      <Dropdown aria-label="Azioni" trigger={<Button>Apri azioni</Button>}>
        <DropdownLabel>Preparazione</DropdownLabel>
        <DropdownItem onSelect={select}>Apri</DropdownItem>
        <DropdownItem disabled>Duplica</DropdownItem>
        <DropdownSeparator />
        <DropdownItem destructive>Elimina</DropdownItem>
      </Dropdown>
    );
    const trigger = screen.getByRole('button', { name: 'Apri azioni' });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(select).toHaveBeenCalledOnce();
    await user.click(trigger);
    await user.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Elimina' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });

  it('opens tooltip from keyboard focus and closes it with Escape', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Spiegazione" delay={0}>
        <Button>Aiuto</Button>
      </Tooltip>
    );
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Spiegazione');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('has no automated accessibility violations while a modal is open', async () => {
    render(
      <main>
        <Modal title="Conferma operazione" description="Controlla i dati" defaultOpen>
          <Button>Conferma</Button>
        </Modal>
      </main>
    );
    const dialog = await screen.findByRole('dialog', { name: 'Conferma operazione' });
    expect((await axe.run(dialog)).violations).toEqual([]);
  });

  it('uses only generated foundation variables in overlay CSS', () => {
    const css = readFileSync('styles/components/overlays.css', 'utf8');
    const tokens = readFileSync('styles/tokens.css', 'utf8');
    const defined = new Set([...tokens.matchAll(/(--qv-[\w-]+)\s*:/g)].map((match) => match[1]));
    const used = [...new Set([...css.matchAll(/var\((--qv-[\w-]+)/g)].map((match) => match[1]))];
    expect(used.filter((token) => !defined.has(token))).toEqual([]);
  });
});
