import type { DiagnosticDimension, DiagnosticsReport } from "../diagnostics/diagnostics";
export declare const INTERVENTION_SIGNAL_KEYS: readonly ["assigned-never-attempted", "repeated-attempts-no-improvement", "low-completion", "unresolved-review-backlog", "repeated-low-topic-or-skill", "declining-recent-results"];
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
export declare function buildAssessmentOverview(input: AssessmentOverviewInput): AssessmentOverview;
export declare function summariseScoreDistribution(input: {
    average?: number | null;
    best?: number | null;
    latest?: number | null;
    first?: number | null;
}): ScoreDistribution;
export declare function summariseTrend(scoresNewestFirst: readonly number[]): TrendSummary;
export declare function summariseDimensionPerformance(dimensions: readonly DiagnosticDimension[], options?: {
    strengthThreshold?: number;
    weaknessThreshold?: number;
}): readonly DimensionPerformanceSummary[];
export declare function rankWeakDimensions(report: DiagnosticsReport, limit?: number): readonly DimensionPerformanceSummary[];
export declare function buildAssessmentReadiness(input: {
    completionPercentage: number | null;
    averageScorePercentage: number | null;
    trend: TrendSummary;
    unresolvedReviewCount: number;
    topicCoveragePercentage: number | null;
}): readonly AssessmentReadinessIndicator[];
export declare function buildInterventionSignals(input: {
    assignedNeverAttempted?: ReadonlyArray<{
        entityKey: string;
        assignedCount: number;
        attemptedCount: number;
    }>;
    repeatedAttemptsNoImprovement?: ReadonlyArray<{
        entityKey: string;
        attemptCount: number;
        firstScore: number | null;
        latestScore: number | null;
    }>;
    lowCompletion?: ReadonlyArray<{
        entityKey: string;
        completionPercentage: number | null;
        threshold?: number;
    }>;
    unresolvedReviewBacklog?: ReadonlyArray<{
        entityKey: string;
        requiresReviewCount: number;
        threshold?: number;
    }>;
    repeatedLowTopicOrSkill?: ReadonlyArray<{
        entityType: "topic" | "skill";
        entityKey: string;
        successPercentage: number | null;
        attemptCount: number;
        threshold?: number;
    }>;
    decliningRecentResults?: ReadonlyArray<{
        entityKey: string;
        trend: TrendSummary;
    }>;
}): readonly InterventionSignal[];
