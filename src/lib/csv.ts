type Column = { key: string; label: string };

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Builds an RFC 4180-ish CSV string (with a UTF-8 BOM so Excel opens it correctly). */
export function toCsv(rows: Record<string, unknown>[], columns: readonly Column[]): string {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCsvCell(row[c.key])).join(","));
  return "﻿" + [header, ...lines].join("\r\n");
}
