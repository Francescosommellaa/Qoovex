import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AdaptiveAppShell, CrewTaskCard, QuantityStatus } from "./index";

describe("canonical operational components", () => {
  it("removes unauthorized destinations from the role shell", () => {
    render(<AdaptiveAppShell current="hall" navigation={[{ id: "hall", label: "Sala", href: "#hall", visible: true }, { id: "kitchen", label: "Cucina", href: "#kitchen", visible: false }]}><p>Briefing sala</p></AdaptiveAppShell>);
    expect(screen.getByRole("link", { name: "Sala" })).toBeVisible();
    expect(screen.queryByRole("link", { name: "Cucina" })).not.toBeInTheDocument();
  });

  it("labels theoretical and verified quantities independently", () => {
    render(<QuantityStatus items={[{ label: "Extra teorico", value: 3, state: "theoretical" }, { label: "Verificato", value: 2, state: "verified" }]} />);
    expect(screen.getByText("Extra teorico")).toBeVisible();
    expect(screen.getByText("Verificato")).toBeVisible();
  });

  it("lets crew update only the assigned task state", async () => {
    const onToggle = vi.fn();
    render(<CrewTaskCard title="Cotolette" quantity="35" event="Domani" priority="alta" done={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button", { name: "Segna fatto" }));
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
