# Workspace Production alignment decision

> Historical record superseded for runtime direction by D-VNEXT-46–48. It remains evidence that Production was intentionally kept on the five-migration baseline; it must not be used to reconstruct the legacy product or to infer that vNext is absent from the current repository.

The active Workspace runtime is reconstructed from compatible commit `f98ed018` while retaining the current toolchain and the current Web, Sirio, brand and shared UI surfaces.

The active Prisma chain ends at `20260720010000_calendar_events`. Migrations 6 through 19 remain available in Git history and are intentionally absent from the active legacy release chain because Preview is recreated and Qoovex vNext is not part of this runtime track. No Production database reset or migration is authorized by this record.

Prisma CLI, Client and PostgreSQL adapter remain pinned to `7.9.0`: `7.9.1` generates the legacy schema but loses transaction-client delegate typing under the repository's strict TypeScript gate. The direct `pg` dependency remains at the compatible baseline `8.21.0`; the local pnpm store materialization for `8.22.0` was empty and failed module resolution. Node, pnpm, Next and React remain on the current repository versions.

Production promotion remains staged and manual. Preview must use a distinct database, Blob store, callback URL, secret set and email sink before rehearsal. Provider backup identity and a restore drill remain manual release evidence for any future database-changing release.
