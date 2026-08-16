import { freeze, requiredText } from "../shared/errors";
import { createLearnerProgress, type LearnerProgress } from "../progress/progress";
import type { AttemptResult } from "../results/results";

export interface Learner {
  id: string;
  displayName?: string | null;
  learnerNumber?: string | null;
  groupId?: string | null;
}

export interface Activity {
  key: string;
  title?: string | null;
  maxScore?: number | null;
}

export interface Attempt {
  learnerId: string;
  activityKey: string;
  attemptNumber: number;
  completed: boolean;
  score?: number | null;
  maxScore?: number | null;
  requiresReview?: boolean;
  result?: AttemptResult | null;
}

export interface Group {
  id: string;
  name?: string | null;
  learnerIds: readonly string[];
}

export interface MarkbookRow {
  learner: Learner;
  activity: Activity;
  progress: LearnerProgress;
}

export interface MarkbookSummary {
  learnerCount: number;
  activityCount: number;
  completedCount: number;
  reviewCount: number;
}

export interface Markbook {
  group: Group | null;
  rows: readonly MarkbookRow[];
  summary: MarkbookSummary;
}

export function buildMarkbook(input: {
  learners: Learner[];
  activities: Activity[];
  attempts: Attempt[];
  group?: Group | null;
}): Markbook {
  const rows: MarkbookRow[] = [];
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
