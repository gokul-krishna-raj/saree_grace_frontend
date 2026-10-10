// Minimal CSV writer for small client-generated downloads (e.g. the product import "problems"
// report). Mirrors the backend's src/utils/csv.ts serializer: RFC 4180 quoting, CRLF line
// endings, and a leading `'` on cells that a spreadsheet would otherwise run as a formula.
const FORMULA_PREFIX_RE = /^[=+\-@]/;
const NEGATIVE_NUMBER_RE = /^-\d+(\.\d+)?$/;

function serializeCell(value: string | number): string {
  let text = String(value);
  if (typeof value === "string" && FORMULA_PREFIX_RE.test(text) && !NEGATIVE_NUMBER_RE.test(text)) {
    text = `'${text}`;
  }
  return /[",\r\n]/.test(text) || text !== text.trim() ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: Array<Array<string | number>>): string {
  return `${rows.map((row) => row.map(serializeCell).join(",")).join("\r\n")}\r\n`;
}
