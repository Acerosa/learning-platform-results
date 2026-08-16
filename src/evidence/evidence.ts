import { freeze, requiredText, ResultsError } from "../shared/errors";

export const EVIDENCE_TYPES = Object.freeze([
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
] as const);

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export interface MatchingPair {
  left: string;
  right: string;
}

export type EvidenceValue =
  | { optionId: string }
  | { optionIds: readonly string[] }
  | { pairs: readonly MatchingPair[] }
  | { itemIds: readonly string[] }
  | { text: string }
  | { sourceCode: string; language: string | null; output: string | null }
  | { categoryId: string; itemId: string | null }
  | { artefactId: string; mimeType: string | null; label: string | null }
  | { payload: Readonly<Record<string, unknown>> };

export interface EvidenceItem {
  questionKey: string;
  evidenceType: EvidenceType;
  value: EvidenceValue;
}

export interface AttemptEvidence {
  activityKey: string;
  items: readonly EvidenceItem[];
}

function stringList(value: unknown, code: string): readonly string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || !entry.trim())) {
    throw new ResultsError(code, `${code}: a list of non-empty strings is required`);
  }
  return freeze(value.map((entry) => entry.trim()));
}

function item(questionKey: string, evidenceType: EvidenceType, value: EvidenceValue): EvidenceItem {
  return freeze({
    questionKey: requiredText(questionKey, "QUESTION_KEY_REQUIRED"),
    evidenceType,
    value: freeze(value)
  });
}

export function createSingleChoiceEvidence(questionKey: string, optionId: string): EvidenceItem {
  return item(questionKey, "single-choice", freeze({ optionId: requiredText(optionId, "OPTION_REQUIRED") }));
}

export function createMultiSelectEvidence(questionKey: string, optionIds: string[]): EvidenceItem {
  return item(questionKey, "multi-select", freeze({ optionIds: stringList(optionIds, "OPTIONS_REQUIRED") }));
}

export function createMatchingEvidence(questionKey: string, pairs: MatchingPair[]): EvidenceItem {
  if (!Array.isArray(pairs) || pairs.some((pair) => !pair?.left?.trim() || !pair?.right?.trim())) {
    throw new ResultsError("MATCHING_PAIRS_REQUIRED", "Matching pairs require left and right values");
  }
  return item(questionKey, "matching", freeze({
    pairs: freeze(pairs.map((pair) => freeze({ left: pair.left.trim(), right: pair.right.trim() })))
  }));
}

export function createOrderingEvidence(questionKey: string, itemIds: string[]): EvidenceItem {
  return item(questionKey, "ordering", freeze({ itemIds: stringList(itemIds, "ORDER_REQUIRED") }));
}

export function createWrittenEvidence(questionKey: string, text: string): EvidenceItem {
  return item(questionKey, "written", freeze({ text: String(text ?? "") }));
}

export function createReflectionEvidence(questionKey: string, text: string): EvidenceItem {
  return item(questionKey, "reflection", freeze({ text: String(text ?? "") }));
}

export function createCodingEvidence(
  questionKey: string,
  sourceCode: string,
  options: { language?: string | null; output?: string | null } = {}
): EvidenceItem {
  return item(questionKey, "coding", freeze({
    sourceCode: String(sourceCode ?? ""),
    language: options.language?.trim() || null,
    output: typeof options.output === "string" ? options.output : null
  }));
}

export function createClassificationEvidence(
  questionKey: string,
  categoryId: string,
  itemId: string | null = null
): EvidenceItem {
  return item(questionKey, "classification", freeze({
    categoryId: requiredText(categoryId, "CATEGORY_REQUIRED"),
    itemId: itemId?.trim() || null
  }));
}

export function createArtefactEvidence(
  questionKey: string,
  artefactId: string,
  options: { mimeType?: string | null; label?: string | null } = {}
): EvidenceItem {
  return item(questionKey, "artefact", freeze({
    artefactId: requiredText(artefactId, "ARTEFACT_REQUIRED"),
    mimeType: options.mimeType?.trim() || null,
    label: options.label?.trim() || null
  }));
}

export function createStructuredEvidence(
  questionKey: string,
  payload: Record<string, unknown>
): EvidenceItem {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ResultsError("STRUCTURED_PAYLOAD_REQUIRED", "Structured evidence requires an object payload");
  }
  return item(questionKey, "structured", freeze({ payload: freeze({ ...payload }) }));
}

export function createAttemptEvidence(activityKey: string, items: EvidenceItem[]): AttemptEvidence {
  return freeze({
    activityKey: requiredText(activityKey, "ACTIVITY_KEY_REQUIRED"),
    items: freeze([...items])
  });
}

const STORED_TYPE_MAP: Record<string, EvidenceType> = {
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

function objectPayload(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function mapStoredEvidenceType(questionType: string | null | undefined, payload: unknown): EvidenceType {
  const body = objectPayload(payload);
  if (typeof body.artefactId === "string") return "artefact";
  if (typeof body.categoryId === "string") return "classification";
  if (typeof body.sourceCode === "string") return "coding";
  if (typeof body.text === "string" && questionType === "reflection") return "reflection";
  const mapped = STORED_TYPE_MAP[questionType?.trim() ?? ""];
  return mapped ?? "structured";
}

export function createEvidenceFromPayload(
  questionKey: string,
  questionType: string | null | undefined,
  payload: unknown
): EvidenceItem {
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
      return createMatchingEvidence(questionKey, body.pairs as MatchingPair[]);
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
