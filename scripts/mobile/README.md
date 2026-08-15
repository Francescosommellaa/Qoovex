# Mobile quality gate

The Mobile Experience Contract in `config/mobile-experience.json` owns viewport, capability, surface, route, static-rule, and change-impact coverage for Qoovex.

## Commands

- `pnpm mobile:contract` validates the contract and confirms that every Next.js UI page route belongs to a surface or a reasoned exclusion.
- `pnpm mobile:doctor` runs contract, route, source, package-script, and CI-wiring checks. Add `-- --json` for structured findings.
- `pnpm mobile:impact -- <path> [...]` reports the browser groups selected by a change. With no paths it compares `MOBILE_BASE_REF` (default `HEAD^`) to `HEAD`.
- `pnpm mobile:test` runs the independent Playwright suite after the doctor passes.
- `node --test scripts/mobile/*.test.mjs` runs the deterministic unit suite.

## Source findings

Each finding contains a file, line, rule, explanation, and recovery. A high-signal false positive may be suppressed immediately above the affected JSX with:

```tsx
// mobile-audit-ignore hover-only-interaction -- Click and keyboard behavior are owned by the nested Base UI trigger.
```

A suppression without a rule and reason is ignored. Prefer fixing the interaction contract; suppress only when the detector cannot see an equivalent behavior that is present in the real component.

## Change impact

Shared UI, global layouts/styles, contract, harness, and test changes select the full `web`, `workspace`, and `sirio` matrix. App-local changes select their owning group. Documentation-only changes keep the doctor but select no browser group. Unknown source paths fail closed into the full matrix.
