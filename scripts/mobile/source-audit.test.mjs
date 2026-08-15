import assert from "node:assert/strict";
import test from "node:test";

import { auditSourceFiles } from "./source-audit.mjs";

const rules = [
  {
    id: "capability-from-ua-or-width",
    files: ["packages/ui/src/hooks/use-platform.ts"],
  },
  {
    id: "raw-viewport-height",
    files: ["packages/ui/src/components/dialog.tsx"],
  },
  {
    id: "hover-only-interaction",
    files: ["apps/web/src/app/sample.tsx"],
  },
  {
    id: "responsive-component-fork",
    files: ["apps/web/src/app/sample.tsx"],
  },
  {
    id: "fixed-without-safe-area",
    files: ["packages/ui/src/components/dialog.tsx"],
  },
  {
    id: "shared-touch-target-contract",
    files: ["packages/ui/src/components/button.tsx"],
  },
];

test("flags user-agent and viewport width as touch capability proxies", () => {
  const findings = auditSourceFiles(
    new Map([
      [
        "packages/ui/src/hooks/use-platform.ts",
        'const mobile = /Android/.test(navigator.userAgent) || innerWidth < 768;\n',
      ],
    ]),
    rules,
  );

  assert.deepEqual(
    findings.map(({ rule, line }) => [rule, line]),
    [["capability-from-ua-or-width", 1]],
  );
});

test("flags 100vh in a constrained overlay but accepts dynamic viewport units", () => {
  const unsafe = auditSourceFiles(
    new Map([
      [
        "packages/ui/src/components/dialog.tsx",
        '<div className="fixed max-h-[calc(100vh-2rem)]" />\n',
      ],
    ]),
    rules,
  );
  const safe = auditSourceFiles(
    new Map([
      [
        "packages/ui/src/components/dialog.tsx",
        '<div className="fixed max-h-[calc(100dvh-2rem)] pb-[var(--safe-area-bottom)]" />\n',
      ],
    ]),
    rules,
  );

  assert.equal(unsafe.some(({ rule }) => rule === "raw-viewport-height"), true);
  assert.equal(safe.some(({ rule }) => rule === "raw-viewport-height"), false);
});

test("flags a hover-only interactive element and accepts a focus equivalent", () => {
  const unsafe = auditSourceFiles(
    new Map([
      [
        "apps/web/src/app/sample.tsx",
        "<button onMouseEnter={() => open()}>Menu</button>\n",
      ],
    ]),
    rules,
  );
  const safe = auditSourceFiles(
    new Map([
      [
        "apps/web/src/app/sample.tsx",
        "<button onMouseEnter={() => open()} onFocus={() => open()}>Menu</button>\n",
      ],
    ]),
    rules,
  );

  assert.equal(unsafe.some(({ rule }) => rule === "hover-only-interaction"), true);
  assert.equal(safe.some(({ rule }) => rule === "hover-only-interaction"), false);
});

test("flags separate MobileVersion or DesktopVersion component forks", () => {
  const findings = auditSourceFiles(
    new Map([
      [
        "apps/web/src/app/sample.tsx",
        "function DesktopVersion() {}\nfunction MobileVersion() {}\n",
      ],
    ]),
    rules,
  );

  assert.equal(
    findings.some(({ rule }) => rule === "responsive-component-fork"),
    true,
  );
});

test("requires safe-area treatment in audited fixed surfaces", () => {
  const findings = auditSourceFiles(
    new Map([
      [
        "packages/ui/src/components/dialog.tsx",
        '<div className="fixed inset-0" />\n',
      ],
    ]),
    rules,
  );

  assert.equal(
    findings.some(({ rule }) => rule === "fixed-without-safe-area"),
    true,
  );
});

test("requires the shared touch-target contract in audited controls", () => {
  const findings = auditSourceFiles(
    new Map([
      [
        "packages/ui/src/components/button.tsx",
        'const classes = "h-8 px-3";\n',
      ],
    ]),
    rules,
  );

  assert.equal(
    findings.some(({ rule }) => rule === "shared-touch-target-contract"),
    true,
  );
});

