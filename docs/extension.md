# Extension

Add capabilities by composing existing models:

1. Keep new persistence in `learning-platform-backend`.
2. Add a Results factory that accepts plain objects.
3. Export it from `src/index.ts` and document it.
4. Cover the business rule with a Node test that does not start Supabase.
5. Let Admin or CLI present the model.

Do not add network clients, React components or schema migrations here.
