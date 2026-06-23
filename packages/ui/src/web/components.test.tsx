import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CrewTaskCard, QuantityStatus } from "./index";

describe("canonical operational components", () => {
  it("labels theoretical and verified quantities independently", () => {
    render(<QuantityStatus items={[{ label: "Extra teorico", value: 3, state: "theoretical" }, { label: "Verificato", value: 2, state: "verified" }]} />);
    expect(screen.getByText("Extra teorico").closest(".qv-metric-card")).toHaveAttribute("data-tone", "warning");
    expect(screen.getByText("Verificato").closest(".qv-metric-card")).toHaveAttribute("data-tone", "success");
  });

  it("lets crew update only the assigned task state", async () => {
    const onToggle = vi.fn();
    render(<CrewTaskCard title="Cotolette" quantity="35" event="Domani" priority="alta" done={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button", { name: "Segna fatto" }));
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
