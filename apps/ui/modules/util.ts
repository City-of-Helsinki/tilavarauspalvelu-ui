import { isAfter, parseISO, isBefore, parse } from "date-fns";
import { i18n, TFunction } from "next-i18next";
import queryString from "query-string";
import { trim } from "lodash";
import { ApolloError } from "@apollo/client";
import {
  toApiDate,
  toUIDate,
  isValidDate,
  getTranslation,
} from "common/src/common/util";
import type { OptionType, ReducedApplicationStatus } from "common/types/common";
import {
  type ReservationUnitImageType,
  type ReservationUnitType,
  ApplicationStatusChoice,
  type ReservationUnitByPkType,
  AgeGroupType,
} from "common/types/gql-types";
import {
  searchPrefix,
  applicationsPrefix,
  singleSearchPrefix,
  reservationsPrefix,
  isBrowser,
} from "./const";
import type { LocalizationLanguages } from "common/src/helpers";

export { getTranslation };

export const isActive = (startDate: string, endDate: string): boolean => {
  const now = new Date().getTime();
  return (
    isAfter(now, parseISO(startDate).getTime()) &&
    isBefore(now, parseISO(endDate).getTime())
  );
};

export const parseDate = (date: string): Date => parseISO(date);

// Returns a Date from a string in format "yyyy-MM-dd"
const fromAPIDate = (date: string): Date => {
  const d = parse(date, "yyyy-MM-dd", new Date());
  return d;
};

export const formatDate = (date: string, formatStr?: string): string => {
  if (!date) {
    return "-";
  }
  return toUIDate(parseISO(date), formatStr);
};

export const fromUIDate = (date: string): Date => {
  return parse(date, "d.M.yyyy", new Date());
};

export const apiDateToUIDate = (date: string): string => {
  return toUIDate(fromAPIDate(date));
};

export const uiDateToApiDate = (date: string): string | undefined => {
  if (date.indexOf(".") === -1) {
    return date;
  }
  return toApiDate(fromUIDate(date));
};

export const capitalize = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const isValidDateString = (date: string | null): boolean => {
  if (!date) return false;
  return isValidDate(parse(date, "d.M.yyyy", new Date()));
};

export const formatApiDate = (date: string): string | undefined => {
  if (!date) {
    return undefined;
  }
  return toApiDate(parseISO(date));
};

type ParameterType = {
  pk: number;
  nameFi: string;
  nameEn?: string;
  nameSv?: string;
} | { pk:number; name: string; };

export const getLabel = (
  parameter: ParameterType | AgeGroupType,
  lang: LocalizationLanguages = "fi"
): string => {
  if ('minimum' in parameter) {
    return `${parameter.minimum || ""} - ${parameter.maximum || ""}`;
  }
  if ('name' in parameter) {
    return parameter.name;
  }
  if (parameter.nameFi && lang === "fi") {
    return parameter.nameFi;
  }
  if (parameter.nameEn && lang === "en") {
    return parameter.nameEn;
  }
  if (parameter.nameSv && lang === "sv") {
    return parameter.nameSv;
  }
  if (parameter.nameFi) {
    return parameter.nameFi;
  }
  return "no label";
};

export const mapOptions = (
  src: ParameterType[] | AgeGroupType[],
  emptyOptionLabel?: string,
  lang: LocalizationLanguages = "fi",
): OptionType[] => {
  const r: OptionType[] = [
    ...(emptyOptionLabel ? [{ label: emptyOptionLabel, value: 0 }] : []),
    ...(src.map((v) => ({
        label: getLabel(v, lang),
        value: v.pk ?? 0,
      }))
    ),
  ]
  return r;
};

export const getSelectedOption = (
  selectedId: number | string | null,
  options: OptionType[]
): OptionType | undefined => {
  const selected = String(selectedId);
  const option = options.find((o) => String(o.value) === selected);
  return option;
};

export const getComboboxValues = (
  value: string,
  options: OptionType[]
): OptionType[] => {
  if (value.length === 0) {
    return [];
  }
  if (value.includes(",")) {
    return value
      .split(",")
      .map((unit) => getSelectedOption(unit, options))
      .filter((x): x is OptionType => x != null);
  }
  const val = getSelectedOption(value, options);
  if (val) {
    return [val];
  }
  return [];
};

type SearchParams = Record<
  string,
  string | (string | null)[] | number | boolean | null
>;

export const searchUrl = (params: SearchParams): string => {
  const response = `${searchPrefix}/`;

  if (params && Object.keys(params).length > 0) {
    return `${response}?${queryString.stringify(params)}`;
  }

  return response;
};

export const singleSearchUrl = (params: SearchParams): string => {
  const response = `${singleSearchPrefix}/`;

  if (params && Object.keys(params).length > 0) {
    return `${response}?${queryString.stringify(params)}`;
  }

  return response;
};

export const applicationsUrl = `${applicationsPrefix}/`;
export const reservationsUrl = `${reservationsPrefix}/`;

export function deepCopy<T>(src: T): T {
  return JSON.parse(JSON.stringify(src));
}

export const apiDurationToMinutes = (duration: string): number => {
  if (!duration) {
    return 0;
  }
  const parts = duration.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
};

const imagePriority = ["main", "map", "ground_plan", "other"].map((n) =>
  n.toUpperCase()
);

export const getMainImage = (
  ru?: ReservationUnitType | ReservationUnitByPkType
): ReservationUnitImageType | null => {
  if (!ru || !ru.images || ru.images.length === 0) {
    return null;
  }
  const images = [...ru.images].sort((a, b) => {
    return (
      imagePriority.indexOf(a.imageType) - imagePriority.indexOf(b.imageType)
    );
  });

  return images[0];
};

export const orderImages = (
  images: ReservationUnitImageType[]
): ReservationUnitImageType[] => {
  if (!images || images.length === 0) {
    return [];
  }
  const result = [...images].sort((a, b) => {
    return (
      imagePriority.indexOf(a.imageType) - imagePriority.indexOf(b.imageType)
    );
  });

  return result;
};

export const getAddressAlt = (ru: ReservationUnitType): string | null => {
  const { location } = ru.unit || {};

  if (!location) {
    return null;
  }

  return trim(
    `${
      getTranslation(location, "addressStreet") ||
      location.addressStreetFi ||
      ""
    }, ${
      getTranslation(location, "addressCity") || location.addressCityFi || ""
    }`,
    ", "
  );
};

export const applicationUrl = (id: number): string => `/application/${id}`;

export const applicationErrorText = (
  t: TFunction,
  key: string | undefined,
  attrs: { [key: string]: string | number } = {}
): string => (key ? t(`application:error.${key}`, attrs) : "");

/// @deprecated TODO: remove this (it makes no sense anymore with the changes to the statuses)
// TODO all of these should return an unknown status if the status is not recognized or allowed
// not a null / undefined
export const getReducedApplicationStatus = (
  status?: ApplicationStatusChoice
): ReducedApplicationStatus | null => {
  switch (status) {
    case ApplicationStatusChoice.Received:
      return "processing";
    case ApplicationStatusChoice.Cancelled:
    case ApplicationStatusChoice.Expired:
    case ApplicationStatusChoice.Draft:
      return "draft";
    case ApplicationStatusChoice.InAllocation:
    case ApplicationStatusChoice.ResultsSent:
    case ApplicationStatusChoice.Handled:
      return "sent";
    default:
      return null;
  }
};

export const formatDurationMinutes = (
  duration: number,
  abbreviated = true
): string => {
  if (!duration) {
    return "-";
  }

  const hour = Math.floor(duration / 60);
  const min = Math.floor(duration % 60);

  const hourKey = abbreviated ? "common:abbreviations.hour" : "common:hour";
  const minuteKey = abbreviated
    ? "common:abbreviations.minute"
    : "common:minute";

  const p = [];

  if (hour && i18n?.t != null) {
    p.push(i18n.t(hourKey, { count: hour }).toLocaleLowerCase());
  }
  if (min && i18n?.t != null) {
    p.push(i18n.t(minuteKey, { count: min }).toLocaleLowerCase());
  }

  return p.join(" ");
};

export const getReadableList = (list: string[]): string => {
  if (list.length === 0) {
    return "";
  }

  const andStr = i18n?.t("common:and") || "";

  if (list.length < 3) {
    return list.join(` ${andStr} `);
  }

  return `${list.slice(0, -1).join(", ")} ${andStr} ${list[list.length - 1]}`;
};

export const printErrorMessages = (error: ApolloError): string => {
  if (!error.graphQLErrors || error.graphQLErrors.length === 0) {
    return "";
  }

  const { graphQLErrors: errors } = error;

  return errors
    .reduce((acc, cur) => {
      const code = cur?.extensions?.error_code
        ? i18n?.t(`errors:${cur?.extensions?.error_code}`)
        : "";
      const message =
        code === cur?.extensions?.error_code || !cur?.extensions?.error_code
          ? i18n?.t("errors:general_error")
          : code || "";
      return message ? `${acc}${message}\n` : acc; /// contains non-breaking space
    }, "")
    .trim();
};

export const isTouchDevice = (): boolean =>
  isBrowser && window?.matchMedia("(any-hover: none)").matches;
