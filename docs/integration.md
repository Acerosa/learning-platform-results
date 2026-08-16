# Integration

This package is not wired into runtime hubs, Admin or the backend in 0.1.0. Runtime behaviour is unchanged.

## Future consumers

- Admin markbook and attempt summaries
- Teacher Portal
- Analytics and reporting
- AI diagnostic summaries
- CLI export commands

Consumers supply already-loaded records. Results never fetches them.

## Alignment with Core evidence

Core `evidence.*` builders remain the learner capture API. Results evidence models are compatible in kind (`single-choice`, `multi-select`, `matching`, `ordering`, `written`, `reflection`, `coding`, `classification`) and add `artefact` and `structured`. Do not delete Core builders in this phase.

## Alignment with backend marks

Backend persists `score`, `max_score`, `is_correct`, `requires_review` and `marking_source`. Results interprets those fields in memory. It does not re-implement SQL marking as a second authority.

Admin Results maps `admin_api.attempts` and `admin_api.responses` through Results factories. Staff presentation stays in Admin.
