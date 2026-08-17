import { GEOMETRY_TOLERANCES } from "./tolerance-policy.mjs";

export const VISUAL_INTERACTION_SETUP_IDS = Object.freeze([
  "checked-controls",
  "collapsible-expanded",
  "dialog-open",
  "dropdown-open",
  "focus-visible",
  "none",
  "select-open",
  "tabs-selected",
  "tooltip-open",
]);

const exactOverflow = (target) => ({
  type: "overflow",
  axis: "horizontal",
  target,
  tolerance: GEOMETRY_TOLERANCES.exact,
});

const exactScalar = (target, selector, metric, expected, scope = "surface") => ({
  type: "scalar",
  target,
  selector,
  scope,
  metric,
  expected,
  tolerance: GEOMETRY_TOLERANCES.exact,
});

const exactPair = (
  target,
  selector,
  comparisonTarget,
  comparisonSelector,
  metric,
  scope = "surface",
) => ({
  type: "pair",
  target,
  selector,
  comparisonTarget,
  comparisonSelector,
  scope,
  metric,
  tolerance: GEOMETRY_TOLERANCES.exact,
});

const exactRhythm = (target, selector, expected, scope = "surface") => ({
  type: "rhythm",
  target,
  selector,
  scope,
  expected,
  tolerance: GEOMETRY_TOLERANCES.exact,
});

const surface = (id, app, route, target, options = {}) =>
  Object.freeze({
    id,
    app,
    route,
    target,
    theme: "light",
    tier: "critical",
    geometry: [exactOverflow(target)],
    snapshot: {
      name: `${id}.png`,
      options: {
        animations: "disabled",
        caret: "hide",
        maxDiffPixels: 0,
        scale: "css",
      },
    },
    ...options,
  });

export const VISUAL_SURFACES = Object.freeze([
  surface("sirio-foundation-spacing-light", "sirio", "/foundations/spacing-and-radius", "spacing-scale", {
    geometry: [exactOverflow("spacing-scale"), exactScalar("spacing-scale", undefined, "paddingLeft", 24), exactScalar("spacing-scale", undefined, "gap", 24), exactScalar("spacing-scale", undefined, "borderRadius", 8)],
  }),
  surface("sirio-foundation-spacing-dark", "sirio", "/foundations/spacing-and-radius", "spacing-scale", {
    theme: "dark",
    geometry: [exactOverflow("spacing-scale"), exactScalar("spacing-scale", undefined, "paddingLeft", 24), exactScalar("spacing-scale", undefined, "gap", 24), exactScalar("spacing-scale", undefined, "borderRadius", 8)],
  }),
  surface("sirio-button-default", "sirio", "/components/button", "button-default", {
    geometry: [exactOverflow("button-default"), exactScalar("button", '[data-slot="button"]', "height", 32), exactScalar("button", '[data-slot="button"]', "paddingLeft", 12), exactScalar("button", '[data-slot="button"]', "paddingRight", 12), exactScalar("button", '[data-slot="button"]', "borderRadius", 8)],
  }),
  surface("sirio-button-disabled", "sirio", "/components/button", "button-disabled", {
    geometry: [exactOverflow("button-disabled"), exactScalar("disabled button", '[data-slot="button"]', "height", 32), exactScalar("disabled button", '[data-slot="button"]', "paddingLeft", 12), exactScalar("disabled button", '[data-slot="button"]', "borderRadius", 8)],
  }),
  surface("sirio-button-focus", "sirio", "/components/button", "button-focus", {
    setupId: "focus-visible",
    geometry: [exactOverflow("button-focus"), exactScalar("focused button", '[data-slot="button"]', "height", 32), exactScalar("focused button", '[data-slot="button"]', "paddingLeft", 12), exactScalar("focused button", '[data-slot="button"]', "borderRadius", 8)],
  }),
  surface("sirio-controls-checked", "sirio", "/components/controls", "controls-checked", {
    geometry: [exactOverflow("controls-checked"), exactScalar("checkbox", '[data-slot="checkbox"]', "width", 16), exactScalar("checkbox", '[data-slot="checkbox"]', "height", 16), exactScalar("switch", '[data-slot="switch"]', "width", 32)],
  }),
  surface("sirio-controls-error", "sirio", "/components/controls", "controls-error", {
    geometry: [exactOverflow("controls-error"), exactScalar("invalid input", '[data-slot="input"]', "height", 36), exactScalar("invalid input", '[data-slot="input"]', "paddingLeft", 12), exactPair("enabled button", '[data-slot="button"]:not(:disabled)', "disabled button", '[data-slot="button"]:disabled', "height")],
  }),
  surface("sirio-field-default", "sirio", "/components/field", "field-default", {
    geometry: [exactOverflow("field-default"), exactScalar("input", '[data-slot="input"]', "height", 36), exactScalar("input", '[data-slot="input"]', "paddingLeft", 12), exactScalar("input", '[data-slot="input"]', "borderRadius", 8), exactPair("field label", '[data-slot="field-label"]', "field input", '[data-slot="input"]', "left")],
  }),
  surface("sirio-field-error", "sirio", "/components/field", "field-error", {
    geometry: [exactOverflow("field-error"), exactScalar("invalid input", '[data-slot="input"]', "height", 36), exactScalar("invalid input", '[data-slot="input"]', "paddingLeft", 12), exactScalar("invalid input", '[data-slot="input"]', "borderRadius", 8), exactPair("field label", '[data-slot="field-label"]', "field input", '[data-slot="input"]', "left")],
  }),
  surface("sirio-select-open", "sirio", "/components/select", "select-open", {
    setupId: "select-open",
    geometry: [exactOverflow("select-open"), exactScalar("select trigger", '[data-slot="select-trigger"]', "height", 32), exactScalar("select popup", '[data-slot="select-content"]', "paddingLeft", 4, "page"), exactScalar("select popup", '[data-slot="select-content"]', "borderRadius", 8, "page"), exactRhythm("select items", '[data-slot="select-item"]', 28, "page")],
  }),
  surface("sirio-tabs-selected", "sirio", "/components/tabs", "tabs-selected", {
    setupId: "tabs-selected",
    geometry: [exactOverflow("tabs-selected"), exactScalar("tabs list", '[data-slot="tabs-list"]', "gap", 4), exactPair("selected tab", '[data-slot="tabs-trigger"][aria-selected="true"]', "peer tab", '[data-slot="tabs-trigger"]:nth-of-type(3)', "height")],
  }),
  surface("sirio-dialog-open", "sirio", "/components/dialog", "dialog-open", {
    setupId: "dialog-open",
    geometry: [exactOverflow("dialog-open"), exactScalar("dialog content", '[data-slot="dialog-content"]', "width", 512, "page"), exactScalar("dialog content", '[data-slot="dialog-content"]', "paddingLeft", 24, "page"), exactScalar("dialog content", '[data-slot="dialog-content"]', "gap", 20, "page"), exactScalar("dialog content", '[data-slot="dialog-content"]', "borderRadius", 12, "page")],
  }),
  surface("sirio-dropdown-open", "sirio", "/components/dropdown-menu", "dropdown-open", {
    setupId: "dropdown-open",
    geometry: [exactOverflow("dropdown-open"), exactScalar("dropdown popup", '[data-slot="dropdown-menu-content"]', "paddingLeft", 6, "page"), exactScalar("dropdown popup", '[data-slot="dropdown-menu-content"]', "borderRadius", 12, "page")],
  }),
  surface("sirio-tooltip-open", "sirio", "/components/tooltip", "tooltip-open", {
    setupId: "tooltip-open",
    geometry: [exactOverflow("tooltip-open"), exactScalar("tooltip popup", '[data-slot="tooltip-content"]', "paddingLeft", 12, "page"), exactScalar("tooltip popup", '[data-slot="tooltip-content"]', "paddingTop", 6, "page"), exactScalar("tooltip popup", '[data-slot="tooltip-content"]', "borderRadius", 8, "page")],
  }),
  surface("sirio-card-default", "sirio", "/components/card", "card-default", {
    geometry: [exactOverflow("card-default"), exactScalar("card", '[data-slot="card"]', "paddingLeft", 24), exactScalar("card", '[data-slot="card"]', "gap", 16), exactScalar("card", '[data-slot="card"]', "borderRadius", 12), exactScalar("card", '[data-slot="card"]', "borderTopWidth", 1)],
  }),
  surface("sirio-alert-error", "sirio", "/components/alert", "alert-error", {
    geometry: [exactOverflow("alert-error"), exactScalar("alert", '[data-slot="alert"]', "paddingLeft", 16), exactScalar("alert", '[data-slot="alert"]', "gap", 12), exactScalar("alert", '[data-slot="alert"]', "borderRadius", 8)],
  }),
  surface("sirio-empty", "sirio", "/components/empty", "empty-default", {
    geometry: [exactOverflow("empty-default"), exactScalar("empty state", '[data-slot="empty"]', "paddingLeft", 48), exactScalar("empty state", '[data-slot="empty"]', "borderRadius", 16), exactScalar("empty media", '[data-slot="empty-media"]', "width", 64), exactScalar("empty media", '[data-slot="empty-media"]', "height", 64)],
  }),
  surface("web-home-light", "web", "/", "web-home"),
  surface("web-home-dark", "web", "/", "web-home", { theme: "dark" }),
  surface("workspace-sign-in-light", "workspace", "/sign-in", "workspace-sign-in"),
  surface("workspace-sign-in-dark", "workspace", "/sign-in", "workspace-sign-in", { theme: "dark" }),
]);

const covered = (app, route) => ({ app, route, status: "covered" });
const excluded = (app, route, reasonCode, reason) => ({
  app,
  route,
  status: "excluded",
  reasonCode,
  reason,
});

const nonCriticalSirio = [
  "/patterns",
  "/patterns/work-queue",
  "/patterns/timeline-event",
  "/patterns/status-presentation",
  "/patterns/form-validation",
  "/patterns/money",
  "/patterns/proposal-review",
  "/patterns/contextual-attachment",
  "/components/avatar",
  "/components/badge",
  "/components/breadcrumb",
  "/components/chart",
  "/components/collapsible",
  "/components/floating-navigation",
  "/components/search-field",
  "/components/separator",
  "/components/sidebar",
  "/components/skeleton",
  "/components/spinner",
  "/components/table",
  "/components/textarea",
  "/components/timeline",
  "/components/topbar",
  "/components/work-queue-item",
  "/foundations/colors",
  "/foundations/typography",
];

const coveredSirio = [
  "/components/alert",
  "/components/button",
  "/components/card",
  "/components/controls",
  "/components/dialog",
  "/components/dropdown-menu",
  "/components/empty",
  "/components/field",
  "/components/select",
  "/components/tabs",
  "/components/tooltip",
  "/foundations/spacing-and-radius",
];

const staticWebRoutes = [
  "/chi-siamo",
  "/clienti",
  "/come-funziona",
  "/community",
  "/contattaci",
  "/cookies",
  "/dpa",
  "/faq",
  "/fiducia",
  "/funzionalita",
  "/imprese",
  "/privacy",
  "/terms",
];

const workspaceAuthenticatedRoutes = [
  "/",
  "/account/invitations",
  "/account/notifications",
  "/account/organization",
  "/account/role",
  "/account/security",
  "/audit-log",
  "/client",
  "/client/job-sites/[jobSiteId]",
  "/data-control",
  "/invite",
  "/job-sites",
  "/job-sites/[jobSiteId]",
  "/notifications",
  "/payment-profile",
  "/people",
  "/people/access",
  "/qoovex-admin",
  "/qoovex-admin/errors",
  "/qoovex-admin/organizations",
  "/qoovex-admin/users",
  "/qoovex-admin/users/[userId]",
  "/settings",
  "/settings/organization-profile",
  "/settings/people",
  "/settings/people/invite",
  "/workers",
  "/workers/new",
];

export const ROUTE_CLASSIFICATIONS = Object.freeze([
  excluded("sirio", "/", "redirect-only", "The root route redirects to the catalog and has no independent visual surface."),
  ...coveredSirio.map((route) => covered("sirio", route)),
  ...nonCriticalSirio.map((route) =>
    excluded("sirio", route, "non-critical-initial-scope", "The route is catalogued but is outside the initial required critical surface matrix."),
  ),
  covered("web", "/"),
  ...staticWebRoutes.map((route) =>
    excluded("web", route, "static-content-low-risk", "The static marketing or legal page is outside the initial critical homepage baseline."),
  ),
  covered("workspace", "/sign-in"),
  excluded("workspace", "/sign-up", "public-flow-not-in-initial-scope", "The account creation flow is outside the initial DB-free sign-in baseline."),
  excluded("workspace", "/reset-password", "public-flow-not-in-initial-scope", "The password recovery flow is outside the initial DB-free sign-in baseline."),
  excluded("workspace", "/exports/access/[token]", "requires-runtime-fixture", "The export route requires a valid runtime token fixture."),
  excluded("workspace", "/client/invitations/[token]", "requires-runtime-fixture", "The invitation route requires a valid runtime token fixture."),
  ...workspaceAuthenticatedRoutes.map((route) =>
    excluded("workspace", route, "requires-authenticated-data", "The route requires authenticated tenant-scoped runtime data and is excluded from this DB-free gate."),
  ),
]);
