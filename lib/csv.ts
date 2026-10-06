export type CsvValue = string | number | null | undefined;

/**
 * Escape a single CSV field. Anything containing a quote, comma, newline or
 * leading/trailing space gets quoted, and embedded quotes are doubled.
 */
function escapeCsvValue(value: CsvValue): string {
  if (value === null || value === undefined) return "";

  const text = String(value);
  if (text === "") return "";

  // A leading =, +, - or @ makes spreadsheets treat the cell as a formula, so
  // prefix those with a single quote before escaping.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;

  if (/[",\n\r]/.test(safe) || safe !== safe.trim()) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

/**
 * Render rows as a CSV document. The BOM makes Excel read it as UTF-8 rather
 * than mangling non-ASCII names and currency symbols.
 */
export function toCsv(rows: CsvValue[][]): string {
  const body = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
  return `﻿${body}\r\n`;
}

/**
 * Wrap CSV text in a response the browser will download as a file.
 */
export function csvResponse(csv: string, filename: string) {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
