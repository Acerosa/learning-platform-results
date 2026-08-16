var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/shared/errors.ts
var ResultsError = class extends Error {
  constructor(code, message) {
    super(message);
    __publicField(this, "code");
    this.name = "ResultsError";
    this.code = code;
  }
};
function requiredText(value, code) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new ResultsError(code, `${code}: a non-empty string is required`);
  return text;
}
function optionalText(value) {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}
function requiredNumber(value, code) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ResultsError(code, `${code}: a finite number is required`);
  }
  return value;
}
function optionalNumber(value) {
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ResultsError("INVALID_NUMBER", "A finite number is required");
  }
  return value;
}
function freeze(value) {
  return Object.freeze(value);
}
function scorePercentage(score, maxScore) {
  if (score == null || maxScore == null || maxScore <= 0) return null;
  return Math.round(score / maxScore * 1e3) / 10;
}

// src/evidence/evidence.ts
var EVIDENCE_TYPES = Object.freeze([
  "single-choice",
  "multi-select",
  "matching",
  "ordering",
  "written",
  "reflection",
  "coding",
  "classification",
  "artefact",
  "structured"
]);
function stringList(value, code) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || !entry.trim())) {
    throw new ResultsError(code, `${code}: a list of non-empty strings is required`);
  }
  return freeze(value.map((entry) => entry.trim()));
}
function item(questionKey, evidenceType, value) {
  return freeze({
    questionKey: requiredText(questionKey, "QUESTION_KEY_REQUIRED"),
    evidenceType,
    value: freeze(value)
  });
}
function createSingleChoiceEvidence(questionKey, optionId) {
  return item(questionKey, "single-choice", freeze({ optionId: requiredText(optionId, "OPTION_REQUIRED") }));
}
function createMultiSelectEvidence(questionKey, optionIds) {
  return item(questionKey, "multi-select", freeze({ optionIds: stringList(optionIds, "OPTIONS_REQUIRED") }));
}
function createMatchingEvidence(questionKey, pairs) {
  if (!Array.isArray(pairs) || pairs.some((pair) => !pair?.left?.trim() || !pair?.right?.trim())) {
    throw new ResultsError("MATCHING_PAIRS_REQUIRED", "Matching pairs require left and right values");
  }
  return item(questionKey, "matching", freeze({
    pairs: freeze(pairs.map((pair) => freeze({ left: pair.left.trim(), right: pair.right.trim() })))
  }));
}
function createOrderingEvidence(questionKey, itemIds) {
  return item(questionKey, "ordering", freeze({ itemIds: stringList(itemIds, "ORDER_REQUIRED") }));
}
function createWrittenEvidence(questionKey, text) {
  return item(questionKey, "written", freeze({ text: String(text ?? "") }));
}
function createReflectionEvidence(questionKey, text) {
  return item(questionKey, "reflection", freeze({ text: String(text ?? "") }));
}
function createCodingEvidence(questionKey, sourceCode, options = {}) {
  return item(questionKey, "coding", freeze({
    sourceCode: String(sourceCode ?? ""),
    language: options.language?.trim() || null,
    output: typeof options.output === "string" ? options.output : null
  }));
}
function createClassificationEvidence(questionKey, categoryId, itemId = null) {
  return item(questionKey, "classification", freeze({
    categoryId: requiredText(categoryId, "CATEGORY_REQUIRED"),
    itemId: itemId?.trim() || null
  }));
}
function createArtefactEvidence(questionKey, artefactId, options = {}) {
  return item(questionKey, "artefact", freeze({
    artefactId: requiredText(artefactId, "ARTEFACT_REQUIRED"),
    mimeType: options.mimeType?.trim() || null,
    label: options.label?.trim() || null
  }));
}
function createStructuredEvidence(questionKey, payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ResultsError("STRUCTURED_PAYLOAD_REQUIRED", "Structured evidence requires an object payload");
  }
  return item(questionKey, "structured", freeze({ payload: freeze({ ...payload }) }));
}
function createAttemptEvidence(activityKey, items) {
  return freeze({
    activityKey: requiredText(activityKey, "ACTIVITY_KEY_REQUIRED"),
    items: freeze([...items])
  });
}
var STORED_TYPE_MAP = {
  single: "single-choice",
  "single-choice": "single-choice",
  multiple: "multi-select",
  "multi-select": "multi-select",
  matching: "matching",
  order: "ordering",
  ordering: "ordering",
  "code-order": "ordering",
  text: "written",
  written: "written",
  reflection: "reflection",
  "code-editor": "coding",
  "code-gap": "coding",
  "line-select": "coding",
  "predict-output": "coding",
  coding: "coding",
  classification: "classification",
  artefact: "artefact",
  structured: "structured"
};
function objectPayload(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function mapStoredEvidenceType(questionType, payload) {
  const body = objectPayload(payload);
  if (typeof body.artefactId === "string") return "artefact";
  if (typeof body.categoryId === "string") return "classification";
  if (typeof body.sourceCode === "string") return "coding";
  if (typeof body.text === "string" && questionType === "reflection") return "reflection";
  const mapped = STORED_TYPE_MAP[questionType?.trim() ?? ""];
  return mapped ?? "structured";
}
function createEvidenceFromPayload(questionKey, questionType, payload) {
  const body = objectPayload(payload);
  const type = mapStoredEvidenceType(questionType, payload);
  try {
    if (type === "single-choice" && typeof (body.optionId ?? body.selected) === "string") {
      return createSingleChoiceEvidence(questionKey, String(body.optionId ?? body.selected));
    }
    if (type === "multi-select" && Array.isArray(body.optionIds)) {
      return createMultiSelectEvidence(questionKey, body.optionIds.map(String));
    }
    if (type === "matching" && Array.isArray(body.pairs)) {
      return createMatchingEvidence(questionKey, body.pairs);
    }
    if (type === "ordering" && Array.isArray(body.itemIds)) {
      return createOrderingEvidence(questionKey, body.itemIds.map(String));
    }
    if (type === "written") return createWrittenEvidence(questionKey, String(body.text ?? ""));
    if (type === "reflection") return createReflectionEvidence(questionKey, String(body.text ?? ""));
    if (type === "coding") {
      return createCodingEvidence(questionKey, String(body.sourceCode ?? ""), {
        language: typeof body.language === "string" ? body.language : null,
        output: typeof body.output === "string" ? body.output : null
      });
    }
    if (type === "classification" && typeof body.categoryId === "string") {
      return createClassificationEvidence(
        questionKey,
        body.categoryId,
        typeof body.itemId === "string" ? body.itemId : null
      );
    }
    if (type === "artefact" && typeof body.artefactId === "string") {
      return createArtefactEvidence(questionKey, body.artefactId, {
        mimeType: typeof body.mimeType === "string" ? body.mimeType : null,
        label: typeof body.label === "string" ? body.label : null
      });
    }
  } catch {
    return createStructuredEvidence(questionKey, body);
  }
  return createStructuredEvidence(questionKey, body);
}

// src/results/results.ts
var MARKING_SOURCES = Object.freeze([
  "automatic",
  "teacher",
  "mixed",
  "none"
]);
var CORRECTNESS = Object.freeze(["correct", "incorrect", "unknown"]);
function correctnessOf(isCorrect) {
  if (isCorrect === true) return "correct";
  if (isCorrect === false) return "incorrect";
  return "unknown";
}
function resolveSource(sources) {
  const unique = [...new Set(sources.filter((source) => source !== "none"))];
  if (unique.length === 0) return "none";
  if (unique.length === 1) return unique[0];
  return "mixed";
}
function createResponseResult(mark) {
  const maxScore = requiredNumber(mark.maxScore, "MAX_SCORE_REQUIRED");
  const score = optionalNumber(mark.score);
  return freeze({
    questionKey: requiredText(mark.questionKey, "QUESTION_KEY_REQUIRED"),
    score,
    maxScore,
    isCorrect: mark.isCorrect ?? null,
    requiresReview: Boolean(mark.requiresReview),
    markingSource: mark.markingSource,
    feedbackSummary: optionalText(mark.feedbackSummary),
    correctness: correctnessOf(mark.isCorrect ?? null),
    percentage: scorePercentage(score, maxScore)
  });
}
function createAttemptResult(input) {
  const responses = input.responses.map(createResponseResult);
  const maxScore = responses.reduce((sum, item2) => sum + item2.maxScore, 0);
  const scored = responses.filter((item2) => item2.score != null);
  const score = scored.length === responses.length && responses.length > 0 ? scored.reduce((sum, item2) => sum + (item2.score ?? 0), 0) : scored.length > 0 ? scored.reduce((sum, item2) => sum + (item2.score ?? 0), 0) : null;
  const requiresReview = responses.some((item2) => item2.requiresReview);
  return freeze({
    activityKey: requiredText(input.activityKey, "ACTIVITY_KEY_REQUIRED"),
    score,
    maxScore,
    percentage: scorePercentage(score, maxScore),
    requiresReview,
    markingSource: resolveSource(responses.map((item2) => item2.markingSource)),
    feedbackSummary: optionalText(input.feedbackSummary),
    responses: freeze(responses)
  });
}
function mapStoredMarkingSource(source) {
  const value = (source ?? "").trim().toLowerCase();
  if (value === "teacher") return "teacher";
  if (value === "server" || value === "automatic" || value === "imported") return "automatic";
  if (value === "mixed") return "mixed";
  return "none";
}
var REVIEW_REASONS = Object.freeze([
  "needs-marking",
  "teacher-feedback-required",
  "awaiting-moderation"
]);
function reviewReason(mark) {
  if (!mark.requiresReview) return null;
  if (mark.isCorrect == null) return "needs-marking";
  if (mark.markingSource === "teacher") return "teacher-feedback-required";
  return "awaiting-moderation";
}
function buildReviewQueue(marks) {
  return freeze(
    marks.flatMap((mark) => {
      const reason = reviewReason(mark);
      return reason ? [freeze({ questionKey: mark.questionKey, reason, markingSource: mark.markingSource })] : [];
    })
  );
}
function summariseMarking(attempts) {
  return freeze({
    attemptCount: attempts.length,
    automaticCount: attempts.filter((attempt) => mapStoredMarkingSource(attempt.markingSource) === "automatic").length,
    teacherCount: attempts.filter((attempt) => mapStoredMarkingSource(attempt.markingSource) === "teacher").length,
    reviewCount: attempts.filter((attempt) => attempt.requiresReview).length
  });
}
var REVIEW_STATES = Object.freeze(["requires_review", "reviewed"]);
function reviewState(mark) {
  return mark.requiresReview ? "requires_review" : "reviewed";
}
function validateReviewDecision(input) {
  const maxScore = requiredNumber(input.maxScore, "MAX_SCORE_REQUIRED");
  const awardedScore = requiredNumber(input.awardedScore, "AWARDED_SCORE_REQUIRED");
  if (awardedScore < 0 || awardedScore > maxScore) {
    throw new ResultsError("REVIEW_SCORE_INVALID", "REVIEW_SCORE_INVALID: awarded score must be within 0 and max score");
  }
  const allowUnknown = input.allowUnknownCorrectness !== false;
  if (input.isCorrect == null && !allowUnknown) {
    throw new ResultsError("REVIEW_CORRECTNESS_REQUIRED", "REVIEW_CORRECTNESS_REQUIRED: correctness is required");
  }
  return freeze({
    awardedScore,
    maxScore,
    isCorrect: input.isCorrect ?? null
  });
}
function summariseReviewChange(input) {
  return freeze({
    scoreChanged: input.before.score !== input.after.score,
    correctnessChanged: input.before.isCorrect !== input.after.isCorrect,
    reviewCleared: Boolean(input.before.requiresReview) && !input.after.requiresReview,
    feedbackChanged: (input.before.feedbackSummary ?? null) !== (input.after.feedbackSummary ?? null),
    markingSourceChanged: input.before.markingSource !== input.after.markingSource
  });
}
function interpretAttempt(input) {
  const byKey = new Map(input.marks.map((mark) => [mark.questionKey, mark]));
  const responses = input.items.map((item2) => {
    const mark = byKey.get(item2.questionKey);
    if (mark) return mark;
    return {
      questionKey: item2.questionKey,
      score: null,
      maxScore: 0,
      isCorrect: null,
      requiresReview: true,
      markingSource: "none"
    };
  });
  return createAttemptResult({
    activityKey: input.activityKey,
    responses,
    feedbackSummary: input.feedbackSummary
  });
}

// src/progress/progress.ts
var COMPLETION_STATUSES = Object.freeze([
  "not-started",
  "in-progress",
  "completed",
  "requires-review"
]);
function calculateCompletion(attempts) {
  if (attempts.length === 0) return "not-started";
  if (attempts.some((attempt) => attempt.requiresReview || attempt.result?.requiresReview)) {
    return "requires-review";
  }
  if (attempts.some((attempt) => attempt.completed)) return "completed";
  return "in-progress";
}
function calculateBestAttempt(attempts) {
  const scored = attempts.filter((attempt) => {
    const score = attempt.score ?? attempt.result?.score;
    return typeof score === "number";
  });
  if (scored.length === 0) return attempts.at(-1) ?? null;
  return scored.reduce((best, current) => {
    const bestScore = best.score ?? best.result?.score ?? Number.NEGATIVE_INFINITY;
    const currentScore = current.score ?? current.result?.score ?? Number.NEGATIVE_INFINITY;
    return currentScore >= bestScore ? current : best;
  });
}
function createAttemptSummary(attempt) {
  const score = optionalNumber(attempt.score ?? attempt.result?.score ?? null);
  const maxScore = optionalNumber(attempt.maxScore ?? attempt.result?.maxScore ?? null);
  return freeze({
    ...attempt,
    score,
    maxScore,
    percentage: scorePercentage(score, maxScore)
  });
}
function createLearnerProgress(input) {
  const attempts = [...input.attempts].sort((left, right) => left.attemptNumber - right.attemptNumber);
  const firstAttempt = attempts[0] ?? null;
  const latestAttempt = attempts.at(-1) ?? null;
  const bestAttempt = calculateBestAttempt(attempts);
  const bestScore = bestAttempt?.score ?? bestAttempt?.result?.score ?? null;
  const latestScore = latestAttempt?.score ?? latestAttempt?.result?.score ?? null;
  const maxScore = bestAttempt?.maxScore ?? bestAttempt?.result?.maxScore ?? latestAttempt?.maxScore ?? latestAttempt?.result?.maxScore ?? null;
  const completionStatus = calculateCompletion(attempts);
  return freeze({
    learnerId: requiredText(input.learnerId, "LEARNER_ID_REQUIRED"),
    activityKey: requiredText(input.activityKey, "ACTIVITY_KEY_REQUIRED"),
    attemptCount: attempts.length,
    completed: attempts.some((item2) => item2.completed),
    completionStatus,
    firstAttempt,
    latestAttempt,
    bestAttempt,
    bestScore,
    latestScore,
    percentage: scorePercentage(bestScore, maxScore)
  });
}
function createActivitySummary(input) {
  const percentages = input.learners.map((learner) => learner.percentage).filter((value) => value != null);
  const averagePercentage = percentages.length ? Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length * 10) / 10 : null;
  const bestPercentage = percentages.length ? Math.max(...percentages) : null;
  return freeze({
    activityKey: requiredText(input.activityKey, "ACTIVITY_KEY_REQUIRED"),
    learnerCount: input.learners.length,
    completedCount: input.learners.filter((learner) => learner.completed).length,
    attemptCount: input.learners.reduce((sum, learner) => sum + learner.attemptCount, 0),
    averagePercentage,
    bestPercentage
  });
}
function createGroupResultSummary(input) {
  const percentages = input.learners.map((learner) => learner.percentage).filter((value) => value != null);
  return freeze({
    groupId: requiredText(input.groupId, "GROUP_ID_REQUIRED"),
    learnerCount: input.learners.length,
    completedCount: input.learners.filter((learner) => learner.completed).length,
    attemptCount: input.learners.reduce((sum, learner) => sum + learner.attemptCount, 0),
    reviewCount: input.learners.filter((learner) => learner.completionStatus === "requires-review").length,
    averagePercentage: percentages.length ? Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length * 10) / 10 : null,
    highestPercentage: percentages.length ? Math.max(...percentages) : null,
    lowestPercentage: percentages.length ? Math.min(...percentages) : null
  });
}

// src/diagnostics/diagnostics.ts
function dimension(key, label, items) {
  const correctCount = items.filter((item2) => item2.result.isCorrect === true).length;
  const incorrectCount = items.filter((item2) => item2.result.isCorrect === false).length;
  const reviewCount = items.filter((item2) => item2.result.requiresReview).length;
  const marked = correctCount + incorrectCount;
  return freeze({
    key,
    label,
    attemptCount: items.length,
    correctCount,
    incorrectCount,
    reviewCount,
    percentage: marked === 0 ? null : Math.round(correctCount / marked * 1e3) / 10
  });
}
function group(items, keyOf, labelPrefix) {
  const groups = /* @__PURE__ */ new Map();
  for (const item2 of items) {
    const key = keyOf(item2);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(item2);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([key, grouped]) => dimension(key, `${labelPrefix}:${key}`, grouped));
}
function buildDiagnostics(items, options = {}) {
  const strengthThreshold = options.strengthThreshold ?? 80;
  const weaknessThreshold = options.weaknessThreshold ?? 50;
  const questions = group(items, (item2) => item2.questionKey, "question");
  const topics = group(items, (item2) => item2.topicKey, "topic");
  const skills = group(items, (item2) => item2.skillKey, "skill");
  const ranked = [...questions, ...topics, ...skills].filter((entry) => entry.percentage != null);
  const strengths = ranked.filter((entry) => (entry.percentage ?? 0) >= strengthThreshold).map((entry) => entry.label);
  const weaknesses = ranked.filter((entry) => (entry.percentage ?? 100) <= weaknessThreshold).map((entry) => entry.label);
  const commonMistakes = questions.filter((entry) => entry.incorrectCount > 0).sort((left, right) => right.incorrectCount - left.incorrectCount).slice(0, 5).map((entry) => entry.key);
  return freeze({
    questions: freeze(questions),
    topics: freeze(topics),
    skills: freeze(skills),
    strengths: freeze(strengths),
    weaknesses: freeze(weaknesses),
    commonMistakes: freeze(commonMistakes)
  });
}
function createDiagnosticItem(input) {
  return freeze({
    questionKey: requiredText(input.questionKey, "QUESTION_KEY_REQUIRED"),
    topicKey: input.topicKey ?? null,
    skillKey: input.skillKey ?? null,
    result: input.result
  });
}

// src/feedback/feedback.ts
var FEEDBACK_SOURCES = Object.freeze(["automatic", "teacher", "review"]);
function createFeedbackItem(input) {
  return freeze({
    questionKey: optionalText(input.questionKey),
    source: input.source,
    summary: requiredText(input.summary, "FEEDBACK_SUMMARY_REQUIRED"),
    nextSteps: freeze([...input.nextSteps ?? []]),
    reviewNotes: optionalText(input.reviewNotes),
    rubricOutcomes: freeze([...input.rubricOutcomes ?? []])
  });
}
function createAutomaticFeedback(input) {
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
function createTeacherFeedback(input) {
  const nextStep = optionalText(input.nextStep);
  return createFeedbackItem({
    questionKey: input.questionKey,
    source: "teacher",
    summary: input.summary,
    nextSteps: nextStep ? [nextStep] : [],
    reviewNotes: null
  });
}
function validateTeacherFeedback(input) {
  const summary = requiredText(input.summary, "FEEDBACK_SUMMARY_REQUIRED");
  if (summary.length > 2e3) {
    throw new ResultsError("REVIEW_FEEDBACK_TOO_LONG", "REVIEW_FEEDBACK_TOO_LONG: feedback summary exceeds 2000 characters");
  }
  const nextStep = optionalText(input.nextStep);
  if (nextStep && nextStep.length > 500) {
    throw new ResultsError("REVIEW_NEXT_STEP_TOO_LONG", "REVIEW_NEXT_STEP_TOO_LONG: next step exceeds 500 characters");
  }
  return freeze({ summary, nextStep });
}
function buildFeedback(items) {
  const automatic = items.filter((item2) => item2.source === "automatic");
  const teacher = items.filter((item2) => item2.source === "teacher");
  const review = items.filter((item2) => item2.source === "review");
  const nextSteps = [...new Set(items.flatMap((item2) => item2.nextSteps))];
  const summary = teacher[0]?.summary ?? automatic[0]?.summary ?? review[0]?.summary ?? null;
  return freeze({
    summary,
    automatic: freeze(automatic),
    teacher: freeze(teacher),
    review: freeze(review),
    nextSteps: freeze(nextSteps)
  });
}

// src/markbook/markbook.ts
function buildMarkbook(input) {
  const rows = [];
  for (const learner of input.learners) {
    for (const activity of input.activities) {
      const attempts = input.attempts.filter(
        (attempt) => attempt.learnerId === learner.id && attempt.activityKey === activity.key
      );
      rows.push(freeze({
        learner: freeze({ ...learner, id: requiredText(learner.id, "LEARNER_ID_REQUIRED") }),
        activity: freeze({ ...activity, key: requiredText(activity.key, "ACTIVITY_KEY_REQUIRED") }),
        progress: createLearnerProgress({
          learnerId: learner.id,
          activityKey: activity.key,
          attempts
        })
      }));
    }
  }
  const summary = freeze({
    learnerCount: input.learners.length,
    activityCount: input.activities.length,
    completedCount: rows.filter((row) => row.progress.completed).length,
    reviewCount: rows.filter((row) => row.progress.completionStatus === "requires-review").length
  });
  return freeze({
    group: input.group ? freeze({ ...input.group, learnerIds: freeze([...input.group.learnerIds]) }) : null,
    rows: freeze(rows),
    summary
  });
}

// src/exports/exports.ts
var EXPORT_FORMATS = Object.freeze(["csv", "excel", "pdf"]);
var COLUMNS = [
  { key: "learnerId", header: "Learner" },
  { key: "activityKey", header: "Activity" },
  { key: "attemptCount", header: "Attempts" },
  { key: "completionStatus", header: "Status" },
  { key: "bestScore", header: "Best score" },
  { key: "percentage", header: "Percentage" }
];
function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}
function sheetFromMarkbook(markbook) {
  return freeze({
    name: "Results",
    columns: freeze(COLUMNS),
    rows: freeze(markbook.rows.map((row) => freeze({
      learnerId: row.learner.learnerNumber ?? row.learner.id,
      activityKey: row.activity.key,
      attemptCount: row.progress.attemptCount,
      completionStatus: row.progress.completionStatus,
      bestScore: row.progress.bestScore,
      percentage: row.progress.percentage
    })))
  });
}
function toCsv(sheet) {
  const header = sheet.columns.map((column) => csvEscape(column.header)).join(",");
  const lines = sheet.rows.map((row) => sheet.columns.map((column) => csvEscape(row[column.key] ?? null)).join(","));
  return [header, ...lines].join("\n");
}
function exportResults(input) {
  const sheet = sheetFromMarkbook(input.markbook);
  const title = input.title ?? "Learning Platform results";
  if (input.format === "csv") {
    return freeze({
      format: "csv",
      title,
      sheets: freeze([sheet]),
      csv: toCsv(sheet),
      excel: null,
      pdf: null
    });
  }
  if (input.format === "excel") {
    return freeze({
      format: "excel",
      title,
      sheets: freeze([sheet]),
      csv: null,
      excel: sheet,
      pdf: null
    });
  }
  return freeze({
    format: "pdf",
    title,
    sheets: freeze([sheet]),
    csv: null,
    excel: null,
    pdf: freeze({
      title,
      sections: freeze([
        freeze({
          heading: "Results",
          lines: freeze(sheet.rows.map((row) => `${row.learnerId} \xB7 ${row.activityKey} \xB7 ${row.completionStatus}`))
        })
      ])
    })
  });
}
export {
  COMPLETION_STATUSES,
  CORRECTNESS,
  EVIDENCE_TYPES,
  EXPORT_FORMATS,
  FEEDBACK_SOURCES,
  MARKING_SOURCES,
  REVIEW_REASONS,
  REVIEW_STATES,
  ResultsError,
  buildDiagnostics,
  buildFeedback,
  buildMarkbook,
  buildReviewQueue,
  calculateBestAttempt,
  calculateCompletion,
  createActivitySummary,
  createArtefactEvidence,
  createAttemptEvidence,
  createAttemptResult,
  createAttemptSummary,
  createAutomaticFeedback,
  createClassificationEvidence,
  createCodingEvidence,
  createDiagnosticItem,
  createEvidenceFromPayload,
  createFeedbackItem,
  createGroupResultSummary,
  createLearnerProgress,
  createMatchingEvidence,
  createMultiSelectEvidence,
  createOrderingEvidence,
  createReflectionEvidence,
  createResponseResult,
  createSingleChoiceEvidence,
  createStructuredEvidence,
  createTeacherFeedback,
  createWrittenEvidence,
  exportResults,
  interpretAttempt,
  mapStoredEvidenceType,
  mapStoredMarkingSource,
  reviewReason,
  reviewState,
  summariseMarking,
  summariseReviewChange,
  validateReviewDecision,
  validateTeacherFeedback
};
//# sourceMappingURL=learning-platform-results.esm.js.map
