import test from "node:test";
import assert from "node:assert/strict";
import {
  buildReviewQueue,
  createAttemptResult,
  createResponseResult,
  createSingleChoiceEvidence,
  createWrittenEvidence,
  interpretAttempt,
  mapStoredMarkingSource,
  reviewReason,
  summariseMarking
} from "../src/index";

test("response results interpret correctness without a database", () => {
  const result = createResponseResult({
    questionKey: "q1",
    score: 2,
    maxScore: 2,
    isCorrect: true,
    requiresReview: false,
    markingSource: "automatic",
    feedbackSummary: "Correct"
  });
  assert.equal(result.correctness, "correct");
  assert.equal(result.percentage, 100);
});

test("attempt results aggregate scores and mixed marking sources", () => {
  const attempt = createAttemptResult({
    activityKey: "quiz-1",
    responses: [
      { questionKey: "q1", score: 1, maxScore: 1, isCorrect: true, requiresReview: false, markingSource: "automatic" },
      { questionKey: "q2", score: 3, maxScore: 4, isCorrect: null, requiresReview: true, markingSource: "teacher" }
    ]
  });
  assert.equal(attempt.score, 4);
  assert.equal(attempt.maxScore, 5);
  assert.equal(attempt.percentage, 80);
  assert.equal(attempt.requiresReview, true);
  assert.equal(attempt.markingSource, "mixed");
});

test("interpretAttempt keeps unmarked evidence as requiring review", () => {
  const interpreted = interpretAttempt({
    activityKey: "quiz-1",
    items: [createSingleChoiceEvidence("q1", "a"), createWrittenEvidence("q2", "essay")],
    marks: [
      { questionKey: "q1", score: 1, maxScore: 1, isCorrect: true, requiresReview: false, markingSource: "automatic" }
    ]
  });
  assert.equal(interpreted.responses[1].requiresReview, true);
  assert.equal(interpreted.responses[1].markingSource, "none");
});

test("stored marking sources and review reasons are interpreted", () => {
  assert.equal(mapStoredMarkingSource("server"), "automatic");
  assert.equal(reviewReason({ requiresReview: true, isCorrect: null, markingSource: "automatic" }), "needs-marking");
  assert.equal(buildReviewQueue([
    { questionKey: "q2", score: null, maxScore: 4, isCorrect: null, requiresReview: true, markingSource: "automatic" }
  ]).length, 1);
  assert.equal(summariseMarking([{ markingSource: "server", requiresReview: true }]).reviewCount, 1);
});
