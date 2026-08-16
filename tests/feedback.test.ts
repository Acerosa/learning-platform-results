import test from "node:test";
import assert from "node:assert/strict";
import { buildFeedback, createFeedbackItem } from "../src/index";

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
