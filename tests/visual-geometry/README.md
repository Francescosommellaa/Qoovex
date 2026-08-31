# Visual Geometry & Polish CI

This folder owns the deterministic contracts and browser specifications for the
Qoovex visual-geometry quality gate. The suite protects measurable layout
relationships and reviewed screenshots across Sirio, Web, and DB-free
Workspace surfaces.

## Contract rules

- Geometry is exact by default (`0px` tolerance).
- A documented optical relationship may use at most `1px` tolerance.
- Failures identify the surface, state, element or relation, metric, expected
  value, actual value, difference, and tolerance.
- Browser tests block non-loopback requests and do not inspect font loading,
  font identity, Fontshare assets, or font families.
- Platform-specific snapshots are reviewed and versioned. CI never updates
  baselines.

The root scripts described by this folder's runner are the supported entry
points. Pure policy modules use `node:test` so their behavior remains fast and
independent from a browser or database.

Local scope includes committed, staged, unstaged and untracked files. If dev
servers already occupy ports 3000–3002, set `QOOVEX_VISUAL_PORT_BASE=3300` for
an isolated run on 3300–3302; never stop unrelated servers or reuse their builds.
CI retains its default ports and platform-specific baseline policy.

## Reviewing Linux baselines from Windows

Use WSL2 to host the Playwright container pinned in
`.github/workflows/visual-geometry.yml`. A bare Ubuntu WSL distribution is not
rendering-equivalent to that container: its additional system packages can
change screenshots even on unchanged surfaces. Keep the image tag aligned with
the workflow; for a failed run, also compare its logged image digest.

Run against an isolated Linux copy of the current working tree, including any
relevant uncommitted changes and resolved Git LFS assets. Install the frozen
workspace inside the container; never share Windows `node_modules` or `.next`
with Linux, or reuse a pnpm installation from a different store location.

First run `pnpm visual:geometry` without updating snapshots. Compare the local
failures with CI and inspect expected, actual and diff images. Only intentional,
reviewed changes may use the attested `pnpm visual:geometry:update` command
defined in `docs/07_QUALITY_AND_RELEASE.md`. Then run the normal read-only gate
again. Copy back only reviewed Linux baseline files, not reports or build output.
An update run alone is not acceptance, and CI failure artifacts are not baselines.
