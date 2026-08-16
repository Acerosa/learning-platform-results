import { type LearnerProgress } from "../progress/progress";
import type { AttemptResult } from "../results/results";
export interface Learner {
    id: string;
    displayName?: string | null;
    learnerNumber?: string | null;
    groupId?: string | null;
}
export interface Activity {
    key: string;
    title?: string | null;
    maxScore?: number | null;
}
export interface Attempt {
    learnerId: string;
    activityKey: string;
    attemptNumber: number;
    completed: boolean;
    score?: number | null;
    maxScore?: number | null;
    requiresReview?: boolean;
    result?: AttemptResult | null;
}
export interface Group {
    id: string;
    name?: string | null;
    learnerIds: readonly string[];
}
export interface MarkbookRow {
    learner: Learner;
    activity: Activity;
    progress: LearnerProgress;
}
export interface MarkbookSummary {
    learnerCount: number;
    activityCount: number;
    completedCount: number;
    reviewCount: number;
}
export interface Markbook {
    group: Group | null;
    rows: readonly MarkbookRow[];
    summary: MarkbookSummary;
}
export declare function buildMarkbook(input: {
    learners: Learner[];
    activities: Activity[];
    attempts: Attempt[];
    group?: Group | null;
}): Markbook;
