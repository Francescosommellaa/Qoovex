import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { readFileSync } from 'node:fs';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import {
  AppShell,
  Button,
  MobileNav,
  Navbar,
  PageHeader,
  SectionHeader,
  Toolbar,
  type NavigationLinkRenderer
} from './index';

const items = [
  { id: 'prepare', label: 'Prepara', href: '#prepare' },
  { id: 'events', label: 'Eventi', href: '#events' }
] as const;

describe('canonical navigation and layout components', () => {
  it('renders only supplied destinations, marks the active link and supports a custom renderer', () => {
    const ref = createRef<HTMLElement>();
    const renderLink: NavigationLinkRenderer = (item, props) => (
      <a {...props} data-router-link={item.id} />
    );
    render(
      <Navbar
        ref={ref}
        className="consumer-navbar"
        brand={<span>Qoovex</span>}
        items={items}
        activeId="prepare"
        renderLink={renderLink}
      />
    );

    expect(ref.current).toHaveClass('qv-navbar', 'consumer-navbar');
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Prepara' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Eventi' })).toHaveAttribute('data-router-link', 'events');
  });

  it('closes MobileNav after navigation and restores focus to its trigger', async () => {
    const user = userEvent.setup();
    render(<MobileNav items={items} activeId="prepare" title="Area operativa" />);

    const trigger = screen.getByRole('button', { name: 'Apri menu' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Area operativa' });
    expect(within(dialog).getByRole('link', { name: 'Prepara' })).toHaveAttribute('aria-current', 'page');
    await user.click(within(dialog).getByRole('link', { name: 'Eventi' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Area operativa' })).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('closes MobileNav with Escape while keeping focus inside when open', async () => {
    const user = userEvent.setup();
    render(<MobileNav items={items} title="Menu" />);
    const trigger = screen.getByRole('button', { name: 'Apri menu' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('creates one main landmark, a working skip link and preserves AppShell props and ref', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <AppShell ref={ref} className="consumer-shell" mainId="content" contentWidth="page">
        <p>Briefing</p>
      </AppShell>
    );
    expect(ref.current).toHaveClass('qv-app-shell', 'consumer-shell');
    expect(container.querySelectorAll('main')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Vai al contenuto' })).toHaveAttribute('href', '#content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'content');
  });

  it('keeps page and section heading semantics independent from layout', () => {
    render(
      <>
        <PageHeader title="Preparazioni" description="Domani" actions={<Button>Approva</Button>} />
        <SectionHeader headingLevel="h3" title="Produzione" />
      </>
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Preparazioni' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 3, name: 'Produzione' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Approva' })).toBeVisible();
  });

  it('renders Toolbar slots in stable DOM order inside a named region', () => {
    render(
      <Toolbar
        aria-label="Azioni pagina"
        search={<span>Cerca</span>}
        filters={<span>Filtri</span>}
        secondaryActions={<span>Secondarie</span>}
        primaryActions={<span>Primarie</span>}
      />
    );
    const toolbar = screen.getByRole('region', { name: 'Azioni pagina' });
    expect([...toolbar.children].map((node) => node.textContent)).toEqual(['Cerca', 'Filtri', 'Secondarie', 'Primarie']);
  });

  it('has no automated accessibility violations', async () => {
    const { container } = render(
      <AppShell
        header={<Navbar brand={<span>Qoovex</span>} items={items} activeId="prepare" />}
      >
        <PageHeader title="Preparazioni" />
        <Toolbar aria-label="Azioni pagina" primaryActions={<Button>Nuova</Button>} />
      </AppShell>
    );
    expect((await axe.run(container)).violations).toEqual([]);
  });

  it('uses only generated foundation variables in navigation and layout CSS', () => {
    const css = ['navigation.css', 'layout.css']
      .map((file) => readFileSync(`styles/components/${file}`, 'utf8'))
      .join('\n');
    const tokens = readFileSync('styles/tokens.css', 'utf8');
    const defined = new Set([...tokens.matchAll(/(--qv-[\w-]+)\s*:/g)].map((match) => match[1]));
    const used = [...new Set([...css.matchAll(/var\((--qv-[\w-]+)/g)].map((match) => match[1]))];
    expect(used.filter((token) => !defined.has(token))).toEqual([]);
  });
});
