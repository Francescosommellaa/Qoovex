// Keep CI defaults while allowing an isolated local run beside dev servers.
export function visualPorts(value = process.env.QOOVEX_VISUAL_PORT_BASE ?? "3000") {
  const base = Number(value);
  if (!/^\d+$/.test(value) || !Number.isInteger(base) || base < 1024 || base > 65533) {
    throw new Error("QOOVEX_VISUAL_PORT_BASE must be an integer from 1024 to 65533");
  }
  return { web: base, workspace: base + 1, sirio: base + 2 };
}
