# Recipe image media

Streams private recipe images from Vercel Blob after authorization.

## Access

- Public recipes (`isPublic`, not deleted): no login required
- Private recipes: owner only (`bootstrapUser`)

## Query

- `pathname` — Blob pathname (preferred)
- `url` — legacy private Blob URL (pathname extracted)

Public route (no middleware auth); authorization is enforced in the handler.
