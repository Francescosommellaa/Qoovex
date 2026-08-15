import assert from "node:assert/strict";
import test from "node:test";

import { selectMobileGroups } from "./impact.mjs";

const impact = {
  fullSuitePaths: [
    "packages/ui/**",
    "config/mobile-experience.json",
    "tests/mobile/**",
  ],
  groups: {
    web: ["apps/web/**"],
    workspace: ["apps/workspace/**"],
    sirio: ["apps/sirio/**"],
  },
};

test("shared UI changes trigger every runtime group", () => {
  assert.deepEqual(selectMobileGroups(["packages/ui/src/button.tsx"], impact), {
    mode: "full",
    groups: ["sirio", "web", "workspace"],
    reasons: ["packages/ui/src/button.tsx matched packages/ui/**"],
  });
});
test("an app-local change selects only its owning runtime group", () => {
  assert.deepEqual(
    selectMobileGroups(["apps/web/src/app/faq/page.tsx"], impact),
    {
      mode: "targeted",
      groups: ["web"],
      reasons: ["apps/web/src/app/faq/page.tsx matched apps/web/**"],
    },
  );
});

test("documentation-only changes keep the deterministic doctor without browser groups", () => {
  assert.deepEqual(selectMobileGroups(["docs/07_QUALITY_AND_RELEASE.md"], impact), {
    mode: "doctor-only",
    groups: [],
    reasons: ["No runtime-owned source paths changed."],
  });
});

test("an unknown source change fails closed into the full runtime matrix", () => {
  assert.deepEqual(selectMobileGroups(["tooling/new-ui-compiler.mjs"], impact), {
    mode: "full",
    groups: ["sirio", "web", "workspace"],
    reasons: ["Unknown source path tooling/new-ui-compiler.mjs; selected full suite."],
  });
});
