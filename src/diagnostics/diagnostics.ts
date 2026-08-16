import { freeze, requiredText } from "../shared/errors";
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

function dimension(key: string, label: string, items: DiagnosticItem[]): DiagnosticDimension {
  const correctCount = items.filter((item) => item.result.isCorrect === true).length;
  const incorrectCount = items.filter((item) => item.result.isCorrect === false).length;
  const reviewCount = items.filter((item) => item.result.requiresReview).length;
  const marked = correctCount + incorrectCount;
  return freeze({
    key,
    label,
    attemptCount: items.length,
    correctCount,
    incorrectCount,
    reviewCount,
    percentage: marked === 0 ? null : Math.round((correctCount / marked) * 1000) / 10
  });
}

function group(items: DiagnosticItem[], keyOf: (item: DiagnosticItem) => string | null | undefined, labelPrefix: string): DiagnosticDimension[] {
  const groups = new Map<string, DiagnosticItem[]>();
  for (const item of items) {
    const key = keyOf(item);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([key, grouped]) => dimension(key, `${labelPrefix}:${key}`, grouped));
}

export function buildDiagnostics(items: DiagnosticItem[], options: { strengthThreshold?: number; weaknessThreshold?: number } = {}): DiagnosticsReport {
  const strengthThreshold = options.strengthThreshold ?? 80;
  const weaknessThreshold = options.weaknessThreshold ?? 50;
  const questions = group(items, (item) => item.questionKey, "question");
  const topics = group(items, (item) => item.topicKey, "topic");
  const skills = group(items, (item) => item.skillKey, "skill");
  const ranked = [...questions, ...topics, ...skills].filter((entry) => entry.percentage != null);
  const strengths = ranked.filter((entry) => (entry.percentage ?? 0) >= strengthThreshold).map((entry) => entry.label);
  const weaknesses = ranked.filter((entry) => (entry.percentage ?? 100) <= weaknessThreshold).map((entry) => entry.label);
  const commonMistakes = questions
    .filter((entry) => entry.incorrectCount > 0)
    .sort((left, right) => right.incorrectCount - left.incorrectCount)
    .slice(0, 5)
    .map((entry) => entry.key);
  return freeze({
    questions: freeze(questions),
    topics: freeze(topics),
    skills: freeze(skills),
    strengths: freeze(strengths),
    weaknesses: freeze(weaknesses),
    commonMistakes: freeze(commonMistakes)
  });
}

export function createDiagnosticItem(input: DiagnosticItem): DiagnosticItem {
  return freeze({
    questionKey: requiredText(input.questionKey, "QUESTION_KEY_REQUIRED"),
    topicKey: input.topicKey ?? null,
    skillKey: input.skillKey ?? null,
    result: input.result
  });
}
