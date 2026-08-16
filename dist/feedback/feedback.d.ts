export declare const FEEDBACK_SOURCES: readonly ["automatic", "teacher", "review"];
export type FeedbackSource = (typeof FEEDBACK_SOURCES)[number];
export interface RubricOutcome {
    criterionKey: string;
    level: string;
    comment?: string | null;
}
export interface FeedbackItem {
    questionKey: string | null;
    source: FeedbackSource;
    summary: string;
    nextSteps: readonly string[];
    reviewNotes: string | null;
    rubricOutcomes: readonly RubricOutcome[];
}
export interface FeedbackBundle {
    summary: string | null;
    automatic: readonly FeedbackItem[];
    teacher: readonly FeedbackItem[];
    review: readonly FeedbackItem[];
    nextSteps: readonly string[];
}
export declare function createFeedbackItem(input: {
    questionKey?: string | null;
    source: FeedbackSource;
    summary: string;
    nextSteps?: string[];
    reviewNotes?: string | null;
    rubricOutcomes?: RubricOutcome[];
}): FeedbackItem;
export declare function createAutomaticFeedback(input: {
    questionKey: string;
    isCorrect: boolean | null;
    requiresReview: boolean;
}): FeedbackItem;
export declare function createTeacherFeedback(input: {
    questionKey: string;
    summary: string;
    nextStep?: string | null;
}): FeedbackItem;
export declare function validateTeacherFeedback(input: {
    summary: string;
    nextStep?: string | null;
}): Readonly<{
    summary: string;
    nextStep: string | null;
}>;
export declare function buildFeedback(items: FeedbackItem[]): FeedbackBundle;
