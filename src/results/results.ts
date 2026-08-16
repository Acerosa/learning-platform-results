import { freeze, optionalNumber, optionalText, requiredNumber, requiredText, scorePercentage } from "../shared/errors";
import type { EvidenceItem } from "../evidence/evidence";

export const MARKING_SOURCES = Object.freeze([
  "automatic",
  "teacher",
  "mixed",
  "none"
] as const);

export type MarkingSource = (typeof MARKING_SOURCES)[number];

export const CORRECTNESS = Object.freeze(["correct", "incorrect", "unknown"] as const);
export type Correctness = (typeof CORRECTNESS)[number];

export interface ResponseMark {
  questionKey: string;
  score: number | null;
  maxScore: number;
  isCorrect: boolean | null;
  requiresReview: boolean;
  markingSource: MarkingSource;
  feedbackSummary?: string | null;
}

export interface ResponseResult extends ResponseMark {
  correctness: Correctness;
  percentage: number | null;
}

export interface AttemptResult {
  activityKey: string;
  score: number | null;
  maxScore: number;
  percentage: number | null;
  requiresReview: boolean;
  markingSource: MarkingSource;
  feedbackSummary: string | null;
  responses: readonly ResponseResult[];
}

function correctnessOf(isCorrect: boolean | null): Correctness {
  if (isCorrect === true) return "correct";
  if (isCorrect === false) return "incorrect";
  return "unknown";
}

function resolveSource(sources: MarkingSource[]): MarkingSource {
  const unique = [...new Set(sources.filter((source) => source !== "none"))];
  if (unique.length === 0) return "none";
  if (unique.length === 1) return unique[0];
  return "mixed";
}

export function createResponseResult(mark: ResponseMark): ResponseResult {
  const maxScore = requiredNumber(mark.maxScore, "MAX_SCORE_REQUIRED");
  const score = optionalNumber(mark.score);
  return freeze({
    questionKey: requiredText(mark.questionKey, "QUESTION_KEY_REQUIRED"),
    score,
    maxScore,
    isCorrect: mark.isCorrect ?? null,
    requiresReview: Boolean(mark.requiresReview),
    markingSource: mark.markingSource,
    feedbackSummary: optionalText(mark.feedbackSummary),
    correctness: correctnessOf(mark.isCorrect ?? null),
    percentage: scorePercentage(score, maxScore)
  });
}

export function createAttemptResult(input: {
  activityKey: string;
  responses: ResponseMark[];
  feedbackSummary?: string | null;
}): AttemptResult {
  const responses = input.responses.map(createResponseResult);
  const maxScore = responses.reduce((sum, item) => sum + item.maxScore, 0);
  const scored = responses.filter((item) => item.score != null);
  const score = scored.length === responses.length && responses.length > 0
    ? scored.reduce((sum, item) => sum + (item.score ?? 0), 0)
    : scored.length > 0
      ? scored.reduce((sum, item) => sum + (item.score ?? 0), 0)
      : null;
  const requiresReview = responses.some((item) => item.requiresReview);
  return freeze({
    activityKey: requiredText(input.activityKey, "ACTIVITY_KEY_REQUIRED"),
    score,
    maxScore,
    percentage: scorePercentage(score, maxScore),
    requiresReview,
    markingSource: resolveSource(responses.map((item) => item.markingSource)),
    feedbackSummary: optionalText(input.feedbackSummary),
    responses: freeze(responses)
  });
}

export function mapStoredMarkingSource(source: string | null | undefined): MarkingSource {
  const value = (source ?? "").trim().toLowerCase();
  if (value === "teacher") return "teacher";
  if (value === "server" || value === "automatic" || value === "imported") return "automatic";
  if (value === "mixed") return "mixed";
  return "none";
}

export const REVIEW_REASONS = Object.freeze([
  "needs-marking",
  "teacher-feedback-required",
  "awaiting-moderation"
] as const);

export type ReviewReason = (typeof REVIEW_REASONS)[number];

export function reviewReason(mark: Pick<ResponseMark, "requiresReview" | "isCorrect" | "markingSource">): ReviewReason | null {
  if (!mark.requiresReview) return null;
  if (mark.isCorrect == null) return "needs-marking";
  if (mark.markingSource === "teacher") return "teacher-feedback-required";
  return "awaiting-moderation";
}

export interface ReviewQueueItem {
  questionKey: string;
  reason: ReviewReason;
  markingSource: MarkingSource;
}

export function buildReviewQueue(marks: readonly ResponseMark[]): readonly ReviewQueueItem[] {
  return freeze(
    marks.flatMap((mark) => {
      const reason = reviewReason(mark);
      return reason
        ? [freeze({ questionKey: mark.questionKey, reason, markingSource: mark.markingSource })]
        : [];
    })
  );
}

export function summariseMarking(attempts: readonly { markingSource?: string | null; requiresReview?: boolean }[]): Readonly<{
  attemptCount: number;
  automaticCount: number;
  teacherCount: number;
  reviewCount: number;
}> {
  return freeze({
    attemptCount: attempts.length,
    automaticCount: attempts.filter((attempt) => mapStoredMarkingSource(attempt.markingSource) === "automatic").length,
    teacherCount: attempts.filter((attempt) => mapStoredMarkingSource(attempt.markingSource) === "teacher").length,
    reviewCount: attempts.filter((attempt) => attempt.requiresReview).length
  });
}

export function interpretAttempt(input: {
  activityKey: string;
  items: readonly EvidenceItem[];
  marks: ResponseMark[];
  feedbackSummary?: string | null;
}): AttemptResult {
  const byKey = new Map(input.marks.map((mark) => [mark.questionKey, mark]));
  const responses = input.items.map((item) => {
    const mark = byKey.get(item.questionKey);
    if (mark) return mark;
    return {
      questionKey: item.questionKey,
      score: null,
      maxScore: 0,
      isCorrect: null,
      requiresReview: true,
      markingSource: "none" as const
    };
  });
  return createAttemptResult({
    activityKey: input.activityKey,
    responses,
    feedbackSummary: input.feedbackSummary
  });
}
