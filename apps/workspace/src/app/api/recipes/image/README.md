# Recipe image upload

Authenticated uploads to Vercel Blob (private store).

## Validation

- Max 5 MB
- Content verified with `sharp` (JPEG, PNG, WebP only — not client `Content-Type`)

## Response

- `url`: private Blob URL stored in `Recipe.imageUrl`
- `displayUrl`: same-origin proxy path for immediate UI preview (`/api/recipes/media?pathname=...`)

## Delivery

Private images are served via [`/api/recipes/media`](../media/route.ts) after auth / public-recipe checks.

## Rate limit

30 uploads per user every 10 minutes (in-memory, per instance).
