import assert from "node:assert/strict";
import test from "node:test";

import { selectVisualScope } from "./blast-radius.mjs";
import { findDesignDrift } from "./design-drift.mjs";
import {
  assertSnapshotUpdateAllowed,
  VISUAL_UPDATE_ATTESTATION,
} from "./snapshot-policy.mjs";

const allApps = ["sirio", "web", "workspace"];

test("shared UI and global token changes expand fail-safe", () => {
  assert.deepEqual(selectVisualScope(["packages/ui/src/components/button.tsx"]), {
    tier: "representative",
    apps: allApps,
    selfTest: false,
  });
  assert.deepEqual(selectVisualScope(["packages/ui/styles/tokens.css"]), {
    tier: "broad",
    apps: allApps,
    selfTest: false,
  });
  assert.deepEqual(selectVisualScope(["apps/web/src/app/page.tsx"]), {
    tier: "representative",
    apps: allApps,
    selfTest: false,
  });
});

test("unknown frontend files and visual infrastructure fail safe", () => {
  assert.equal(selectVisualScope(["unmapped/widget.svg"]).tier, "broad");
  assert.deepEqual(selectVisualScope(["scripts/visual-geometry/run.mjs"]), {
    tier: "broad",
    apps: allApps,
    selfTest: true,
  });
  assert.equal(selectVisualScope(["docs/architecture.md"]).tier, "critical");
});

test("CI can never update baselines", () => {
  assert.throws(
    () => assertSnapshotUpdateAllowed({ ci: true, attestation: VISUAL_UPDATE_ATTESTATION, argv: [] }),
    /forbidden in CI/,
  );
  assert.throws(
    () => assertSnapshotUpdateAllowed({ ci: false, attestation: "", argv: [] }),
    /attestation/,
  );
  assert.throws(
    () =>
      assertSnapshotUpdateAllowed({
        ci: false,
        attestation: VISUAL_UPDATE_ATTESTATION,
        argv: ["--update-snapshots"],
      }),
    /update argument must be owned by the governed runner/,
  );
  assert.doesNotThrow(() =>
    assertSnapshotUpdateAllowed({
      ci: false,
      attestation: VISUAL_UPDATE_ATTESTATION,
      argv: [],
    }),
  );
});

test("design drift reports new arbitrary geometry but ignores unchanged history", () => {
  const findings = findDesignDrift({
    files: [
      {
        file: "packages/ui/src/components/example.tsx",
        diff: [
          " context className=\"h-[17px]\"",
          "-old className=\"w-4\"",
          "+new className=\"w-[13px]\"",
        ].join("\n"),
      },
    ],
    exemptions: [],
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].property, "w");
  assert.equal(findings[0].value, "13px");
});

test("documented optical values are exempted exactly", () => {
  const findings = findDesignDrift({
    files: [
      {
        file: "packages/ui/src/components/brand.tsx",
        diff: "+<Icon className=\"translate-y-[1px]\" />",
      },
    ],
    exemptions: [
      {
        file: "packages/ui/src/components/brand.tsx",
        property: "translate-y",
        value: "1px",
        reason: "Optical centering against the wordmark cap height.",
      },
    ],
  });

  assert.deepEqual(findings, []);
});

test("geometry-related inline styles and repeated literals are reported", () => {
  const findings = findDesignDrift({
    files: [
      {
        file: "packages/ui/src/components/example.tsx",
        diff: [
          "+<div style={{ width: 13 }} />",
          "+<div className=\"mt-[22px]\" />",
          "+<div className=\"mb-[22px]\" />",
        ].join("\n"),
      },
    ],
    exemptions: [],
  });

  assert(findings.some(({ kind, property }) => kind === "inline-geometry" && property === "width"));
  assert(findings.some(({ kind, value }) => kind === "repeated-literal" && value === "22px"));
});
