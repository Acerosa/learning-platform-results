import { ResultsError, freeze, optionalText, requiredText } from "../shared/errors";

export const FEEDBACK_SOURCES = Object.freeze(["automatic", "teacher", "review"] as const);
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

export function createFeedbackItem(input: {
  questionKey?: string | null;
  source: FeedbackSource;
  summary: string;
  nextSteps?: string[];
  reviewNotes?: string | null;
  rubricOutcomes?: RubricOutcome[];
}): FeedbackItem {
  return freeze({
    questionKey: optionalText(input.questionKey),
    source: input.source,
    summary: requiredText(input.summary, "FEEDBACK_SUMMARY_REQUIRED"),
    nextSteps: freeze([...(input.nextSteps ?? [])]),
    reviewNotes: optionalText(input.reviewNotes),
    rubricOutcomes: freeze([...(input.rubricOutcomes ?? [])])
  });
}

export function createAutomaticFeedback(input: {
  questionKey: string;
  isCorrect: boolean | null;
  requiresReview: boolean;
}): FeedbackItem {
  if (input.requiresReview) {
    return createFeedbackItem({
      questionKey: input.questionKey,
      source: "automatic",
      summary: "This response requires teacher review.",
      nextSteps: ["Await teacher marking"]
    });
  }
  if (input.isCorrect === true) {
    return createFeedbackItem({
      questionKey: input.questionKey,
      source: "automatic",
      summary: "Marked correct."
    });
  }
  if (input.isCorrect === false) {
    return createFeedbackItem({
      questionKey: input.questionKey,
      source: "automatic",
      summary: "Marked incorrect.",
      nextSteps: ["Review the activity guidance"]
    });
  }
  return createFeedbackItem({
    questionKey: input.questionKey,
    source: "automatic",
    summary: "No automatic feedback is available."
  });
}

export function createTeacherFeedback(input: {
  questionKey: string;
  summary: string;
  nextStep?: string | null;
}): FeedbackItem {
  const nextStep = optionalText(input.nextStep);
  return createFeedbackItem({
    questionKey: input.questionKey,
    source: "teacher",
    summary: input.summary,
    nextSteps: nextStep ? [nextStep] : [],
    reviewNotes: null
  });
}

export function validateTeacherFeedback(input: {
  summary: string;
  nextStep?: string | null;
}): Readonly<{ summary: string; nextStep: string | null }> {
  const summary = requiredText(input.summary, "FEEDBACK_SUMMARY_REQUIRED");
  if (summary.length > 2000) {
    throw new ResultsError("REVIEW_FEEDBACK_TOO_LONG", "REVIEW_FEEDBACK_TOO_LONG: feedback summary exceeds 2000 characters");
  }
  const nextStep = optionalText(input.nextStep);
  if (nextStep && nextStep.length > 500) {
    throw new ResultsError("REVIEW_NEXT_STEP_TOO_LONG", "REVIEW_NEXT_STEP_TOO_LONG: next step exceeds 500 characters");
  }
  return freeze({ summary, nextStep });
}

export function buildFeedback(items: FeedbackItem[]): FeedbackBundle {
  const automatic = items.filter((item) => item.source === "automatic");
  const teacher = items.filter((item) => item.source === "teacher");
  const review = items.filter((item) => item.source === "review");
  const nextSteps = [...new Set(items.flatMap((item) => item.nextSteps))];
  const summary = teacher[0]?.summary ?? automatic[0]?.summary ?? review[0]?.summary ?? null;
  return freeze({
    summary,
    automatic: freeze(automatic),
    teacher: freeze(teacher),
    review: freeze(review),
    nextSteps: freeze(nextSteps)
  });
}
