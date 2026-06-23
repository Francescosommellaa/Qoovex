import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { readFileSync } from "node:fs";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  Checkbox,
  Field,
  FieldError,
  FieldHint,
  Input,
  Label,
  NumberInput,
  Radio,
  SearchInput,
  Select,
  Switch,
  Textarea,
} from "./index";

const TestIcon = () => <svg viewBox="0 0 24 24"><path d="M4 12h16" /></svg>;

describe("canonical form components", () => {
  it("associates label, required state, hint and error with a stable control id", async () => {
    render(
      <Field id="email" required invalid>
        <Label>Email</Label>
        <Input type="email" aria-describedby="external-help" />
        <FieldHint>Usa l’indirizzo di lavoro.</FieldHint>
        <FieldError>Email non valida.</FieldError>
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("id", "email");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    await waitFor(() => expect(input).toHaveAttribute("aria-describedby", "external-help email-hint email-error"));
    expect(screen.getByRole("alert")).toHaveTextContent("Email non valida.");
  });

  it("preserves input props, icons, className and ref while inheriting disabled state", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Field disabled>
        <Label>Codice</Label>
        <Input ref={ref} className="consumer-class" startIcon={<TestIcon />} endIcon={<TestIcon />} data-testid="code" />
      </Field>,
    );

    const input = screen.getByTestId("code");
    expect(ref.current).toBe(input);
    expect(input).toBeDisabled();
    expect(input).toHaveClass("consumer-class");
    expect(input.parentElement?.querySelectorAll(".qv-control__icon")).toHaveLength(2);
  });

  it("maps empty and invalid numeric values to null and never emits NaN", async () => {
    const values: Array<number | null> = [];
    const user = userEvent.setup();
    render(<NumberInput aria-label="Quantità" defaultValue={5} onValueChange={(value) => values.push(value)} />);
    const input = screen.getByRole("spinbutton", { name: "Quantità" });

    expect(input).toHaveAttribute("type", "number");
    await user.clear(input);
    await user.type(input, "12");
    expect(values).toContain(null);
    expect(values.at(-1)).toBe(12);
    expect(values.some((value) => typeof value === "number" && Number.isNaN(value))).toBe(false);
  });

  it("keeps textarea sizing and select placeholder native", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Field><Label>Nota</Label><Textarea minRows={6} resize="none" /></Field>
        <Field><Label>Ruolo</Label><Select placeholder="Seleziona ruolo"><option value="chef">Chef</option></Select></Field>
      </>,
    );

    expect(screen.getByRole("textbox", { name: "Nota" })).toHaveAttribute("rows", "6");
    expect(screen.getByRole("textbox", { name: "Nota" })).toHaveAttribute("data-resize", "none");
    const select = screen.getByRole("combobox", { name: "Ruolo" });
    expect(screen.getByRole("option", { name: "Seleziona ruolo" })).toBeDisabled();
    await user.selectOptions(select, "chef");
    expect(select).toHaveValue("chef");
  });

  it("supports native label activation and keyboard behavior for choice controls", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Field layout="choice"><Checkbox /><Label>Applica regola</Label></Field>
        <fieldset>
          <legend>Responsabile</legend>
          <Field layout="choice"><Radio name="owner" value="chef" /><Label>Chef</Label></Field>
          <Field layout="choice"><Radio name="owner" value="admin" /><Label>Direzione</Label></Field>
        </fieldset>
        <Field layout="choice"><Switch /><Label>Notifiche</Label></Field>
      </>,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Applica regola" });
    await user.click(screen.getByText("Applica regola"));
    expect(checkbox).toBeChecked();

    const chef = screen.getByRole("radio", { name: "Chef" });
    const admin = screen.getByRole("radio", { name: "Direzione" });
    await user.click(chef);
    await user.keyboard("{ArrowDown}");
    expect(admin).toBeChecked();

    const toggle = screen.getByRole("switch", { name: "Notifiche" });
    await user.click(screen.getByText("Notifiche"));
    expect(toggle).toBeChecked();
  });

  it("composes search from Input and exposes a named clear action", async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();

    function SearchFixture() {
      const [value, setValue] = useState("cotolette");
      return <SearchInput aria-label="Cerca regola" value={value} onChange={(event) => setValue(event.currentTarget.value)} onClear={() => { setValue(""); onClear(); }} />;
    }

    render(<SearchFixture />);
    expect(screen.getByRole("searchbox", { name: "Cerca regola" })).toHaveValue("cotolette");
    await user.click(screen.getByRole("button", { name: "Cancella ricerca" }));
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.getByRole("searchbox", { name: "Cerca regola" })).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Cancella ricerca" })).not.toBeInTheDocument();
  });

  it("has no automated accessibility violations across the form family", async () => {
    const { container } = render(
      <main>
        <Field required><Label>Nome</Label><Input /></Field>
        <Field invalid><Label>Quantità</Label><NumberInput /><FieldHint>Numero di pezzi.</FieldHint><FieldError>Valore richiesto.</FieldError></Field>
        <Field><Label>Descrizione</Label><Textarea /></Field>
        <Field><Label>Ruolo</Label><Select><option>Chef</option></Select></Field>
        <Field layout="choice"><Checkbox /><Label>Conferma</Label></Field>
        <Field layout="choice"><Radio name="axe-owner" /><Label>Direzione</Label></Field>
        <Field layout="choice"><Switch /><Label>Notifiche</Label></Field>
        <SearchInput aria-label="Cerca" />
      </main>,
    );
    const hintId = screen.getByText("Numero di pezzi.").id;
    const errorId = screen.getByText("Valore richiesto.").id;
    await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-describedby", `${hintId} ${errorId}`));
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("uses only generated foundation variables in forms CSS", () => {
    const css = readFileSync("styles/components/forms.css", "utf8");
    const tokens = readFileSync("styles/tokens.css", "utf8");
    const defined = new Set([...tokens.matchAll(/(--qv-[\w-]+)\s*:/g)].map((match) => match[1]));
    const used = [...new Set([...css.matchAll(/var\((--qv-[\w-]+)/g)].map((match) => match[1]))];
    expect(used.filter((token) => !defined.has(token))).toEqual([]);
  });
});
