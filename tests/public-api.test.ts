import test from "node:test";
import assert from "node:assert/strict";
import * as api from "../src/index";

const STABLE_EXPORTS = [
  "COMPLETION_STATUSES",
  "CORRECTNESS",
  "EVIDENCE_TYPES",
  "EXPORT_FORMATS",
  "FEEDBACK_SOURCES",
  "MARKING_SOURCES",
  "REVIEW_REASONS",
  "REVIEW_STATES",
  "ResultsError",
  "buildDiagnostics",
  "buildFeedback",
  "buildMarkbook",
  "buildReviewQueue",
  "calculateBestAttempt",
  "calculateCompletion",
  "createActivitySummary",
  "createArtefactEvidence",
  "createAttemptEvidence",
  "createAttemptResult",
  "createAttemptSummary",
  "createAutomaticFeedback",
  "createClassificationEvidence",
  "createCodingEvidence",
  "createDiagnosticItem",
  "createEvidenceFromPayload",
  "createFeedbackItem",
  "createGroupResultSummary",
  "createLearnerProgress",
  "createMatchingEvidence",
  "createMultiSelectEvidence",
  "createOrderingEvidence",
  "createReflectionEvidence",
  "createResponseResult",
  "createSingleChoiceEvidence",
  "createStructuredEvidence",
  "createTeacherFeedback",
  "createWrittenEvidence",
  "exportResults",
  "interpretAttempt",
  "mapStoredEvidenceType",
  "mapStoredMarkingSource",
  "reviewReason",
  "reviewState",
  "summariseMarking",
  "summariseReviewChange",
  "validateReviewDecision",
  "validateTeacherFeedback"
].sort();

test("the package root exposes only the official API", () => {
  assert.deepEqual(Object.keys(api).sort(), STABLE_EXPORTS);
});
