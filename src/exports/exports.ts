import { freeze } from "../shared/errors";
import type { Markbook } from "../markbook/markbook";

export const EXPORT_FORMATS = Object.freeze(["csv", "excel", "pdf"] as const);
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export interface ExportColumn {
  key: string;
  header: string;
}

export interface ExportSheet {
  name: string;
  columns: readonly ExportColumn[];
  rows: readonly Record<string, string | number | null>[];
}

export interface ExportDocument {
  format: ExportFormat;
  title: string;
  sheets: readonly ExportSheet[];
  csv: string | null;
  excel: ExportSheet | null;
  pdf: { title: string; sections: readonly { heading: string; lines: readonly string[] }[] } | null;
}

const COLUMNS: ExportColumn[] = [
  { key: "learnerId", header: "Learner" },
  { key: "activityKey", header: "Activity" },
  { key: "attemptCount", header: "Attempts" },
  { key: "completionStatus", header: "Status" },
  { key: "bestScore", header: "Best score" },
  { key: "percentage", header: "Percentage" }
];

function csvEscape(value: string | number | null): string {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll("\"", "\"\"")}"`;
  return text;
}

function sheetFromMarkbook(markbook: Markbook): ExportSheet {
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

function toCsv(sheet: ExportSheet): string {
  const header = sheet.columns.map((column) => csvEscape(column.header)).join(",");
  const lines = sheet.rows.map((row) => sheet.columns.map((column) => csvEscape(row[column.key] ?? null)).join(","));
  return [header, ...lines].join("\n");
}

export function exportResults(input: { markbook: Markbook; format: ExportFormat; title?: string }): ExportDocument {
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
          lines: freeze(sheet.rows.map((row) => `${row.learnerId} · ${row.activityKey} · ${row.completionStatus}`))
        })
      ])
    })
  });
}
