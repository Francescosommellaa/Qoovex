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
