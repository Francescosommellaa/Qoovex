import assert from "node:assert/strict";
import test from "node:test";

import {
  comparePair,
  compareRectOverflow,
  compareRepeatedRhythm,
  compareScalar,
  GeometryContractError,
} from "./geometry-contracts.mjs";
import { GEOMETRY_TOLERANCES } from "./tolerance-policy.mjs";

const context = {
  surface: "sirio-button",
  state: "default",
  element: "button",
};

test("exact geometry passes and a 1px drift reports context", () => {
  assert.doesNotThrow(() =>
    compareScalar({
      ...context,
      metric: "height",
      expected: 32,
      actual: 32,
      tolerance: GEOMETRY_TOLERANCES.exact,
    }),
  );

  assert.throws(
    () =>
      compareScalar({
        ...context,
        metric: "height",
        expected: 32,
        actual: 33,
        tolerance: GEOMETRY_TOLERANCES.exact,
      }),
    (error) =>
      error instanceof GeometryContractError &&
      /surface: sirio-button[\s\S]*state: default[\s\S]*element: button[\s\S]*metric: height[\s\S]*expected: 32px[\s\S]*actual: 33px[\s\S]*difference: 1px[\s\S]*tolerance: 0px/.test(
        error.message,
      ),
  );
});

test("optical tolerance accepts 1px and rejects 1.01px", () => {
  assert.doesNotThrow(() =>
    compareScalar({
      surface: "sirio-brand",
      state: "default",
      element: "icon",
      metric: "center delta",
      expected: 0,
      actual: 1,
      tolerance: GEOMETRY_TOLERANCES.optical,
    }),
  );

  assert.throws(() =>
    compareScalar({
      surface: "sirio-brand",
      state: "default",
      element: "icon",
      metric: "center delta",
      expected: 0,
      actual: 1.01,
      tolerance: GEOMETRY_TOLERANCES.optical,
    }),
  );
});

test("pair comparison supports same-size and alignment relations", () => {
  const result = comparePair({
    surface: "sirio-controls",
    state: "default",
    relation: "same-size",
    metric: "width",
    first: 20,
    second: 20,
    tolerance: GEOMETRY_TOLERANCES.exact,
  });

  assert.equal(result.difference, 0);
  assert.throws(
    () =>
      comparePair({
        surface: "sirio-controls",
        state: "default",
        relation: "vertical alignment",
        metric: "top",
        first: 8,
        second: 10,
        tolerance: GEOMETRY_TOLERANCES.optical,
      }),
    /relation: vertical alignment/,
  );
});

test("overflow reports scroll and client dimensions", () => {
  assert.throws(
    () =>
      compareRectOverflow({
        surface: "sirio-dialog",
        state: "open",
        element: "dialog",
        clientWidth: 400,
        scrollWidth: 404,
        clientHeight: 300,
        scrollHeight: 300,
        tolerance: GEOMETRY_TOLERANCES.exact,
      }),
    /metric: horizontal overflow[\s\S]*expected: 400px[\s\S]*actual: 404px[\s\S]*scrollWidth: 404px[\s\S]*clientWidth: 400px/,
  );
});

test("repeated rhythm compares every interval with the expected gap", () => {
  assert.doesNotThrow(() =>
    compareRepeatedRhythm({
      surface: "sirio-spacing",
      state: "default",
      relation: "vertical rhythm",
      positions: [0, 8, 16, 24],
      expected: 8,
      tolerance: GEOMETRY_TOLERANCES.exact,
    }),
  );

  assert.throws(
    () =>
      compareRepeatedRhythm({
        surface: "sirio-spacing",
        state: "default",
        relation: "vertical rhythm",
        positions: [0, 8, 17],
        expected: 8,
        tolerance: GEOMETRY_TOLERANCES.exact,
      }),
    /relation: vertical rhythm \(interval 2\)[\s\S]*actual: 9px/,
  );
});

test("invalid geometry inputs fail before comparison", () => {
  assert.throws(
    () => compareScalar({ ...context, metric: "height", expected: 32, actual: Number.NaN, tolerance: 0 }),
    /actual must be a finite number/,
  );
  assert.throws(
    () => compareRepeatedRhythm({ surface: "x", state: "default", relation: "gap", positions: [0], expected: 8, tolerance: 0 }),
    /at least two positions/,
  );
});
