# Architecture

`@learning-platform/results` is the shared educational business-logic package in the accepted **Contract-First Modular Hub Architecture**.

It does not redesign the platform. It does not replace the backend.

## Purpose

Prevent educational interpretation from being reimplemented in Admin, a future Teacher Portal, analytics, AI, reporting, export and CLI tooling.

## Responsibilities

- Model learner evidence independently of marking
- Interpret response and attempt results from supplied marks
- Calculate progress, completion and best-attempt selection
- Build diagnostic, feedback, markbook and export models
- Remain framework-free and database-free

## Ownership

| Package | Owns |
| --- | --- |
| Backend | Persistent data, security, authoritative stored marks |
| Results | Interpretation of those records in memory |
| Admin | Staff presentation and workflows |
| Core | Learner runtime behaviour and evidence capture |
| UI | Learner presentation |
| Content | Curriculum documents |

Backend owns **data**. Results owns **interpretation**. Admin owns **presentation**.

## Boundaries

Admin Results / Markbook is the first consumer. It supplies `admin_api` rows
and presents Results models. It must not copy scoring rules.

- connect to Supabase
- own tables or migrations
- render React
- implement teacher editing
- implement analytics UI or export UI
- change learner workflows
- become a second backend or microservice

Core may continue to capture evidence and read backend progress. Authoritative scores remain those persisted by the backend.

## Public API

The package root is the only stable entry. See [Public API](public-api.md).

## Extension strategy

Add a new module under `src/` when a new interpretation concern appears (for example AI summaries consuming `DiagnosticsReport`). Keep persistence in the backend and presentation in Admin or UI. Prefer additive factories over breaking changes. Follow semantic versioning.

## Module layout

```text
src/
  evidence/     learner submission payloads
  results/      evaluation of evidence
  progress/     completion and attempt selection
  diagnostics/  question, topic and skill performance
  feedback/     automatic, teacher and review notes
  markbook/     group/learner/activity composition
  exports/      CSV, Excel and PDF models
```
