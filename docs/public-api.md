# Public API

Stable exports from `@learning-platform/results`:

| Export | Role |
| --- | --- |
| `EVIDENCE_TYPES` | Allowed evidence kinds |
| `createSingleChoiceEvidence` | Selected answer |
| `createMultiSelectEvidence` | Selected answers |
| `createMatchingEvidence` | Classification pairs |
| `createOrderingEvidence` | Ordered identifiers |
| `createWrittenEvidence` | Written response |
| `createReflectionEvidence` | Reflection text |
| `createCodingEvidence` | Source code evidence |
| `createClassificationEvidence` | Category assignment |
| `createArtefactEvidence` | Uploaded artefact reference |
| `createStructuredEvidence` | Structured payload |
| `createAttemptEvidence` | Activity evidence envelope |
| `MARKING_SOURCES`, `CORRECTNESS` | Result enumerations |
| `createResponseResult` | Interpret one marked response |
| `createAttemptResult` | Aggregate marked responses |
| `interpretAttempt` | Join evidence items to marks |
| `createEvidenceFromPayload` | Reconstruct evidence from stored payloads |
| `mapStoredMarkingSource` | Map backend `client`/`server`/`imported` sources |
| `reviewReason`, `buildReviewQueue` | Requires-review queue reasons |
| `summariseMarking` | Automatic vs teacher vs review counts |
| `createAutomaticFeedback` | Automatic feedback from correctness |
| `createGroupResultSummary` | Group completion and score range |
| `COMPLETION_STATUSES` | Progress enumerations |
| `calculateCompletion` | Completion status |
| `calculateBestAttempt` | Highest scoring attempt |
| `createAttemptSummary` | Single-attempt summary |
| `createLearnerProgress` | Learner/activity progress |
| `createActivitySummary` | Cohort activity summary |
| `buildDiagnostics` | Strengths, weaknesses, mistakes |
| `createDiagnosticItem` | Diagnostic input helper |
| `FEEDBACK_SOURCES` | Feedback enumerations |
| `createFeedbackItem` | One feedback note |
| `buildFeedback` | Feedback bundle |
| `buildMarkbook` | Learner/activity/attempt grid |
| `EXPORT_FORMATS` | `csv`, `excel`, `pdf` |
| `exportResults` | Export document models |
| `ResultsError` | Validation errors |

Types are exported alongside the factories. There is no default export.
