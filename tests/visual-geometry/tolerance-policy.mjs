/**
 * Geometry is exact by default. The optical allowance is reserved for
 * documented relationships where sub-pixel browser layout may round by 1px.
 */
export const GEOMETRY_TOLERANCES = Object.freeze({
  exact: 0,
  optical: 1,
});
