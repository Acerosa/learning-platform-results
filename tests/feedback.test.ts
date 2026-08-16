import test from "node:test";
import assert from "node:assert/strict";
import { buildFeedback, createFeedbackItem, createTeacherFeedback, validateTeacherFeedback } from "../src/index";

test("feedback bundles automatic, teacher and review notes", () => {
  const bundle = buildFeedback([
    createFeedbackItem({
      questionKey: "q1",
      source: "automatic",
      summary: "Check the definition of phishing.",
      nextSteps: ["Revisit week 2"]
    }),
    createFeedbackItem({
      source: "teacher",
      summary: "Clear structure, add an example.",
      reviewNotes: "Mark once example is added",
      rubricOutcomes: [{ criterionKey: "structure", level: "merit" }]
    })
  ]);
  assert.equal(bundle.teacher.length, 1);
  assert.equal(bundle.automatic.length, 1);
  assert.equal(bundle.summary, "Clear structure, add an example.");
  assert.deepEqual(bundle.nextSteps, ["Revisit week 2"]);
});

test("teacher feedback helpers validate and model staff feedback", () => {
  const item = createTeacherFeedback({
    questionKey: "q2",
    summary: "Explain integrity with an example.",
    nextStep: "Revise the CIA triad notes"
  });
  assert.equal(item.source, "teacher");
  assert.deepEqual(item.nextSteps, ["Revise the CIA triad notes"]);
  assert.deepEqual(validateTeacherFeedback({ summary: "Good attempt", nextStep: " " }), {
    summary: "Good attempt",
    nextStep: null
  });
  assert.throws(() => validateTeacherFeedback({ summary: "   " }), /FEEDBACK_SUMMARY_REQUIRED/);
});
