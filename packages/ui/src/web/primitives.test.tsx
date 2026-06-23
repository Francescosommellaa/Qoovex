import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Heading,
  IconButton,
  Section,
  Stack,
  Surface,
  Tag,
  Text,
} from "./index";

const TestIcon = () => <svg viewBox="0 0 24 24"><path d="M4 12h16" /></svg>;

describe("canonical primitives", () => {
  it("preserves button HTML props, ref and safe default type", async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    render(<Button ref={ref} data-testid="action" startIcon={<TestIcon />} endIcon={<TestIcon />} onClick={onClick}>Salva</Button>);

    const button = screen.getByTestId("action");
    expect(button).toHaveAttribute("type", "button");
    expect(ref.current).toBe(button);
    expect(button.querySelectorAll(".qv-button__icon")).toHaveLength(2);
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("makes loading buttons busy and non-interactive", async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Registra</Button>);
    const button = screen.getByRole("button", { name: /Registra/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Caricamento")).toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("requires an accessible name for icon buttons", () => {
    render(<IconButton icon={<TestIcon />} aria-label="Chiudi pannello" variant="ghost" />);
    expect(screen.getByRole("button", { name: "Chiudi pannello" })).toBeVisible();
  });

  it("keeps heading semantics independent from visual size", () => {
    render(<><Heading as="h3" size="display-md">Preparazioni</Heading><Text as="span" size="caption" tone="muted">Domani</Text></>);
    expect(screen.getByRole("heading", { level: 3, name: "Preparazioni" })).toHaveAttribute("data-size", "display-md");
    expect(screen.getByText("Domani")).toHaveAttribute("data-tone", "muted");
  });

  it("exposes controlled status, surface and layout variants", () => {
    render(
      <Container size="reading" data-testid="container">
        <Section spacing="sm" data-testid="section">
          <Stack gap="6" tabletDirection="row" data-testid="stack">
            <Badge tone="success">Pronto</Badge>
            <Tag tone="info" icon={<TestIcon />}>Sala</Tag>
            <Surface variant="glass" selected data-testid="surface">Glass</Surface>
            <Card interactive data-testid="card">Card</Card>
            <Grid columns={1} tabletColumns={2} desktopColumns={4} data-testid="grid"><span>A</span><span>B</span></Grid>
          </Stack>
        </Section>
      </Container>,
    );

    expect(screen.getByTestId("container")).toHaveAttribute("data-size", "reading");
    expect(screen.getByTestId("section")).toHaveAttribute("data-spacing", "sm");
    expect(screen.getByTestId("stack")).toHaveAttribute("data-tablet-direction", "row");
    expect(screen.getByText("Pronto")).toHaveAttribute("data-tone", "success");
    expect(screen.getByTestId("surface")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("card").tagName).toBe("ARTICLE");
    expect(screen.getByTestId("grid")).toHaveAttribute("data-desktop-columns", "4");
  });

  it("renders avatar fallback and separator semantics", () => {
    render(<><Avatar name="Elena Sala" /><Avatar name="Franco Bianchi" decorative /><Divider orientation="vertical" /></>);
    expect(screen.getByRole("img", { name: "Elena Sala" })).toHaveTextContent("ES");
    expect(screen.getByText("FB").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(
      <main>
        <Heading as="h1">Primitive</Heading>
        <Text>Contenuto leggibile.</Text>
        <Button startIcon={<TestIcon />}>Continua</Button>
        <IconButton icon={<TestIcon />} aria-label="Altre azioni" />
        <Badge tone="warning">Attenzione</Badge>
        <Tag tone="info">Informazione</Tag>
        <Surface padding="md"><Avatar name="Marco Chef" /></Surface>
        <Divider />
      </main>,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
