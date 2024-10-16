import { isAfter, isBefore } from "date-fns";
import { type ImageFragment, type Maybe } from "../gql/gql-types";
import { pixel } from "./common/style";

export function filterNonNullable<T>(
  arr: Maybe<Maybe<T>[]> | undefined
): NonNullable<T>[] {
  return arr?.filter((n): n is NonNullable<T> => n != null) ?? [];
}

/// Safe string -> number conversion
/// handles the special cases of empty string and NaN with type safety
export function toNumber(filter: string | null): number | null {
  if (filter == null) {
    return null;
  }
  // empty string converts to 0 which is not what we want
  if (filter.trim() === "") {
    return null;
  }
  const n = Number(filter);
  if (Number.isNaN(n)) {
    return null;
  }
  return n;
}

/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter -- generic reduce requires type casting */
export function pick<T, K extends keyof T>(
  reservation: T,
  keys: ReadonlyArray<K>
): Pick<T, K> {
  return keys.reduce<Pick<T, K>>(
    (acc, key) => {
      if (reservation[key] != null) {
        acc[key] = reservation[key];
      }
      return acc;
    },
    {} as Pick<T, K>
  );
}
/* eslint-enable @typescript-eslint/prefer-reduce-type-parameter */

export const toMondayFirstUnsafe = (day: number) => {
  if (day < 0 || day > 6) {
    throw new Error(`Invalid day ${day}`);
  }
  return day === 0 ? 6 : day - 1;
};

export const toMondayFirst = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) =>
  day === 0 ? 6 : day - 1;

export const fromMondayFirstUnsafe = (day: number) => {
  if (day < 0 || day > 6) {
    throw new Error(`Invalid day ${day}`);
  }
  return day === 6 ? 0 : day + 1;
};

export const fromMondayFirst = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) =>
  day === 6 ? 0 : day + 1;

export type LocalizationLanguages = "fi" | "sv" | "en";

export const getLocalizationLang = (code: string): LocalizationLanguages => {
  if (code.startsWith("fi")) {
    return "fi";
  }
  if (code.startsWith("sv")) {
    return "sv";
  }
  if (code.startsWith("en")) {
    return "en";
  }
  return "fi";
};

export const isBrowser = typeof window !== "undefined";

export function base64encode(str: string) {
  if (isBrowser) {
    return window.btoa(str);
    // TODO do we want unescape(encodeURIComponent(str)));?
  }
  return Buffer.from(str, "binary").toString("base64");
}

export async function hash(val: string): Promise<string> {
  if (!isBrowser) {
    throw new Error("hash is only available in the browser");
  }
  const h = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(val)
  );
  const hexes = [],
    view = new DataView(h);
  for (let i = 0; i < view.byteLength; i += 4)
    hexes.push(`00000000${view.getUint32(i).toString(16)}`.slice(-8));
  return hexes.join("");
}

export function truncate(val: string, maxLen: number): string {
  return val.length > maxLen ? `${val.substring(0, maxLen - 1)}…` : val;
}

/// Always return an image because the Design and process should not allow imageless reservation units
/// On production returns the cached medium image url
/// On development we don't have image cache so we return the full image url
/// If image is null or undefined returns a static pixel
export function getImageSource(
  image: ImageFragment | null,
  size: "small" | "large" | "medium" | "full" = "medium"
): string {
  if (!image) {
    return pixel;
  }
  return getImageSourceWithoutDefault(image, size) || image?.imageUrl || pixel;
}

function getImageSourceWithoutDefault(
  image: ImageFragment,
  size: "small" | "large" | "medium" | "full"
): string | null {
  switch (size) {
    case "small":
      return image.smallUrl ?? null;
    case "large":
      return image.largeUrl ?? null;
    case "medium":
      return image.mediumUrl ?? null;
    case "full":
      return image.imageUrl ?? null;
    default:
      return null;
  }
}
function pickMaybeDay(
  a: Date | undefined,
  b: Date | undefined,
  compF: (a: Date, b: Date) => boolean
): Date | undefined {
  if (!a) {
    return b;
  }
  if (!b) {
    return a;
  }
  return compF(a, b) ? a : b;
}

// Returns a Date object with the first day of the given array of Dates
export function dayMin(days: Array<Date | undefined>): Date | undefined {
  return filterNonNullable(days).reduce<Date | undefined>((acc, day) => {
    return pickMaybeDay(acc, day, isBefore);
  }, undefined);
}

export function dayMax(days: Array<Date | undefined>): Date | undefined {
  return filterNonNullable(days).reduce<Date | undefined>((acc, day) => {
    return pickMaybeDay(acc, day, isAfter);
  }, undefined);
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number).filter(Number.isFinite);
  if (hours != null && minutes != null) {
    return hours * 60 + minutes;
  }
  return 0;
}

export function calculateMedian(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length === 0) {
    return 0;
  } else if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}
