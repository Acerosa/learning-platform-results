# Learning Platform Results

`@learning-platform/results` is the shared educational business-logic package for the Learning Platform. It interprets attempts, responses, progress, diagnostics, feedback, markbook views and export models.

It does not own persistent data, React UI, teacher workflows or the database.

Version: **0.1.0**.

## Ownership

| Layer | Owns |
| --- | --- |
| Backend | Data, identity, RLS, authoritative marking persistence |
| Results | Interpretation and reusable educational calculations |
| Admin | Staff user experience |
| Core | Learner platform behaviour |
| UI | Learner presentation |
| Content | Curriculum |

See [Architecture](docs/architecture.md), [Public API](docs/public-api.md) and [Integration](docs/integration.md).

## Install for development

```bash
npm install
npm run check
```

`npm run check` typechecks, lints, tests and builds. Tests do not require Supabase.

## Public factories

- `createAttemptEvidence`, evidence builders
- `createResponseResult`, `createAttemptResult`, `interpretAttempt`
- `createLearnerProgress`, `createActivitySummary`, `createAttemptSummary`
- `calculateCompletion`, `calculateBestAttempt`
- `buildDiagnostics`, `buildFeedback`, `buildMarkbook`
- `exportResults`

## What this package does not do

- Query or write Supabase
- Move or change tables
- Render Admin, Teacher Portal or learner UI
- Replace backend marking authority
