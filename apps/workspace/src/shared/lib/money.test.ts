import { describe, expect, it } from "vitest";
import { formatEuroFromMinorUnits, formatEuroRangeFromMinorUnits, formatInitialEstimateFromPayload, formatOptionalEuroFromMinorUnits, getProposalMoneyPresentation, parseEuroInputToMinorUnits } from "./money";

describe("formatEuroFromMinorUnits", () => {
  it("formats canonical minor units using Italian euro notation", () => {
    expect(formatEuroFromMinorUnits(BigInt(125000))).toBe("1.250,00 €");
    expect(formatEuroFromMinorUnits("50")).toBe("0,50 €");
    expect(formatEuroFromMinorUnits("-1234")).toBe("-12,34 €");
  });

  it("does not expose an invalid technical value", () => {
    expect(formatEuroFromMinorUnits("not-an-amount")).toBe("Importo non disponibile");
  });

  it("formats optional and ranged monetary values without local conversion logic", () => {
    expect(formatOptionalEuroFromMinorUnits(null)).toBe("Non indicato");
    expect(formatOptionalEuroFromMinorUnits("125000")).toBe("1.250,00 €");
    expect(formatEuroRangeFromMinorUnits("90000", BigInt(110000))).toBe("900,00 € – 1.100,00 €");
  });

  it("extracts the initial estimate and proposal amounts for UI presentation", () => {
    expect(formatInitialEstimateFromPayload({ initialEstimateMinor: "125000" })).toBe("1.250,00 €");
    expect(formatInitialEstimateFromPayload({ initialEstimateMinor: null })).toBe("Non indicata");
    expect(getProposalMoneyPresentation({
      previousPriceMinor: BigInt(100000),
      economicDeltaMinor: "-500",
      rangeMinimumMinor: null,
      rangeMaximumMinor: null,
    })).toEqual([
      { label: "Importo precedente", value: "1.000,00 €" },
      { label: "Variazione", value: "-5,00 €" },
    ]);
    expect(getProposalMoneyPresentation({
      previousPriceMinor: null,
      economicDeltaMinor: null,
      rangeMinimumMinor: "90000",
      rangeMaximumMinor: "110000",
    })).toEqual([{ label: "Intervallo", value: "900,00 € – 1.100,00 €" }]);
  });
});

describe("parseEuroInputToMinorUnits", () => {
  it.each([
    ["1250", "125000"],
    ["1.250,00", "125000"],
    ["0,5", "50"],
    [" 1.250,4 € ", "125040"],
    ["9007199254740993,99", "900719925474099399"],
  ])("parses %s without floating-point conversion", (input, expected) => {
    expect(parseEuroInputToMinorUnits(input)).toEqual({ ok: true, minorUnits: expected });
  });

  it("represents an empty optional input as null", () => {
    expect(parseEuroInputToMinorUnits("  ")).toEqual({ ok: true, minorUnits: null });
  });

  it("accepts negative values only when explicitly allowed", () => {
    expect(parseEuroInputToMinorUnits("-12,34")).toEqual({
      ok: false,
      error: "Inserisci un importo in euro valido, usando al massimo due cifre decimali.",
    });
    expect(parseEuroInputToMinorUnits("-12,34", { allowNegative: true })).toEqual({ ok: true, minorUnits: "-1234" });
  });

  it.each(["12,345", "1,23,4", "12.34", "euro 12", "1.25,00"])("rejects invalid or ambiguous input %s", (input) => {
    expect(parseEuroInputToMinorUnits(input)).toEqual({
      ok: false,
      error: "Inserisci un importo in euro valido, usando al massimo due cifre decimali.",
    });
  });
});
