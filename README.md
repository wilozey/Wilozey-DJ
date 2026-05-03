## Supabase typed API layer scaffold

Created fetch-safe typed API modules:

- `src/lib/supabase/types.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/api/plants.ts`
- `src/lib/api/remedies.ts`
- `src/lib/api/cards.ts`
- `src/lib/api/collections.ts`
- `src/lib/api/journal.ts`
- `src/lib/api/community.ts`
- `src/lib/api/marketplace.ts`
- `src/lib/api/ai-runs.ts`

Each API module exports CRUD helpers returning `{ data, error }` and catches runtime errors.

TODOs are included where real dependency installation and exact SQL-derived table types should be applied.
