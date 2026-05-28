# Ingredients Enrich Batch API

Authenticated workspace route for verifying multiple ingredient names in one UI action.

Keep here:
- request validation and rate limiting;
- delegation to `shared/server/ingredient-service`.

Do not keep here:
- enrichment lookup logic;
- recipe editor UI state.
