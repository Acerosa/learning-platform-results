import { freeze, optionalNumber, requiredText, scorePercentage } from "../shared/errors";
import type { AttemptResult } from "../results/results";

export const COMPLETION_STATUSES = Object.freeze([
  "not-started",
  "in-progress",
  "completed",
  "requires-review"
] as const);

export type CompletionStatus = (typeof COMPLETION_STATUSES)[number];

export interface AttemptRecord {
  attemptNumber: number;
  completed: boolean;
  submittedAt?: string | null;
  result?: AttemptResult | null;
  score?: number | null;
  maxScore?: number | null;
  requiresReview?: boolean;
}

export interface LearnerProgress {
  learnerId: string;
  activityKey: string;
  attemptCount: number;
  completed: boolean;
  completionStatus: CompletionStatus;
  firstAttempt: AttemptRecord | null;
  latestAttempt: AttemptRecord | null;
  bestAttempt: AttemptRecord | null;
  bestScore: number | null;
  latestScore: number | null;
  percentage: number | null;
}

export function calculateCompletion(attempts: readonly AttemptRecord[]): CompletionStatus {
  if (attempts.length === 0) return "not-started";
  if (attempts.some((attempt) => attempt.requiresReview || attempt.result?.requiresReview)) {
    return "requires-review";
  }
  if (attempts.some((attempt) => attempt.completed)) return "completed";
  return "in-progress";
}

export function calculateBestAttempt(attempts: readonly AttemptRecord[]): AttemptRecord | null {
  const scored = attempts.filter((attempt) => {
    const score = attempt.score ?? attempt.result?.score;
    return typeof score === "number";
  });
  if (scored.length === 0) return attempts.at(-1) ?? null;
  return scored.reduce((best, current) => {
    const bestScore = best.score ?? best.result?.score ?? Number.NEGATIVE_INFINITY;
    const currentScore = current.score ?? current.result?.score ?? Number.NEGATIVE_INFINITY;
    return currentScore >= bestScore ? current : best;
  });
}

export function createAttemptSummary(attempt: AttemptRecord): Readonly<AttemptRecord & { percentage: number | null }> {
  const score = optionalNumber(attempt.score ?? attempt.result?.score ?? null);
  const maxScore = optionalNumber(attempt.maxScore ?? attempt.result?.maxScore ?? null);
  return freeze({
    ...attempt,
    score,
    maxScore,
    percentage: scorePercentage(score, maxScore)
  });
}

export function createLearnerProgress(input: {
  learnerId: string;
  activityKey: string;
  attempts: AttemptRecord[];
}): LearnerProgress {
  const attempts = [...input.attempts].sort((left, right) => left.attemptNumber - right.attemptNumber);
  const firstAttempt = attempts[0] ?? null;
  const latestAttempt = attempts.at(-1) ?? null;
  const bestAttempt = calculateBestAttempt(attempts);
  const bestScore = bestAttempt?.score ?? bestAttempt?.result?.score ?? null;
  const latestScore = latestAttempt?.score ?? latestAttempt?.result?.score ?? null;
  const maxScore = bestAttempt?.maxScore ?? bestAttempt?.result?.maxScore ?? latestAttempt?.maxScore ?? latestAttempt?.result?.maxScore ?? null;
  const completionStatus = calculateCompletion(attempts);
  return freeze({
    learnerId: requiredText(input.learnerId, "LEARNER_ID_REQUIRED"),
    activityKey: requiredText(input.activityKey, "ACTIVITY_KEY_REQUIRED"),
    attemptCount: attempts.length,
    completed: attempts.some((item) => item.completed),
    completionStatus,
    firstAttempt,
    latestAttempt,
    bestAttempt,
    bestScore,
    latestScore,
    percentage: scorePercentage(bestScore, maxScore)
  });
}

export function createActivitySummary(input: {
  activityKey: string;
  learners: LearnerProgress[];
}): Readonly<{
  activityKey: string;
  learnerCount: number;
  completedCount: number;
  attemptCount: number;
  averagePercentage: number | null;
  bestPercentage: number | null;
}> {
  const percentages = input.learners
    .map((learner) => learner.percentage)
    .filter((value): value is number => value != null);
  const averagePercentage = percentages.length
    ? Math.round((percentages.reduce((sum, value) => sum + value, 0) / percentages.length) * 10) / 10
    : null;
  const bestPercentage = percentages.length ? Math.max(...percentages) : null;
  return freeze({
    activityKey: requiredText(input.activityKey, "ACTIVITY_KEY_REQUIRED"),
    learnerCount: input.learners.length,
    completedCount: input.learners.filter((learner) => learner.completed).length,
    attemptCount: input.learners.reduce((sum, learner) => sum + learner.attemptCount, 0),
    averagePercentage,
    bestPercentage
  });
}

export function createGroupResultSummary(input: {
  groupId: string;
  learners: LearnerProgress[];
}): Readonly<{
  groupId: string;
  learnerCount: number;
  completedCount: number;
  attemptCount: number;
  reviewCount: number;
  averagePercentage: number | null;
  highestPercentage: number | null;
  lowestPercentage: number | null;
}> {
  const percentages = input.learners
    .map((learner) => learner.percentage)
    .filter((value): value is number => value != null);
  return freeze({
    groupId: requiredText(input.groupId, "GROUP_ID_REQUIRED"),
    learnerCount: input.learners.length,
    completedCount: input.learners.filter((learner) => learner.completed).length,
    attemptCount: input.learners.reduce((sum, learner) => sum + learner.attemptCount, 0),
    reviewCount: input.learners.filter((learner) => learner.completionStatus === "requires-review").length,
    averagePercentage: percentages.length
      ? Math.round((percentages.reduce((sum, value) => sum + value, 0) / percentages.length) * 10) / 10
      : null,
    highestPercentage: percentages.length ? Math.max(...percentages) : null,
    lowestPercentage: percentages.length ? Math.min(...percentages) : null
  });
}
