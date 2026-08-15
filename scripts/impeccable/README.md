# Impeccable tooling

Repository-owned integration for the pinned Impeccable Codex provider.

- `config.mjs` is the single pin and context registry.
- `setup.mjs` installs only the official Codex payload from the exact pinned tag and commit.
- `hook-dispatcher.mjs` is a temporary monorepo compatibility shim; it delegates scanning to the upstream hook with the resolved child working directory.
- `verify.mjs` performs the offline, read-only repository integration check.
- `hook-dispatcher.test.mjs` contains the routing and touched-context regression suite.

The upstream distribution remains under the ignored `.agents/skills/impeccable` path. Remove the dispatcher only after a pinned upstream version passes the same root-session PostToolUse and Stop routing regressions natively.
