import {
  buildDiagnostics,
  buildFeedback,
  buildMarkbook,
  createLearnerProgress,
  createSingleChoiceEvidence,
  createWrittenEvidence,
  exportResults,
  interpretAttempt
} from "../src/index";

const evidence = [
  createSingleChoiceEvidence("q1", "b"),
  createWrittenEvidence("q2", "Phishing is a social-engineering attack.")
];

const attempt = interpretAttempt({
  activityKey: "week-2-quiz",
  items: evidence,
  marks: [
    { questionKey: "q1", score: 1, maxScore: 1, isCorrect: true, requiresReview: false, markingSource: "automatic" },
    { questionKey: "q2", score: null, maxScore: 4, isCorrect: null, requiresReview: true, markingSource: "teacher" }
  ]
});

const progress = createLearnerProgress({
  learnerId: "learner-1",
  activityKey: "week-2-quiz",
  attempts: [{ attemptNumber: 1, completed: true, result: attempt, requiresReview: true }]
});

const markbook = buildMarkbook({
  learners: [{ id: "learner-1", learnerNumber: "S-1" }],
  activities: [{ key: "week-2-quiz" }],
  attempts: [{ learnerId: "learner-1", activityKey: "week-2-quiz", attemptNumber: 1, completed: true, result: attempt, requiresReview: true }]
});

const diagnostics = buildDiagnostics(
  attempt.responses.map((response) => ({
    questionKey: response.questionKey,
    topicKey: "social-engineering",
    result: response
  }))
);

const feedback = buildFeedback([
  { questionKey: "q2", source: "teacher", summary: "Add an example.", nextSteps: ["Revise week 2"], reviewNotes: null, rubricOutcomes: [] }
]);

const csv = exportResults({ markbook, format: "csv" });

console.log({
  requiresReview: attempt.requiresReview,
  completionStatus: progress.completionStatus,
  diagnosticWeaknesses: diagnostics.weaknesses,
  feedbackSummary: feedback.summary,
  csv: csv.csv
});
