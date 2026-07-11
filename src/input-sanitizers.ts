export type InputKind =
  | "name"
  | "list"
  | "shortText"
  | "longText"
  | "integer"
  | "decimal"
  | "date"
  | "search";

export const INPUT_LIMITS = {
  name: 60,
  list: 120,
  shortText: 100,
  longText: 500,
  integer: 6,
  decimal: 10,
  date: 10,
  search: 60,
} as const;

const controlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const invalidNameCharacters = /[^A-Za-zÀ-ÖØ-öø-ÿ0-9 '\-]/g;
const invalidListCharacters = /[^A-Za-zÀ-ÖØ-öø-ÿ0-9 ,'\-/]/g;
const invalidShortTextCharacters = /[^A-Za-zÀ-ÖØ-öø-ÿ0-9 .,;:'()/%+\-]/g;

function limit(value: string, maxLength: number) {
  return value.slice(0, maxLength);
}

function normalizeSingleLineSpacing(value: string) {
  return value.replace(/\s+/g, " ").replace(/^ +/, "");
}

function sanitizeName(value: string) {
  return normalizeSingleLineSpacing(value.replace(invalidNameCharacters, ""));
}

function sanitizeList(value: string) {
  return normalizeSingleLineSpacing(value.replace(invalidListCharacters, ""))
    .replace(/(?:\s*,\s*)+/g, ", ")
    .replace(/^, +/, "");
}

function sanitizeShortText(value: string) {
  return normalizeSingleLineSpacing(value.replace(invalidShortTextCharacters, ""));
}

function sanitizeLongText(value: string) {
  return value
    .replace(controlCharacters, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\t ]+/g, " ")
    .replace(/^ +/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

function sanitizeInteger(value: string) {
  return value.replace(/\D/g, "");
}

function sanitizeDecimal(value: string) {
  const cleaned = value.replace(/[^0-9.,]/g, "");
  const separatorIndex = cleaned.search(/[.,]/);

  if (separatorIndex === -1) return cleaned;

  const integerPart = cleaned.slice(0, separatorIndex) || "0";
  const decimalPart = cleaned
    .slice(separatorIndex + 1)
    .replace(/[.,]/g, "")
    .slice(0, 2);

  return `${integerPart},${decimalPart}`;
}

function sanitizeDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function sanitizeInput(value: string, kind: InputKind, maxLength: number = INPUT_LIMITS[kind]) {
  let sanitized = value.replace(controlCharacters, "");

  if (kind === "name") sanitized = sanitizeName(sanitized);
  if (kind === "search") sanitized = sanitizeShortText(sanitized);
  if (kind === "list") sanitized = sanitizeList(sanitized);
  if (kind === "shortText") sanitized = sanitizeShortText(sanitized);
  if (kind === "longText") sanitized = sanitizeLongText(sanitized);
  if (kind === "integer") sanitized = sanitizeInteger(sanitized);
  if (kind === "decimal") sanitized = sanitizeDecimal(sanitized);
  if (kind === "date") sanitized = sanitizeDate(sanitized);

  return limit(sanitized, maxLength);
}

export function inputRule(kind: InputKind) {
  if (kind === "name") return "Lettere, numeri, spazi, apostrofo e trattino.";
  if (kind === "search") return "Ricerca testuale; caratteri invisibili e simboli non pertinenti vengono rimossi.";
  if (kind === "list") return "Lettere e numeri; separa le voci con una virgola.";
  if (kind === "shortText") return "Testo breve controllato.";
  if (kind === "longText") return "Testo libero controllato; caratteri invisibili e spazi anomali vengono rimossi.";
  if (kind === "integer") return "Solo cifre intere: segni +/−, lettere, punti e virgole non sono accettati.";
  if (kind === "decimal") return "Solo cifre e un separatore decimale; segni +/− e lettere non sono accettati.";
  if (kind === "date") return "Solo cifre; il formato YYYY-MM-DD viene inserito automaticamente.";
  return "";
}
