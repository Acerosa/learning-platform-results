import test from "node:test";
import assert from "node:assert/strict";
import {
  ResultsError,
  createArtefactEvidence,
  createAttemptEvidence,
  createClassificationEvidence,
  createCodingEvidence,
  createMatchingEvidence,
  createMultiSelectEvidence,
  createOrderingEvidence,
  createReflectionEvidence,
  createSingleChoiceEvidence,
  createStructuredEvidence,
  createWrittenEvidence,
  createEvidenceFromPayload
} from "../src/index";

test("evidence models submissions independently of marking", () => {
  const items = [
    createSingleChoiceEvidence("q1", "a"),
    createMultiSelectEvidence("q2", ["a", "b"]),
    createMatchingEvidence("q3", [{ left: "l", right: "r" }]),
    createOrderingEvidence("q4", ["one", "two"]),
    createWrittenEvidence("q5", "an answer"),
    createReflectionEvidence("q6", "I learned"),
    createCodingEvidence("q7", "print(1)", { language: "python" }),
    createClassificationEvidence("q8", "network", "item-1"),
    createArtefactEvidence("q9", "file-1", { mimeType: "application/pdf", label: "report" }),
    createStructuredEvidence("q10", { selected: ["x"] })
  ];
  const attempt = createAttemptEvidence("week-1-quiz", items);
  assert.equal(attempt.items.length, 10);
  assert.equal(attempt.items[0].evidenceType, "single-choice");
  assert.equal("score" in attempt.items[0], false);
});

test("evidence rejects empty question keys", () => {
  assert.throws(() => createSingleChoiceEvidence(" ", "a"), ResultsError);
});

test("evidence can be reconstructed from stored payloads", () => {
  const choice = createEvidenceFromPayload("q1", "single", { optionId: "b" });
  assert.equal(choice.evidenceType, "single-choice");
});
