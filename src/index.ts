export { ResultsError } from "./shared/errors";
export {
  EVIDENCE_TYPES,
  createAttemptEvidence,
  createArtefactEvidence,
  createClassificationEvidence,
  createCodingEvidence,
  createMatchingEvidence,
  createMultiSelectEvidence,
  createOrderingEvidence,
  createReflectionEvidence,
  createSingleChoiceEvidence,
  createStructuredEvidence,
  createWrittenEvidence,
  createEvidenceFromPayload,
  mapStoredEvidenceType
} from "./evidence/evidence";
export type { AttemptEvidence, EvidenceItem, EvidenceType, EvidenceValue, MatchingPair } from "./evidence/evidence";
export {
  CORRECTNESS,
  MARKING_SOURCES,
  createAttemptResult,
  createResponseResult,
  interpretAttempt,
  mapStoredMarkingSource,
  reviewReason,
  buildReviewQueue,
  summariseMarking,
  REVIEW_REASONS,
  REVIEW_STATES,
  reviewState,
  validateReviewDecision,
  summariseReviewChange
} from "./results/results";
export type { AttemptResult, Correctness, MarkingSource, ResponseMark, ResponseResult, ReviewQueueItem, ReviewReason, ReviewState } from "./results/results";
export {
  COMPLETION_STATUSES,
  calculateBestAttempt,
  calculateCompletion,
  createActivitySummary,
  createAttemptSummary,
  createLearnerProgress,
  createGroupResultSummary
} from "./progress/progress";
export type { AttemptRecord, CompletionStatus, LearnerProgress } from "./progress/progress";
export { buildDiagnostics, createDiagnosticItem } from "./diagnostics/diagnostics";
export type { DiagnosticDimension, DiagnosticItem, DiagnosticsReport } from "./diagnostics/diagnostics";
export { FEEDBACK_SOURCES, buildFeedback, createFeedbackItem, createAutomaticFeedback, createTeacherFeedback, validateTeacherFeedback } from "./feedback/feedback";
export type { FeedbackBundle, FeedbackItem, FeedbackSource, RubricOutcome } from "./feedback/feedback";
export { buildMarkbook } from "./markbook/markbook";
export type { Activity, Attempt, Group, Learner, Markbook, MarkbookRow, MarkbookSummary } from "./markbook/markbook";
export { EXPORT_FORMATS, exportResults } from "./exports/exports";
export type { ExportDocument, ExportFormat, ExportSheet } from "./exports/exports";
export {
  INTERVENTION_SIGNAL_KEYS,
  buildAssessmentOverview,
  buildAssessmentReadiness,
  buildInterventionSignals,
  rankWeakDimensions,
  summariseDimensionPerformance,
  summariseScoreDistribution,
  summariseTrend
} from "./analytics/analytics";
export type {
  AssessmentOverview,
  AssessmentOverviewInput,
  AssessmentReadinessIndicator,
  DimensionPerformanceSummary,
  InterventionSignal,
  InterventionSignalKey,
  ScoreDistribution,
  TrendSummary
} from "./analytics/analytics";
