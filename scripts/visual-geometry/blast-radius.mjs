const ALL_APPS = Object.freeze(["sirio", "web", "workspace"]);
const FRONTEND_EXTENSION = /\.(?:css|less|scss|sass|svg|tsx|jsx)$/i;
const VISUAL_INFRASTRUCTURE = /^(?:scripts|tests)\/visual-geometry\/|^playwright\.visual-geometry\.config\.ts$|^\.github\/workflows\/visual-geometry\.yml$/;
const GLOBAL_VISUAL = /(?:^|\/)(?:globals?|tokens?|theme|tailwind)(?:[.-]|\/)|^packages\/ui\/(?:package\.json|src\/styles\/)/;
const SHARED_UI = /^packages\/ui\//;
const APP_FRONTEND = /^apps\/(?:sirio|web|workspace)\/src\//;
const DEPENDENCY_GRAPH = /^(?:package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml)$/;

function normalized(file) {
  return file.replaceAll("\\", "/").replace(/^\.\//, "");
}

export function selectVisualScope(changedFiles = []) {
  let tier = "critical";
  let selfTest = false;

  for (const rawFile of changedFiles) {
    const file = normalized(rawFile);

    if (VISUAL_INFRASTRUCTURE.test(file)) {
      tier = "broad";
      selfTest = true;
      continue;
    }
    if (GLOBAL_VISUAL.test(file) || DEPENDENCY_GRAPH.test(file)) {
      tier = "broad";
      continue;
    }
    if ((SHARED_UI.test(file) || APP_FRONTEND.test(file)) && FRONTEND_EXTENSION.test(file)) {
      if (tier === "critical") tier = "representative";
      continue;
    }
    if (FRONTEND_EXTENSION.test(file)) tier = "broad";
  }

  return { tier, apps: [...ALL_APPS], selfTest };
}
