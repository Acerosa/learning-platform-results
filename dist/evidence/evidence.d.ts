export declare const EVIDENCE_TYPES: readonly ["single-choice", "multi-select", "matching", "ordering", "written", "reflection", "coding", "classification", "artefact", "structured"];
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];
export interface MatchingPair {
    left: string;
    right: string;
}
export type EvidenceValue = {
    optionId: string;
} | {
    optionIds: readonly string[];
} | {
    pairs: readonly MatchingPair[];
} | {
    itemIds: readonly string[];
} | {
    text: string;
} | {
    sourceCode: string;
    language: string | null;
    output: string | null;
} | {
    categoryId: string;
    itemId: string | null;
} | {
    artefactId: string;
    mimeType: string | null;
    label: string | null;
} | {
    payload: Readonly<Record<string, unknown>>;
};
export interface EvidenceItem {
    questionKey: string;
    evidenceType: EvidenceType;
    value: EvidenceValue;
}
export interface AttemptEvidence {
    activityKey: string;
    items: readonly EvidenceItem[];
}
export declare function createSingleChoiceEvidence(questionKey: string, optionId: string): EvidenceItem;
export declare function createMultiSelectEvidence(questionKey: string, optionIds: string[]): EvidenceItem;
export declare function createMatchingEvidence(questionKey: string, pairs: MatchingPair[]): EvidenceItem;
export declare function createOrderingEvidence(questionKey: string, itemIds: string[]): EvidenceItem;
export declare function createWrittenEvidence(questionKey: string, text: string): EvidenceItem;
export declare function createReflectionEvidence(questionKey: string, text: string): EvidenceItem;
export declare function createCodingEvidence(questionKey: string, sourceCode: string, options?: {
    language?: string | null;
    output?: string | null;
}): EvidenceItem;
export declare function createClassificationEvidence(questionKey: string, categoryId: string, itemId?: string | null): EvidenceItem;
export declare function createArtefactEvidence(questionKey: string, artefactId: string, options?: {
    mimeType?: string | null;
    label?: string | null;
}): EvidenceItem;
export declare function createStructuredEvidence(questionKey: string, payload: Record<string, unknown>): EvidenceItem;
export declare function createAttemptEvidence(activityKey: string, items: EvidenceItem[]): AttemptEvidence;
export declare function mapStoredEvidenceType(questionType: string | null | undefined, payload: unknown): EvidenceType;
export declare function createEvidenceFromPayload(questionKey: string, questionType: string | null | undefined, payload: unknown): EvidenceItem;
