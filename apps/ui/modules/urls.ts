import { Maybe } from "@/gql/gql-types";
import queryString from "query-string";

export const reservationUnitPrefix = "/reservation-unit";
export const searchPrefix = "/search";
export const singleSearchPrefix = "/search/single";
export const applicationsPrefix = "/applications";
export const reservationsPrefix = "/reservations";
export const recurringReservationsPrefix = "/recurring";

export const reservationUnitPath = (id: number): string =>
  `${reservationUnitPrefix}/${id}`;

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

export function getApplicationPath(id: Maybe<number> | undefined): string {
  if (id == null) {
    return "";
  }
  return `${applicationsPrefix}/${id}`;
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
