import { freeze, requiredText } from "../shared/errors";
import type { DiagnosticDimension, DiagnosticsReport } from "../diagnostics/diagnostics";

export const INTERVENTION_SIGNAL_KEYS = Object.freeze([
  "assigned-never-attempted",
  "repeated-attempts-no-improvement",
  "low-completion",
  "unresolved-review-backlog",
  "repeated-low-topic-or-skill",
  "declining-recent-results"
] as const);

export type InterventionSignalKey = (typeof INTERVENTION_SIGNAL_KEYS)[number];

export interface AssessmentOverviewInput {
  activeLearners: number;
  activeGroups: number;
  attemptCount: number;
  completedAttempts: number;
  completionPercentage: number | null;
  averageScorePercentage: number | null;
  requiresReviewCount: number;
  reviewedResponseCount: number;
  assignmentCount: number;
  participatingLearnerCount: number;
  topicLinkCount: number;
  skillLinkCount: number;
}

export interface AssessmentOverview {
  activeLearners: number;
  activeGroups: number;
  attemptCount: number;
  completedAttempts: number;
  completionPercentage: number | null;
  averageScorePercentage: number | null;
  requiresReviewCount: number;
  reviewedResponseCount: number;
  assignmentCount: number;
  participatingLearnerCount: number;
  topicMetadataCoverage: "present" | "absent";
  skillMetadataCoverage: "present" | "absent";
  topicLinkCount: number;
  skillLinkCount: number;
}

export interface ScoreDistribution {
  average: number | null;
  best: number | null;
  latest: number | null;
  first: number | null;
}

export interface TrendSummary {
  direction: "improving" | "declining" | "stable" | "insufficient-data";
  deltaPercentagePoints: number | null;
  sampleSize: number;
  reason: string;
}

export interface DimensionPerformanceSummary {
  key: string;
  label: string;
  attemptCount: number;
  successPercentage: number | null;
  reviewCount: number;
  strength: boolean;
  weakness: boolean;
}

export interface AssessmentReadinessIndicator {
  key: string;
  label: string;
  value: number | null;
  unit: "percent" | "count";
  explanation: string;
}

export interface InterventionSignal {
  key: InterventionSignalKey;
  entityType: "learner" | "group" | "activity" | "topic" | "skill" | "platform";
  entityKey: string;
  reason: string;
  evidence: Readonly<Record<string, number | string | null>>;
}

function nonNegative(value: number, code: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw Object.assign(new Error(code), { code });
  }
  return value;
}

export function buildAssessmentOverview(input: AssessmentOverviewInput): AssessmentOverview {
  return freeze({
    activeLearners: nonNegative(input.activeLearners, "ACTIVE_LEARNERS_INVALID"),
    activeGroups: nonNegative(input.activeGroups, "ACTIVE_GROUPS_INVALID"),
    attemptCount: nonNegative(input.attemptCount, "ATTEMPT_COUNT_INVALID"),
    completedAttempts: nonNegative(input.completedAttempts, "COMPLETED_ATTEMPTS_INVALID"),
    completionPercentage: input.completionPercentage,
    averageScorePercentage: input.averageScorePercentage,
    requiresReviewCount: nonNegative(input.requiresReviewCount, "REQUIRES_REVIEW_INVALID"),
    reviewedResponseCount: nonNegative(input.reviewedResponseCount, "REVIEWED_COUNT_INVALID"),
    assignmentCount: nonNegative(input.assignmentCount, "ASSIGNMENT_COUNT_INVALID"),
    participatingLearnerCount: nonNegative(
      input.participatingLearnerCount,
      "PARTICIPATING_LEARNERS_INVALID"
    ),
    topicMetadataCoverage: input.topicLinkCount > 0 ? "present" : "absent",
    skillMetadataCoverage: input.skillLinkCount > 0 ? "present" : "absent",
    topicLinkCount: nonNegative(input.topicLinkCount, "TOPIC_LINK_COUNT_INVALID"),
    skillLinkCount: nonNegative(input.skillLinkCount, "SKILL_LINK_COUNT_INVALID")
  });
}

export function summariseScoreDistribution(input: {
  average?: number | null;
  best?: number | null;
  latest?: number | null;
  first?: number | null;
}): ScoreDistribution {
  return freeze({
    average: input.average ?? null,
    best: input.best ?? null,
    latest: input.latest ?? null,
    first: input.first ?? null
  });
}

export function summariseTrend(scoresNewestFirst: readonly number[]): TrendSummary {
  const scores = scoresNewestFirst.filter((value) => Number.isFinite(value));
  if (scores.length < 2) {
    return freeze({
      direction: "insufficient-data",
      deltaPercentagePoints: null,
      sampleSize: scores.length,
      reason: "Need at least two completed results to describe a trend."
    });
  }
  const newest = scores[0]!;
  const previous = scores[1]!;
  const delta = Math.round((newest - previous) * 10) / 10;
  if (Math.abs(delta) < 0.5) {
    return freeze({
      direction: "stable",
      deltaPercentagePoints: delta,
      sampleSize: scores.length,
      reason: `Latest result is within 0.5 points of the previous result (${previous} → ${newest}).`
    });
  }
  if (delta > 0) {
    return freeze({
      direction: "improving",
      deltaPercentagePoints: delta,
      sampleSize: scores.length,
      reason: `Latest result improved by ${delta} points versus the previous result.`
    });
  }
  return freeze({
    direction: "declining",
    deltaPercentagePoints: delta,
    sampleSize: scores.length,
    reason: `Latest result declined by ${Math.abs(delta)} points versus the previous result.`
  });
}

export function summariseDimensionPerformance(
  dimensions: readonly DiagnosticDimension[],
  options: { strengthThreshold?: number; weaknessThreshold?: number } = {}
): readonly DimensionPerformanceSummary[] {
  const strengthThreshold = options.strengthThreshold ?? 80;
  const weaknessThreshold = options.weaknessThreshold ?? 50;
  return freeze(
    dimensions.map((dimension) =>
      freeze({
        key: dimension.key,
        label: dimension.label,
        attemptCount: dimension.attemptCount,
        successPercentage: dimension.percentage,
        reviewCount: dimension.reviewCount,
        strength: dimension.percentage != null && dimension.percentage >= strengthThreshold,
        weakness: dimension.percentage != null && dimension.percentage <= weaknessThreshold
      })
    )
  );
}

export function rankWeakDimensions(
  report: DiagnosticsReport,
  limit = 5
): readonly DimensionPerformanceSummary[] {
  return freeze(
    summariseDimensionPerformance([...report.questions, ...report.topics, ...report.skills])
      .filter((entry) => entry.weakness)
      .sort((left, right) => (left.successPercentage ?? 100) - (right.successPercentage ?? 100))
      .slice(0, Math.max(0, limit))
  );
}

export function buildAssessmentReadiness(input: {
  completionPercentage: number | null;
  averageScorePercentage: number | null;
  trend: TrendSummary;
  unresolvedReviewCount: number;
  topicCoveragePercentage: number | null;
}): readonly AssessmentReadinessIndicator[] {
  return freeze([
    freeze({
      key: "completion",
      label: "Completion",
      value: input.completionPercentage,
      unit: "percent" as const,
      explanation: "Share of assigned learning attempts that are completed."
    }),
    freeze({
      key: "average-performance",
      label: "Average performance",
      value: input.averageScorePercentage,
      unit: "percent" as const,
      explanation: "Average completed attempt score percentage from authoritative attempts."
    }),
    freeze({
      key: "recent-trend",
      label: "Recent trend",
      value: input.trend.deltaPercentagePoints,
      unit: "percent" as const,
      explanation: input.trend.reason
    }),
    freeze({
      key: "unresolved-reviews",
      label: "Unresolved reviews",
      value: nonNegative(input.unresolvedReviewCount, "UNRESOLVED_REVIEW_INVALID"),
      unit: "count" as const,
      explanation: "Responses still flagged requires_review."
    }),
    freeze({
      key: "topic-coverage",
      label: "Topic coverage",
      value: input.topicCoveragePercentage,
      unit: "percent" as const,
      explanation:
        input.topicCoveragePercentage == null
          ? "Topic metadata is absent or incomplete for the selected scope."
          : "Share of responses linked to at least one topic_key."
    })
  ]);
}

export function buildInterventionSignals(input: {
  assignedNeverAttempted?: ReadonlyArray<{ entityKey: string; assignedCount: number; attemptedCount: number }>;
  repeatedAttemptsNoImprovement?: ReadonlyArray<{
    entityKey: string;
    attemptCount: number;
    firstScore: number | null;
    latestScore: number | null;
  }>;
  lowCompletion?: ReadonlyArray<{ entityKey: string; completionPercentage: number | null; threshold?: number }>;
  unresolvedReviewBacklog?: ReadonlyArray<{ entityKey: string; requiresReviewCount: number; threshold?: number }>;
  repeatedLowTopicOrSkill?: ReadonlyArray<{
    entityType: "topic" | "skill";
    entityKey: string;
    successPercentage: number | null;
    attemptCount: number;
    threshold?: number;
  }>;
  decliningRecentResults?: ReadonlyArray<{ entityKey: string; trend: TrendSummary }>;
}): readonly InterventionSignal[] {
  const signals: InterventionSignal[] = [];

  for (const row of input.assignedNeverAttempted ?? []) {
    if (row.assignedCount > 0 && row.attemptedCount === 0) {
      signals.push(
        freeze({
          key: "assigned-never-attempted" as const,
          entityType: "activity" as const,
          entityKey: requiredText(row.entityKey, "ENTITY_KEY_REQUIRED"),
          reason: "Assigned learners have not started this activity.",
          evidence: freeze({
            assignedCount: row.assignedCount,
            attemptedCount: row.attemptedCount
          })
        })
      );
    }
  }

  for (const row of input.repeatedAttemptsNoImprovement ?? []) {
    if (
      row.attemptCount >= 3
      && row.firstScore != null
      && row.latestScore != null
      && row.latestScore <= row.firstScore
    ) {
      signals.push(
        freeze({
          key: "repeated-attempts-no-improvement" as const,
          entityType: "learner" as const,
          entityKey: requiredText(row.entityKey, "ENTITY_KEY_REQUIRED"),
          reason: "Multiple attempts without an improved latest score versus the first score.",
          evidence: freeze({
            attemptCount: row.attemptCount,
            firstScore: row.firstScore,
            latestScore: row.latestScore
          })
        })
      );
    }
  }

  for (const row of input.lowCompletion ?? []) {
    const threshold = row.threshold ?? 50;
    if (row.completionPercentage != null && row.completionPercentage < threshold) {
      signals.push(
        freeze({
          key: "low-completion" as const,
          entityType: "group" as const,
          entityKey: requiredText(row.entityKey, "ENTITY_KEY_REQUIRED"),
          reason: `Completion ${row.completionPercentage}% is below the ${threshold}% attention threshold.`,
          evidence: freeze({
            completionPercentage: row.completionPercentage,
            threshold
          })
        })
      );
    }
  }

  for (const row of input.unresolvedReviewBacklog ?? []) {
    const threshold = row.threshold ?? 1;
    if (row.requiresReviewCount >= threshold) {
      signals.push(
        freeze({
          key: "unresolved-review-backlog" as const,
          entityType: "group" as const,
          entityKey: requiredText(row.entityKey, "ENTITY_KEY_REQUIRED"),
          reason: `${row.requiresReviewCount} response(s) still require teacher review.`,
          evidence: freeze({
            requiresReviewCount: row.requiresReviewCount,
            threshold
          })
        })
      );
    }
  }

  for (const row of input.repeatedLowTopicOrSkill ?? []) {
    const threshold = row.threshold ?? 50;
    if (
      row.attemptCount >= 3
      && row.successPercentage != null
      && row.successPercentage <= threshold
    ) {
      signals.push(
        freeze({
          key: "repeated-low-topic-or-skill" as const,
          entityType: row.entityType,
          entityKey: requiredText(row.entityKey, "ENTITY_KEY_REQUIRED"),
          reason: `${row.entityType} success ${row.successPercentage}% across ${row.attemptCount} responses is at or below ${threshold}%.`,
          evidence: freeze({
            successPercentage: row.successPercentage,
            attemptCount: row.attemptCount,
            threshold
          })
        })
      );
    }
  }

  for (const row of input.decliningRecentResults ?? []) {
    if (row.trend.direction === "declining") {
      signals.push(
        freeze({
          key: "declining-recent-results" as const,
          entityType: "learner" as const,
          entityKey: requiredText(row.entityKey, "ENTITY_KEY_REQUIRED"),
          reason: row.trend.reason,
          evidence: freeze({
            deltaPercentagePoints: row.trend.deltaPercentagePoints,
            sampleSize: row.trend.sampleSize
          })
        })
      );
    }
  }

  return freeze(signals);
}
