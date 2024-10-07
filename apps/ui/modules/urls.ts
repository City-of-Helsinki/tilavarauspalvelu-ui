import { type Maybe } from "@/gql/gql-types";
import queryString from "query-string";

export const reservationUnitPrefix = "/reservation-unit";
export const searchPrefix = "/search";
export const singleSearchPrefix = "/search/single";
export const applicationsPrefix = "/applications";
export const reservationsPrefix = "/reservations";
export const seasonalPrefix = "/recurring";

type SearchParams = Record<
  string,
  string | (string | null)[] | number | boolean | null
>;

// todo remove the use of query-string
export function getSeasonalSearchUrl(params: SearchParams): string {
  const response = `${searchPrefix}/`;

  if (params && Object.keys(params).length > 0) {
    return `${response}?${queryString.stringify(params)}`;
  }

  return response;
}

export function getSingleSearchUrl(params?: URLSearchParams): string {
  const response = `${singleSearchPrefix}/`;

  if (params && Object.keys(params).length > 0) {
    return `${response}?${params.toString()}`;
  }

  return response;
}

export const applicationsUrl = `${applicationsPrefix}/`;
export const reservationsUrl = `${reservationsPrefix}/`;

/// @deprecated
export const reservationUnitPath = (id: number): string =>
  `${reservationUnitPrefix}/${id}`;

export function getApplicationRoundPath(
  id: Maybe<number> | undefined,
  page?: string | undefined
): string {
  if (id == null) {
    return "";
  }
  return `${seasonalPrefix}/${id}/${page ?? ""}`;
}

// todo remove the use of query-string
export function getSeasonalSearchPath(
  pk: Maybe<number> | undefined,
  params?: URLSearchParams
): string {
  if (pk == null) {
    return "";
  }
  const base = `${seasonalPrefix}/${pk}`;

  if (params && Object.keys(params).length > 0) {
    return `${base}?${params.toString()}`;
  }

  return base;
}

export function getSingleSearchPath(params?: URLSearchParams): string {
  const base = `${singleSearchPrefix}/`;

  if (params && Object.keys(params).length > 0) {
    return `${base}?${params.toString()}`;
  }

  return base;
}

type ApplicationPages = "page1" | "page2" | "page3" | "view" | "preview";
export function getApplicationPath(
  pk: Maybe<number> | undefined,
  page?: ApplicationPages | undefined
): string {
  if (pk == null) {
    return "";
  }
  return `${applicationsPrefix}/${pk}/${page ?? ""}`;
}

export function getReservationPath(
  id: Maybe<number> | undefined,
  page?: string | undefined
): string {
  if (id == null) {
    return "";
  }
  return `${reservationsPrefix}/${id}/${page || ""}`;
}

export function getReservationInProgressPath(
  pk: Maybe<number> | undefined,
  reservationPk: Maybe<number> | undefined
): string {
  if (pk == null || reservationPk == null) {
    return "";
  }
  return `${reservationsPrefix}/${pk}/reservation/${reservationPk}`;
}

export function getReservationUnitPath(id: Maybe<number> | undefined): string {
  if (id == null) {
    return "";
  }
  return `${reservationUnitPrefix}/${id}`;
}
