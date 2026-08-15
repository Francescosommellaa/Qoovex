import fs from "node:fs";
import path from "node:path";

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function pageFileToRoute(appRoot, pageFile) {
  const relativeDirectory = path.relative(appRoot, path.dirname(pageFile));
  const segments = relativeDirectory
    .split(path.sep)
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")));

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

export function discoverPageRoutes(appRoot, app) {
  if (!fs.existsSync(appRoot)) throw new Error(`app route root does not exist: ${appRoot}`);

  return walk(appRoot)
    .filter((file) => path.basename(file) === "page.tsx")
    .map((file) => ({ app, route: pageFileToRoute(appRoot, file) }))
    .sort((left, right) => `${left.app}:${left.route}`.localeCompare(`${right.app}:${right.route}`));
}

