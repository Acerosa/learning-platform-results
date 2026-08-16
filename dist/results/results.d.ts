import type { EvidenceItem } from "../evidence/evidence";
export declare const MARKING_SOURCES: readonly ["automatic", "teacher", "mixed", "none"];
export type MarkingSource = (typeof MARKING_SOURCES)[number];
export declare const CORRECTNESS: readonly ["correct", "incorrect", "unknown"];
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
export declare function createResponseResult(mark: ResponseMark): ResponseResult;
export declare function createAttemptResult(input: {
    activityKey: string;
    responses: ResponseMark[];
    feedbackSummary?: string | null;
}): AttemptResult;
export declare function mapStoredMarkingSource(source: string | null | undefined): MarkingSource;
export declare const REVIEW_REASONS: readonly ["needs-marking", "teacher-feedback-required", "awaiting-moderation"];
export type ReviewReason = (typeof REVIEW_REASONS)[number];
export declare function reviewReason(mark: Pick<ResponseMark, "requiresReview" | "isCorrect" | "markingSource">): ReviewReason | null;
export interface ReviewQueueItem {
    questionKey: string;
    reason: ReviewReason;
    markingSource: MarkingSource;
}
export declare function buildReviewQueue(marks: readonly ResponseMark[]): readonly ReviewQueueItem[];
export declare function summariseMarking(attempts: readonly {
    markingSource?: string | null;
    requiresReview?: boolean;
}[]): Readonly<{
    attemptCount: number;
    automaticCount: number;
    teacherCount: number;
    reviewCount: number;
}>;
export declare function interpretAttempt(input: {
    activityKey: string;
    items: readonly EvidenceItem[];
    marks: ResponseMark[];
    feedbackSummary?: string | null;
}): AttemptResult;
