import type { AttemptResult } from "../results/results";
export declare const COMPLETION_STATUSES: readonly ["not-started", "in-progress", "completed", "requires-review"];
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
export declare function calculateCompletion(attempts: readonly AttemptRecord[]): CompletionStatus;
export declare function calculateBestAttempt(attempts: readonly AttemptRecord[]): AttemptRecord | null;
export declare function createAttemptSummary(attempt: AttemptRecord): Readonly<AttemptRecord & {
    percentage: number | null;
}>;
export declare function createLearnerProgress(input: {
    learnerId: string;
    activityKey: string;
    attempts: AttemptRecord[];
}): LearnerProgress;
export declare function createActivitySummary(input: {
    activityKey: string;
    learners: LearnerProgress[];
}): Readonly<{
    activityKey: string;
    learnerCount: number;
    completedCount: number;
    attemptCount: number;
    averagePercentage: number | null;
    bestPercentage: number | null;
}>;
export declare function createGroupResultSummary(input: {
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
}>;
