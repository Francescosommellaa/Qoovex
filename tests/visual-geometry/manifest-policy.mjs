const APPS = new Set(["sirio", "web", "workspace"]);
const THEMES = new Set(["light", "dark"]);
const STATUSES = new Set(["covered", "represented", "excluded"]);

function routeKey({ app, route }) {
  return `${app}:${route}`;
}

export function validateManifest(surfaces, knownSetupIds) {
  const ids = new Set();
  const snapshotNames = new Set();
  const setups = new Set(knownSetupIds);

  for (const surface of surfaces) {
    if (!surface.id?.trim()) throw new Error("surface id is required");
    if (ids.has(surface.id)) throw new Error(`duplicate surface id: ${surface.id}`);
    ids.add(surface.id);

    if (!APPS.has(surface.app)) throw new Error(`unknown app for ${surface.id}: ${surface.app}`);
    if (!surface.route?.startsWith("/")) throw new Error(`invalid route for ${surface.id}`);
    if (!THEMES.has(surface.theme)) throw new Error(`invalid theme for ${surface.id}: ${surface.theme}`);
    if (!surface.target?.trim()) throw new Error(`target is required for ${surface.id}`);
    if (!surface.snapshot?.name?.endsWith(".png")) throw new Error(`PNG snapshot name is required for ${surface.id}`);
    if (snapshotNames.has(surface.snapshot.name)) throw new Error(`duplicate snapshot name: ${surface.snapshot.name}`);
    snapshotNames.add(surface.snapshot.name);
    if (surface.setupId && !setups.has(surface.setupId)) {
      throw new Error(`unknown setup id: ${surface.setupId}`);
    }
  }

  return surfaces;
}

export function validateRouteCoverage(discovered, classifications, surfaces = []) {
  const classificationsByRoute = new Map();
  const surfaceIds = new Set(surfaces.map(({ id }) => id));
  const surfacesByRoute = new Map();

  for (const surface of surfaces) {
    const key = routeKey(surface);
    surfacesByRoute.set(key, (surfacesByRoute.get(key) ?? 0) + 1);
  }

  for (const entry of classifications) {
    const key = routeKey(entry);
    if (classificationsByRoute.has(key)) throw new Error(`duplicate route classification: ${key}`);
    if (!STATUSES.has(entry.status)) throw new Error(`invalid route status: ${key}`);
    if (entry.status === "excluded" && (!entry.reasonCode?.trim() || !entry.reason?.trim())) {
      throw new Error(`exclusion reason missing: ${key}`);
    }
    if (entry.status === "covered" && !surfacesByRoute.has(key)) {
      throw new Error(`covered route has no surface: ${key}`);
    }
    if (entry.status === "represented" && !surfaceIds.has(entry.representedBy)) {
      throw new Error(`represented route has unknown surface: ${key}`);
    }
    classificationsByRoute.set(key, entry);
  }

  const discoveredKeys = new Set(discovered.map(routeKey));
  for (const route of discovered) {
    const key = routeKey(route);
    if (!classificationsByRoute.has(key)) throw new Error(`unclassified route: ${key}`);
  }
  for (const key of classificationsByRoute.keys()) {
    if (!discoveredKeys.has(key)) throw new Error(`stale route classification: ${key}`);
  }

  return classifications;
}

export function summarizeCoverage(classifications) {
  return classifications.reduce(
    (summary, entry) => {
      summary.total += 1;
      summary[entry.status] += 1;
      return summary;
    },
    { total: 0, covered: 0, represented: 0, excluded: 0 },
  );
}
