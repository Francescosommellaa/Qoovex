import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { Button } from "./button";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { Field } from "./field";
import { Input } from "./input";
import { Surface } from "./surface";

describe("Stable v0.5 primitives", () => {
  it("exposes semantic Surface material attributes", () => {
    render(
      <Surface
        data-testid="surface"
        material="crystal"
        purpose="feature"
      />,
    );

    expect(screen.getByTestId("surface")).toHaveAttribute(
      "data-material",
      "crystal",
    );
    expect(screen.getByTestId("surface")).toHaveAttribute(
      "data-purpose",
      "feature",
    );
    expect(screen.getByTestId("surface")).not.toHaveAttribute("data-elevation");
  });

  it("preserves refs and consumer events on Button", () => {
    const ref = createRef<HTMLButtonElement>();
    let presses = 0;

    render(
      <Button
        onClick={() => {
          presses += 1;
        }}
        ref={ref}
      >
        Salva
      </Button>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Salva" }));
    expect(presses).toBe(1);
    expect(ref.current).toBe(screen.getByRole("button", { name: "Salva" }));
  });

  it("connects Field label, status and messages to its control", () => {
    render(
      <Field
        description="Nome interno."
        label="Nome ricetta"
        message="Inserisci un nome valido."
        status="error"
      >
        <Input />
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: "Nome ricetta" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain("-description");
    expect(input.getAttribute("aria-describedby")).toContain("-message");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Inserisci un nome valido.",
    );
  });

  it("opens a dialog and moves focus into the modal", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Apri</Button>
        </DialogTrigger>
        <DialogContent title="Conferma pubblicazione">
          <Button>Pubblica</Button>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Apri" }));
    expect(
      screen.getByRole("dialog", { name: "Conferma pubblicazione" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Chiudi finestra" })).toHaveFocus();
  });

  it("has no automatic axe violations in the base form composition", async () => {
    const { container } = render(
      <main>
        <h1>Ricetta</h1>
        <Field label="Nome ricetta">
          <Input />
        </Field>
        <Button>Salva ricetta</Button>
      </main>,
    );

    const result = await axe.run(container);
    expect(result.violations).toEqual([]);
  });
});
