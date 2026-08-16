export declare class ResultsError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
export declare function requiredText(value: unknown, code: string): string;
export declare function optionalText(value: unknown): string | null;
export declare function requiredNumber(value: unknown, code: string): number;
export declare function optionalNumber(value: unknown): number | null;
export declare function freeze<T>(value: T): Readonly<T>;
export declare function scorePercentage(score: number | null, maxScore: number | null): number | null;
