import test from "node:test";
import assert from "node:assert/strict";
import { buildDiagnostics, createDiagnosticItem } from "../src/index";

test("diagnostics group question, topic and skill performance", () => {
  const report = buildDiagnostics([
    createDiagnosticItem({ questionKey: "q1", topicKey: "networks", skillKey: "identify", result: { isCorrect: true, requiresReview: false } }),
    createDiagnosticItem({ questionKey: "q1", topicKey: "networks", skillKey: "identify", result: { isCorrect: false, requiresReview: false } }),
    createDiagnosticItem({ questionKey: "q2", topicKey: "malware", skillKey: "explain", result: { isCorrect: false, requiresReview: false } }),
    createDiagnosticItem({ questionKey: "q3", topicKey: "networks", skillKey: "identify", result: { isCorrect: true, requiresReview: false } })
  ]);
  assert.equal(report.questions.length, 3);
  assert.equal(report.topics.find((topic) => topic.key === "malware")?.percentage, 0);
  assert.ok(report.weaknesses.includes("topic:malware"));
  assert.ok(report.commonMistakes.includes("q1"));
});
