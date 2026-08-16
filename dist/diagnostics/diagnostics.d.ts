import type { AttemptResult } from "../results/results";
export interface DiagnosticDimension {
    key: string;
    label: string;
    attemptCount: number;
    correctCount: number;
    incorrectCount: number;
    reviewCount: number;
    percentage: number | null;
}
export interface DiagnosticsReport {
    questions: readonly DiagnosticDimension[];
    topics: readonly DiagnosticDimension[];
    skills: readonly DiagnosticDimension[];
    strengths: readonly string[];
    weaknesses: readonly string[];
    commonMistakes: readonly string[];
}
export interface DiagnosticItem {
    questionKey: string;
    topicKey?: string | null;
    skillKey?: string | null;
    result: AttemptResult["responses"][number] | {
        isCorrect: boolean | null;
        requiresReview: boolean;
        questionKey?: string;
    };
}
export declare function buildDiagnostics(items: DiagnosticItem[], options?: {
    strengthThreshold?: number;
    weaknessThreshold?: number;
}): DiagnosticsReport;
export declare function createDiagnosticItem(input: DiagnosticItem): DiagnosticItem;
