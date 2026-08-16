import type { Markbook } from "../markbook/markbook";
export declare const EXPORT_FORMATS: readonly ["csv", "excel", "pdf"];
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
    pdf: {
        title: string;
        sections: readonly {
            heading: string;
            lines: readonly string[];
        }[];
    } | null;
}
export declare function exportResults(input: {
    markbook: Markbook;
    format: ExportFormat;
    title?: string;
}): ExportDocument;
