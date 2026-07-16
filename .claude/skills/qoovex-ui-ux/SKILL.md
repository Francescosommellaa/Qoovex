---
name: qoovex-ui-ux
description: Route every Qoovex UI or UX request through the canonical shared-package workflow, including Brain preflight, Sirio proof, external-source provenance, accessibility, verification, and production-safe rollout.
---

# Qoovex UI/UX router

Use this skill for every UI or UX task in `A:/Qoovex`.

## Mandatory preflight

1. Call Qoovex-Brain `get_task_context` with the concrete task.
2. Call Qoovex-Brain `check_ui_task` before editing UI.
3. Read `docs/HowToUse.md`, `project_brain.json`, `docs/OperationalProtocol.md`, relevant canonical docs, and the Brain files returned by task context.
4. Inspect repo truth and the current diff. Preserve unrelated work.

The Brain is accessed only through its MCP server.

## Route the task

- A named single component routes to `qoovex-component-creator`.
- A flow, page, shell, dashboard, marketing surface, or system-wide UI change routes to `design-qoovex-ui-ux`.
- shadcn component installation or maintenance uses the installed shadcn skill and official CLI workflow.

## Canonical system

- Source baseline: `Kiranism/next-shadcn-dashboard-starter` at commit `0edc5cf631ac7a8280112fd2bcb80312597bafdf`.
- Foundation: shadcn `base-nova`, Base UI, Tabler Icons, Tailwind CSS v4, Geist/Geist Mono and Vercel light/dark/system theme.
- Shared authority: `packages/ui` for tokens, base CSS, primitives, provider, behavior, hooks and utilities.
- Proof surface: `apps/sirio` routes `/`, `/marketing` and `/dashboard`, consuming the shared package.
- Production consumers: `apps/web` and `apps/workspace`, with domain compositions app-local.
- Asset authority: `packages/brand-resources` for proprietary SVG only.

Follow `references/source-routing.md` for external code. Do not bypass paid access, private repositories, credentials or license restrictions.

## Completion

Run targeted gates, package guardrails, browser QA and repository gates. Preserve route, auth, MFA, authorization, API, Prisma and storage behavior unless separately authorized. Update canonical repo docs and Qoovex-Brain, then append the Brain session log.
