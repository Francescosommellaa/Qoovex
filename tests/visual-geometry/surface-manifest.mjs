import { GEOMETRY_TOLERANCES } from "./tolerance-policy.mjs";

export const VISUAL_INTERACTION_SETUP_IDS = Object.freeze([
  "focus-target",
  "open-dialog",
  "open-dropdown",
  "open-select",
  "open-tooltip",
  "select-tab",
]);

const exactOverflow = (target) => ({
  type: "overflow",
  target,
  tolerance: GEOMETRY_TOLERANCES.exact,
});

const surface = (id, app, route, target, options = {}) =>
  Object.freeze({
    id,
    app,
    route,
    target,
    theme: "light",
    geometry: [exactOverflow(target)],
    ...options,
  });

export const VISUAL_SURFACES = Object.freeze([
  surface("sirio-foundation-spacing-light", "sirio", "/foundations/spacing-and-radius", "spacing-scale"),
  surface("sirio-foundation-spacing-dark", "sirio", "/foundations/spacing-and-radius", "spacing-scale", { theme: "dark" }),
  surface("sirio-button-default", "sirio", "/components/button", "button-default"),
  surface("sirio-button-disabled", "sirio", "/components/button", "button-disabled"),
  surface("sirio-button-focus", "sirio", "/components/button", "button-focus", { setupId: "focus-target" }),
  surface("sirio-controls-checked", "sirio", "/components/controls", "controls-checked"),
  surface("sirio-controls-error", "sirio", "/components/controls", "controls-error"),
  surface("sirio-field-default", "sirio", "/components/field", "field-default"),
  surface("sirio-field-error", "sirio", "/components/field", "field-error"),
  surface("sirio-select-open", "sirio", "/components/select", "select-open", { setupId: "open-select" }),
  surface("sirio-tabs-selected", "sirio", "/components/tabs", "tabs-selected", { setupId: "select-tab" }),
  surface("sirio-dialog-open", "sirio", "/components/dialog", "dialog-open", { setupId: "open-dialog" }),
  surface("sirio-dropdown-open", "sirio", "/components/dropdown-menu", "dropdown-open", { setupId: "open-dropdown" }),
  surface("sirio-tooltip-open", "sirio", "/components/tooltip", "tooltip-open", { setupId: "open-tooltip" }),
  surface("sirio-card-default", "sirio", "/components/card", "card-default"),
  surface("sirio-alert-error", "sirio", "/components/alert", "alert-error"),
  surface("sirio-empty", "sirio", "/components/empty", "empty-default"),
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
