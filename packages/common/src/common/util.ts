import {
  parseISO,
  startOfWeek as dateFnsStartOfWeek,
  endOfWeek as dateFnsEndOfWeek,
  format,
  isValid,
  isAfter,
  parse,
} from "date-fns";
import { fi } from "date-fns/locale";
import { capitalize } from "lodash";
import { type TFunction, i18n } from "next-i18next";

export const parseDate = (date: string): Date => parseISO(date);

export const startOfWeek = (d: Date): Date =>
  dateFnsStartOfWeek(d, { weekStartsOn: 1 });

export const endOfWeek = (d: Date): Date =>
  dateFnsEndOfWeek(d, { weekStartsOn: 1 });

export function formatDuration(
  durationMinutes: number,
  t: TFunction,
  abbreviated = true
): string {
  if (!durationMinutes) {
    return "-";
  }

  const hour = Math.floor(durationMinutes / 60);
  const min = Math.floor(durationMinutes % 60);

  const hourKey = abbreviated ? "common:abbreviations.hour" : "common:hour";
  const minuteKey = abbreviated
    ? "common:abbreviations.minute"
    : "common:minute";

  const p = [];

  if (hour) {
    p.push(t(hourKey, { count: hour }).toLocaleLowerCase());
  }
  if (min) {
    p.push(t(minuteKey, { count: min }).toLocaleLowerCase());
  }

  return p.join(" ");
}

export function addYears(date: Date, years: number): Date {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
}

// Returns a string in specified format (default: "yyyy-MM-dd") from a Date object,
// pass a format string as a second parameter to change the format
// TODO rename to API
export function toApiDate(date: Date, formatStr = "yyyy-MM-dd"): string | null {
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }
  try {
    return format(date, formatStr);
  } catch (e) {
    return null;
  }
}

// May crash on invalid dates
// TODO rename to API
export const toApiDateUnsafe = (date: Date, formatStr = "yyyy-MM-dd") =>
  format(date, formatStr);

// Returns a Date from a string in format "yyyy-MM-dd"
// TODO rename to API
export function fromApiDate(date: string): Date | null {
  try {
    const d = parse(date, "yyyy-MM-dd", new Date());
    if (Number.isNaN(d.getTime())) {
      return null;
    }
    return d;
  } catch (e) {
    return null;
  }
}

export function fromUIDateUnsafe(date: string): Date {
  return parse(date, "d.M.yyyy", new Date());
}

// Returns a Date object from a string in format "d.M.yyyy"
// Returns null if the date is invalid (the string is in invalid format or the date is before year 1000)
export function fromUIDate(date: string): Date | null {
  try {
    const d = parse(date, "d.M.yyyy", new Date());
    return isValidDate(d) ? d : null;
  } catch (e) {
    return null;
  }
}

// Returns true if the date is not NaN and after year 1000
// this is used to check date after string conversion
// another option: combine it to the date conversion functions (return null on invalid dates) => better with TS
export const isValidDate = (date: Date): boolean =>
  isValid(date) && isAfter(date, new Date("1000-01-01"));

// Returns a string in "d.M.yyyy" format from a Date object
// TODO returning undefined would be preferably (specificity) but breaks the users of this function
export function toUIDate(date: Date | null, formatStr = "d.M.yyyy"): string {
  if (!date || !isValidDate(date)) {
    return "";
  }
  try {
    return format(date, formatStr, { locale: fi });
  } catch (e) {
    return "";
  }
}

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const result = [];
  let index = 0;

  while (index < array.length) {
    result.push(array.slice(index, size + index));
    index += size;
  }

  return result;
};

/// @param options.fallbackLang - use a fallback language instead of returning an empty string
/// @deprecated use getTranslationSafe instead this doesn't play well with SSR and useTranslation hook
/// cause of the problem is the direct use of i18n?.language, it might or might not return the previous language
export function getTranslation(
  parent: Record<string, unknown>,
  key: string,
  options?: {
    fallbackLang?: "fi" | "sv" | "en";
  }
): string {
  const keyString = `${key}${capitalize(i18n?.language)}`;
  if (parent && parent[keyString]) {
    if (typeof parent[keyString] === "string") {
      return String(parent[keyString]);
    }
  }
  const fallback = options?.fallbackLang || "fi";
  const fallbackKeyString = `${key}${capitalize(fallback)}`;
  if (parent && parent[fallbackKeyString]) {
    if (typeof parent[fallbackKeyString] === "string") {
      return String(parent[fallbackKeyString]);
    }
  }

  return "";
}

/// Find a translation from a gql query result
/// @param lang - language to use, use useTranslation hook in get the current language inside a component
// TODO go through all the files and replace the old getTranslation with this one
// TODO rename to getTranslation when the other one is removed
// TODO Records are bad, use a query result type instead?
// TODO key should not be a string (so we don't accidentially pass "nameFi" here)
// gather all used keys and make a string literal for them (typically it's just name)
export function getTranslationSafe(
  parent: Record<string, unknown>,
  key: string,
  lang: "fi" | "sv" | "en"
): string {
  const keyString = `${key}${capitalize(lang)}`;
  if (parent && parent[keyString]) {
    if (typeof parent[keyString] === "string") {
      return String(parent[keyString]);
    }
  }
  const fallback = "fi";
  const fallbackKeyString = `${key}${capitalize(fallback)}`;
  if (parent && parent[fallbackKeyString]) {
    if (typeof parent[fallbackKeyString] === "string") {
      return String(parent[fallbackKeyString]);
    }
  }

  return "";
}

export function convertLanguageCode(lang: string): "fi" | "sv" | "en" {
  if (lang === "sv" || lang === "en" || lang === "fi") {
    return lang;
  }
  return "fi";
}
