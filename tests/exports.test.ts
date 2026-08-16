import test from "node:test";
import assert from "node:assert/strict";
import { buildMarkbook, exportResults } from "../src/index";

const markbook = buildMarkbook({
  learners: [{ id: "l1", learnerNumber: "S-1" }],
  activities: [{ key: "quiz-1" }],
  attempts: [{ learnerId: "l1", activityKey: "quiz-1", attemptNumber: 1, completed: true, score: 8, maxScore: 10 }]
});

test("csv export is a tabular model, not a UI", () => {
  const document = exportResults({ markbook, format: "csv" });
  assert.match(document.csv ?? "", /Learner,Activity/);
  assert.match(document.csv ?? "", /S-1,quiz-1,1,completed,8,80/);
});

test("excel export is a sheet model", () => {
  const document = exportResults({ markbook, format: "excel" });
  assert.equal(document.excel?.rows[0].percentage, 80);
  assert.equal(document.csv, null);
});

test("pdf export is a document model", () => {
  const document = exportResults({ markbook, format: "pdf", title: "Group A" });
  assert.equal(document.pdf?.title, "Group A");
  assert.match(document.pdf?.sections[0].lines[0] ?? "", /S-1 · quiz-1 · completed/);
});
