function assertFiniteNumber(name, value) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

function assertTolerance(tolerance) {
  assertFiniteNumber("tolerance", tolerance);
  if (tolerance < 0) throw new RangeError("tolerance must be zero or greater");
}

function formatPixels(value) {
  return `${value}px`;
}

export class GeometryContractError extends Error {
  constructor(message, finding) {
    super(message);
    this.name = "GeometryContractError";
    this.finding = finding;
  }
}

export function formatGeometryFailure(finding) {
  const lines = [
    "Visual geometry contract failed",
    `surface: ${finding.surface}`,
    `state: ${finding.state}`,
  ];

  if (finding.element) lines.push(`element: ${finding.element}`);
  if (finding.relation) lines.push(`relation: ${finding.relation}`);

  lines.push(
    `metric: ${finding.metric}`,
    `expected: ${formatPixels(finding.expected)}`,
    `actual: ${formatPixels(finding.actual)}`,
    `difference: ${formatPixels(finding.difference)}`,
    `tolerance: ${formatPixels(finding.tolerance)}`,
  );

  for (const [name, value] of Object.entries(finding.details ?? {})) {
    lines.push(`${name}: ${formatPixels(value)}`);
  }

  return lines.join("\n");
}

export function compareScalar(input) {
  assertFiniteNumber("expected", input.expected);
  assertFiniteNumber("actual", input.actual);
  assertTolerance(input.tolerance);

  const difference = Math.abs(input.actual - input.expected);
  const finding = { ...input, difference };

  if (difference <= input.tolerance) return finding;
  throw new GeometryContractError(formatGeometryFailure(finding), finding);
}

export function comparePair({ first, second, relation, ...input }) {
  assertFiniteNumber("first", first);
  assertFiniteNumber("second", second);

  return compareScalar({
    ...input,
    relation,
    expected: first,
    actual: second,
  });
}

export function compareRectOverflow({
  clientWidth,
  scrollWidth,
  clientHeight,
  scrollHeight,
  ...input
}) {
  const dimensions = { clientWidth, scrollWidth, clientHeight, scrollHeight };
  for (const [name, value] of Object.entries(dimensions)) assertFiniteNumber(name, value);

  const horizontal = compareScalar({
    ...input,
    metric: "horizontal overflow",
    expected: clientWidth,
    actual: scrollWidth,
    details: { scrollWidth, clientWidth },
  });
  const vertical = compareScalar({
    ...input,
    metric: "vertical overflow",
    expected: clientHeight,
    actual: scrollHeight,
    details: { scrollHeight, clientHeight },
  });

  return { horizontal, vertical };
}

export function compareRepeatedRhythm({ positions, relation, ...input }) {
  if (!Array.isArray(positions) || positions.length < 2) {
    throw new TypeError("repeated rhythm requires at least two positions");
  }
  positions.forEach((position, index) => assertFiniteNumber(`positions[${index}]`, position));

  return positions.slice(1).map((position, index) =>
    compareScalar({
      ...input,
      relation: `${relation} (interval ${index + 1})`,
      actual: position - positions[index],
    }),
  );
}

