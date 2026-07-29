export function toggleExpandedJobSiteIds(current: Set<string>, targetId: string, exclusive: boolean): Set<string> {
  if (current.has(targetId)) {
    if (exclusive) return new Set<string>();
    const next = new Set(current);
    next.delete(targetId);
    return next;
  }
  return exclusive ? new Set([targetId]) : new Set([...current, targetId]);
}

export function ensureExpandedJobSiteId(current: Set<string>, targetId: string, exclusive: boolean): Set<string> {
  if (exclusive) return current.size === 1 && current.has(targetId) ? current : new Set([targetId]);
  return current.has(targetId) ? current : new Set([...current, targetId]);
}

export function normalizeExpandedJobSiteIds(current: Set<string>, preferredId: string | null): Set<string> {
  if (current.size <= 1) return current;
  const keepId = preferredId && current.has(preferredId) ? preferredId : [...current].at(-1);
  return keepId ? new Set([keepId]) : new Set<string>();
}
