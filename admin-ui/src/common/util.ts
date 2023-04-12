import { format, parseISO } from "date-fns";
import i18next from "i18next";
import trim from "lodash/trim";
import upperFirst from "lodash/upperFirst";
import { groupBy, set, get } from "lodash";
import {
  ApplicationEventScheduleType,
  LocationType,
  Query,
} from "common/types/gql-types";
import {
  AllocationResult,
  ApplicationEventSchedule,
  ApplicationEventStatus,
  ApplicationRound,
  ApplicationRoundStatus,
  DataFilterOption,
  LocalizationLanguages,
  Location,
  NormalizedApplicationRoundStatus,
  TranslationObject,
} from "./types";
import { NUMBER_OF_DECIMALS } from "./const";

export const DATE_FORMAT = "d.M.yyyy";
export const DATE_FORMAT_SHORT = "d.M";

export const toMondayFirst = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) =>
  day === 0 ? 6 : day - 1;

export const formatDate = (
  date: string | null,
  outputFormat = DATE_FORMAT
): string | null => {
  return date ? format(parseISO(date), outputFormat) : null;
};

export const formatTime = (
  date: string | null,
  outputFormat = "HH.mm"
): string | null => {
  return date ? format(parseISO(date), outputFormat) : null;
};

export const formatDateTime = (date: string): string =>
  `${formatDate(date)} ${formatTime(date)}`;

export const formatNumber = (
  input?: number | null,
  suffix?: string
): string => {
  if (input === null || input === undefined) return "";

  const number = new Intl.NumberFormat("fi").format(input);

  return `${number}${suffix || ""}`;
};

// Formats decimal to n -places, and trims trailing zeroes
export const formatDecimal = ({
  input,
  decimals = NUMBER_OF_DECIMALS,
  fallbackValue = 0,
}: {
  input?: number | string;
  decimals?: number;
  fallbackValue?: number;
}): number => {
  if (!input) return fallbackValue;

  const value = typeof input === "string" ? parseFloat(input) : input;

  return parseFloat(value.toFixed(decimals));
};

export type ApplicationRoundStatusView = "listing";

export const getNormalizedApplicationEventStatus = (
  status: ApplicationEventStatus,
  accepted?: boolean
): ApplicationEventStatus => {
  let normalizedStatus: ApplicationEventStatus = status;

  if (accepted) {
    normalizedStatus = "validated";
  } else if (["created", "allocating", "allocated"].includes(status)) {
    normalizedStatus = "created";
  }

  return normalizedStatus;
};

export const normalizeApplicationEventStatus = (
  allocationResult: AllocationResult
): ApplicationEventStatus => {
  let { status } = allocationResult.applicationEvent;

  if (
    allocationResult.allocatedReservationUnitId &&
    allocationResult.applicationEvent.declinedReservationUnitIds.includes(
      allocationResult.allocatedReservationUnitId
    )
  ) {
    status = "ignored";
  } else if (allocationResult.declined) {
    status = "declined";
  } else if (allocationResult.accepted) {
    status = "validated";
  }
  return status;
};

export const getNormalizedApplicationRoundStatus = (
  applicationRound: ApplicationRound
): ApplicationRoundStatus | NormalizedApplicationRoundStatus => {
  let normalizedStatus: NormalizedApplicationRoundStatus;

  if (
    ["in_review", "review_done", "allocated", "handled"].includes(
      applicationRound.status
    )
  ) {
    normalizedStatus = "handling";
  } else if (
    ["approved"].includes(applicationRound.status) &&
    applicationRound.applicationsSent
  ) {
    normalizedStatus = "sent";
  } else {
    normalizedStatus = applicationRound.status;
  }

  return normalizedStatus;
};

export const parseApplicationEventSchedules = (
  applicationEventSchedules: ApplicationEventSchedule[],
  index: number,
  priority: number
): string => {
  const schedules = applicationEventSchedules
    .filter((s) => s.day === index)
    .filter((s) => s.priority === priority);

  return schedules
    .map((s) => `${s.begin.substring(0, 2)}-${s.end.substring(0, 2)}`)
    .join(", ");
};

export const parseApplicationEventScheduleTime = (
  applicationEventSchedule: ApplicationEventScheduleType
): string => {
  const weekday = i18next.t(`dayShort.${applicationEventSchedule?.day}`);
  return `${weekday} ${Number(
    applicationEventSchedule.begin.substring(0, 2)
  )}-${Number(applicationEventSchedule.end.substring(0, 2))}`;
};

interface HMS {
  h?: number;
  m?: number;
  s?: number;
}

export const secondsToHms = (duration?: number | null): HMS => {
  if (!duration || duration < 0) return {};
  const h = Math.floor(duration / 3600);
  const m = Math.floor((duration % 3600) / 60);
  const s = Math.floor((duration % 3600) % 60);

  return { h, m, s };
};

// TODO remove the String when the parses are renamed
export const parseDurationString = (time: string): HMS | undefined => {
  const [hours, minutes] = time.split(":");
  if (!hours && !minutes) {
    return undefined;
  }
  const h = Number(hours);
  const m = Number(minutes);
  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h >= 24 ||
    h < 0 ||
    m < 0 ||
    m >= 60
  ) {
    return undefined;
  }
  return { h, m };
};

export const formatDurationShort = (hms: HMS): string =>
  `${hms.h ? i18next.t("common.hoursUnit", { count: hms.h }) : ""} ${
    hms.m ? i18next.t("common.minutesUnit", { count: hms.m }) : ""
  }`;

export const formatDurationLong = (hms: HMS): string =>
  `${hms.h ? i18next.t("common.hoursUnitLong", { count: hms.h }) : ""} ${
    hms.m ? i18next.t("common.minutesUnitLong", { count: hms.m }) : ""
  }`;

// TODO parseDuration is not a parse. parse: string => object (this is a print / format)
export const parseDuration = (
  duration: number | null | undefined,
  unitFormat?: "long"
): string => {
  const hms = secondsToHms(duration);

  switch (unitFormat) {
    case "long":
      return formatDurationLong(hms).trim();
    default:
      return formatDurationShort(hms).trim();
  }
};

export const convertHMSToSeconds = (input: string): number | null => {
  const result = Number(new Date(`1970-01-01T${input}Z`).getTime() / 1000);
  return Number.isNaN(result) ? null : result;
};

export const convertHMSToHours = (input: HMS): number => {
  if (!input.h) return 0;
  const hours = input.h;
  const hourFractions = input.m ? input.m / 60 : 0;
  return hours + hourFractions;
};

export const formatTimeDistance = (
  timeStart: string,
  timeEnd: string
): number | undefined => {
  const startArr = timeStart.split(":");
  const endArr = timeEnd.split(":");

  if ([...startArr, ...endArr].some((n) => !Number.isInteger(Number(n)))) {
    return undefined;
  }

  const startDate = new Date(
    1,
    1,
    1970,
    Number(startArr[0]),
    Number(startArr[1]),
    Number(startArr[2])
  );
  const endDate = new Date(
    1,
    1,
    1970,
    Number(endArr[0]),
    Number(endArr[1]),
    Number(endArr[2])
  );

  return Math.abs(endDate.getTime() - startDate.getTime()) / 1000;
};

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

export const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
};

export const localizedValue = (
  name: TranslationObject | string | undefined,
  lang: string
): string => {
  if (!name) {
    return "???";
  }
  if (typeof name === "string") {
    return name;
  }

  return name[lang as LocalizationLanguages] || "???";
};

export const localizedPropValue = (
  // eslint-disable-next-line
  o: any,
  propName: string,
  lang: string
): string => {
  return get(o, `${propName}${upperFirst(lang)}`, "???");
};

interface IAgeGroups {
  minimum?: number;
  maximum?: number;
}

export const parseAgeGroups = (ageGroups: IAgeGroups): string => {
  return `${i18next.t("common.agesSuffix", {
    range: trim(`${ageGroups.minimum || ""}-${ageGroups.maximum || ""}`, "-"),
  })}`;
};

export const parseAddress = (location: Location | LocationType): string => {
  return trim(
    `${
      (location as Location).addressStreet ||
      (location as LocationType).addressStreetFi ||
      ""
    }, ${(location as Location).addressZip || ""} ${
      (location as Location).addressCity ||
      (location as LocationType).addressCityFi ||
      ""
    }`,
    ", "
  );
};

export const isTranslationObject = (value: unknown): boolean => {
  return (
    typeof value === "object" &&
    value !== null &&
    ({}.propertyIsEnumerable.call(value, "fi") ||
      {}.propertyIsEnumerable.call(value, "en") ||
      {}.propertyIsEnumerable.call(value, "sv"))
  );
};

export const parseAddressLine1 = (
  location: Location | LocationType
): string => {
  return trim(
    `${
      (location as Location).addressStreet ||
      (location as LocationType).addressStreetFi ||
      ""
    }`
  );
};

export const parseAddressLine2 = (
  location: Location | LocationType
): string => {
  return trim(
    `${location.addressZip || ""} ${
      (location as Location).addressCity ||
      (location as LocationType).addressCityFi ||
      ""
    }`
  );
};

/** Filtering logic "OR within the group, AND between groups" */
export const filterData = <T>(data: T[], filters: DataFilterOption[]): T[] => {
  const groups = groupBy(filters, "key");
  const groupCount = Object.keys(groups).length;

  return data.filter((row) => {
    const groupsNames = Object.keys(groups);
    const groupsMatched = groupsNames.filter((name) => {
      const found = groups[name].find((filter) => {
        if (filter.function) {
          return filter.function(row);
        }
        return get(row, filter.key as string) === filter.value;
      });
      return Boolean(found);
    });

    return groupsMatched.length === groupCount;
  });
};

export const combineResults = (
  previousResult: Query,
  fetchMoreResult: Query,
  arg2: string
): Query => {
  const combined = { ...previousResult };
  set(combined, arg2, {
    ...get(previousResult, arg2),
    edges: get(previousResult, arg2).edges.concat(
      get(fetchMoreResult, arg2).edges
    ),
  });

  return combined;
};

export const sortByName = (a?: string, b?: string): number =>
  a && b ? a.toLowerCase().localeCompare(b.toLowerCase()) : !a ? 1 : -1;
