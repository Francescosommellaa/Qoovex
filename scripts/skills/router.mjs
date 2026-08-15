function orderedUnique(values) {
  return [...new Set(values)];
}

export function routeTask(registry, task = {}) {
  const required = [];
  const optional = [];
  const forbidden = [];
  const gates = ["qoovex-gates"];

  if (!task.ui) {
    forbidden.push("impeccable", "qoovex-ux-motion", "qoovex-component-creator", "ui-skills-root");
    return { required, optional, forbidden: orderedUnique(forbidden), gates };
  }

  required.push("impeccable");
  gates.unshift("impeccable-review");

  if (task.singleComponent) required.push("qoovex-component-creator");
  if (task.motion || task.interaction) required.push("qoovex-ux-motion");
  if (task.specialistEscalation) optional.push("ui-skills-root");

  if (!task.motion && !task.interaction) forbidden.push("qoovex-ux-motion");
  if (!task.singleComponent) forbidden.push("qoovex-component-creator");
  if (!task.specialistEscalation) forbidden.push("ui-skills-root");

  return {
    required: orderedUnique(required),
    optional: orderedUnique(optional),
    forbidden: orderedUnique(forbidden),
    gates: orderedUnique(gates),
  };
}
