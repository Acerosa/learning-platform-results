export class ResultsError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ResultsError";
    this.code = code;
  }
}

export function requiredText(value: unknown, code: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new ResultsError(code, `${code}: a non-empty string is required`);
  return text;
}

export function optionalText(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

export function requiredNumber(value: unknown, code: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ResultsError(code, `${code}: a finite number is required`);
  }
  return value;
}

export function optionalNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ResultsError("INVALID_NUMBER", "A finite number is required");
  }
  return value;
}

export function freeze<T>(value: T): Readonly<T> {
  return Object.freeze(value);
}

export function scorePercentage(score: number | null, maxScore: number | null): number | null {
  if (score == null || maxScore == null || maxScore <= 0) return null;
  return Math.round((score / maxScore) * 1000) / 10;
}
