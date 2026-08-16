# Ownership

## `@learning-platform/results`

Shared educational interpretation:

- evidence models
- result calculations
- progress calculations
- diagnostics
- feedback models
- markbook models
- export models

Results must not import React, Supabase clients or hub curriculum copy.

## Backend

Authoritative storage of attempts, responses, marks, progress views, RLS and audit. Marking functions such as `learning.mark_evidence_response` remain backend-owned until a later extraction is explicitly planned.

## Admin

Staff UX. Admin may later consume Results models for markbook and export presentation. It must not become the owner of scoring rules.

## Core

Learner behaviour: auth, submission, evidence builders used at capture time, reading backend progress. Core evidence helpers stay in Core for this phase so learner runtime is unchanged.
