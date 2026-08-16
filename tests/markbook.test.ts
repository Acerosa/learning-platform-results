import test from "node:test";
import assert from "node:assert/strict";
import { buildMarkbook } from "../src/index";

test("markbook composes learners, activities and attempts", () => {
  const markbook = buildMarkbook({
    group: { id: "g1", name: "Group A", learnerIds: ["l1"] },
    learners: [{ id: "l1", learnerNumber: "S-1" }],
    activities: [{ key: "quiz-1", title: "Quiz 1" }],
    attempts: [
      { learnerId: "l1", activityKey: "quiz-1", attemptNumber: 1, completed: true, score: 8, maxScore: 10 }
    ]
  });
  assert.equal(markbook.rows.length, 1);
  assert.equal(markbook.rows[0].progress.bestScore, 8);
  assert.equal(markbook.summary.completedCount, 1);
  assert.equal(markbook.group?.id, "g1");
});
