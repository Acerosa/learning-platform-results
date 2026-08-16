import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBestAttempt,
  calculateCompletion,
  createActivitySummary,
  createAttemptSummary,
  createGroupResultSummary,
  createLearnerProgress
} from "../src/index";

const attempts = [
  { attemptNumber: 1, completed: true, score: 4, maxScore: 10 },
  { attemptNumber: 2, completed: true, score: 8, maxScore: 10 },
  { attemptNumber: 3, completed: true, score: 7, maxScore: 10 }
];

test("completion is not-started with no attempts", () => {
  assert.equal(calculateCompletion([]), "not-started");
});

test("best attempt is the highest score", () => {
  assert.equal(calculateBestAttempt(attempts)?.attemptNumber, 2);
});

test("learner progress summarises first, latest and best attempts", () => {
  const progress = createLearnerProgress({
    learnerId: "learner-1",
    activityKey: "quiz-1",
    attempts
  });
  assert.equal(progress.attemptCount, 3);
  assert.equal(progress.completed, true);
  assert.equal(progress.completionStatus, "completed");
  assert.equal(progress.firstAttempt?.attemptNumber, 1);
  assert.equal(progress.latestAttempt?.attemptNumber, 3);
  assert.equal(progress.bestAttempt?.attemptNumber, 2);
  assert.equal(progress.percentage, 80);
});

test("attempt summaries include percentage", () => {
  assert.equal(createAttemptSummary(attempts[0]).percentage, 40);
});

test("activity summaries average learner percentages", () => {
  const learners = [
    createLearnerProgress({ learnerId: "a", activityKey: "quiz-1", attempts }),
    createLearnerProgress({
      learnerId: "b",
      activityKey: "quiz-1",
      attempts: [{ attemptNumber: 1, completed: true, score: 5, maxScore: 10 }]
    })
  ];
  const summary = createActivitySummary({ activityKey: "quiz-1", learners });
  assert.equal(summary.learnerCount, 2);
  assert.equal(summary.averagePercentage, 65);
});

test("group summaries report highest and lowest percentages", () => {
  const learners = [
    createLearnerProgress({ learnerId: "a", activityKey: "quiz-1", attempts }),
    createLearnerProgress({
      learnerId: "b",
      activityKey: "quiz-1",
      attempts: [{ attemptNumber: 1, completed: true, score: 5, maxScore: 10 }]
    })
  ];
  const group = createGroupResultSummary({ groupId: "g1", learners });
  assert.equal(group.highestPercentage, 80);
  assert.equal(group.lowestPercentage, 50);
});

test("requires-review overrides completed when a review flag is present", () => {
  assert.equal(
    calculateCompletion([{ attemptNumber: 1, completed: true, requiresReview: true }]),
    "requires-review"
  );
});
