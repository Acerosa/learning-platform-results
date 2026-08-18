import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAssessmentOverview,
  buildAssessmentReadiness,
  buildInterventionSignals,
  rankWeakDimensions,
  summariseDimensionPerformance,
  summariseScoreDistribution,
  summariseTrend
} from "../src/analytics/analytics";
import { buildDiagnostics, createDiagnosticItem } from "../src/diagnostics/diagnostics";

test("buildAssessmentOverview reports metadata coverage honestly", () => {
  const overview = buildAssessmentOverview({
    activeLearners: 10,
    activeGroups: 2,
    attemptCount: 20,
    completedAttempts: 15,
    completionPercentage: 75,
    averageScorePercentage: 68.5,
    requiresReviewCount: 3,
    reviewedResponseCount: 4,
    assignmentCount: 5,
    participatingLearnerCount: 8,
    topicLinkCount: 12,
    skillLinkCount: 0
  });
  assert.equal(overview.topicMetadataCoverage, "present");
  assert.equal(overview.skillMetadataCoverage, "absent");
});

test("summariseTrend explains improving, declining and insufficient data", () => {
  assert.equal(summariseTrend([80, 60]).direction, "improving");
  assert.equal(summariseTrend([40, 70]).direction, "declining");
  assert.equal(summariseTrend([55]).direction, "insufficient-data");
  assert.match(summariseTrend([40, 70]).reason, /declined/i);
});

test("summariseScoreDistribution and dimension helpers are deterministic", () => {
  const distribution = summariseScoreDistribution({
    average: 60,
    best: 90,
    latest: 70,
    first: 50
  });
  assert.equal(distribution.best, 90);

  const report = buildDiagnostics([
    createDiagnosticItem({
      questionKey: "q1",
      topicKey: "networks",
      skillKey: "analyse",
      result: { isCorrect: false, requiresReview: false }
    }),
    createDiagnosticItem({
      questionKey: "q1",
      topicKey: "networks",
      skillKey: "analyse",
      result: { isCorrect: false, requiresReview: true }
    }),
    createDiagnosticItem({
      questionKey: "q2",
      topicKey: "networks",
      skillKey: "analyse",
      result: { isCorrect: false, requiresReview: false }
    })
  ]);
  const weak = rankWeakDimensions(report, 3);
  assert.ok(weak.length >= 1);
  assert.equal(summariseDimensionPerformance(report.topics)[0]?.weakness, true);
});

test("buildAssessmentReadiness keeps every indicator explainable", () => {
  const readiness = buildAssessmentReadiness({
    completionPercentage: 80,
    averageScorePercentage: 72,
    trend: summariseTrend([75, 60]),
    unresolvedReviewCount: 2,
    topicCoveragePercentage: null
  });
  assert.equal(readiness.length, 5);
  assert.ok(readiness.every((item) => item.explanation.length > 0));
  assert.match(
    readiness.find((item) => item.key === "topic-coverage")!.explanation,
    /absent|incomplete/i
  );
});

test("buildInterventionSignals only emit explicit deterministic reasons", () => {
  const signals = buildInterventionSignals({
    assignedNeverAttempted: [{ entityKey: "act-1", assignedCount: 12, attemptedCount: 0 }],
    repeatedAttemptsNoImprovement: [
      { entityKey: "S001", attemptCount: 3, firstScore: 40, latestScore: 35 }
    ],
    lowCompletion: [{ entityKey: "G1", completionPercentage: 20 }],
    unresolvedReviewBacklog: [{ entityKey: "G1", requiresReviewCount: 4 }],
    repeatedLowTopicOrSkill: [
      { entityType: "topic", entityKey: "networks", successPercentage: 30, attemptCount: 5 }
    ],
    decliningRecentResults: [{ entityKey: "S002", trend: summariseTrend([20, 80]) }]
  });
  assert.equal(signals.length, 6);
  assert.ok(signals.every((signal) => signal.reason.length > 0));
  assert.ok(signals.every((signal) => signal.key.includes("-")));
});
