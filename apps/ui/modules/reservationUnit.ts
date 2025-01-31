import {
  formatters as getFormatters,
  getReservationPrice,
  getUnRoundedReservationVolume,
} from "common";
import { flatten, trim, uniq } from "lodash";
import {
  addMinutes,
  differenceInMinutes,
  getHours,
  getMinutes,
  isAfter,
  isBefore,
  isSameDay,
  set,
} from "date-fns";
import { i18n } from "next-i18next";
import {
  convertLanguageCode,
  getTranslationSafe,
  toUIDate,
} from "common/src/common/util";
import {
  ReservationUnitPublishingState,
  type ReservationUnitNode,
  PriceUnit,
  type EquipmentFieldsFragment,
  type PriceReservationUnitFragment,
  type UnitNode,
  ReservationUnitReservationState,
  type MetadataSetsFragment,
  ReservationKind,
  ReservationStateChoice,
  type IsReservableFieldsFragment,
  ReservationStartInterval,
  Maybe,
  BlockingReservationFieldsFragment,
} from "@gql/gql-types";
import { capitalize, getTranslation } from "./util";
import {
  type ReservableMap,
  type RoundPeriod,
  isSlotWithinReservationTime,
  dateToKey,
  isRangeReservable,
} from "@/modules/reservable";
import { type PricingFieldsFragment } from "common/gql/gql-types";
import { gql } from "@apollo/client";
import { getIntervalMinutes } from "common/src/conversion";
import { isPriceFree, LocalizationLanguages } from "common/src/helpers";
import { type TFunction } from "i18next";

function formatTimeObject(time: { h: number; m: number }): string {
  return `${time.h.toString().padStart(2, "0")}:${time.m.toString().padStart(2, "0")}`;
}
function formatTime(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return formatTimeObject({ h: getHours(date), m: getMinutes(date) });
}

export { formatTime as getTimeString };

export function isReservationUnitPublished(
  reservationUnit?: Pick<ReservationUnitNode, "publishingState"> | null
): boolean {
  if (!reservationUnit) {
    return false;
  }
  const { publishingState } = reservationUnit;

  switch (publishingState) {
    case ReservationUnitPublishingState.Published:
    case ReservationUnitPublishingState.ScheduledHiding:
      return true;
    default:
      return false;
  }
}

const equipmentCategoryOrder = [
  "Huonekalut",
  "Keittiö",
  "Liikunta- ja pelivälineet",
  "Tekniikka",
  "Pelikonsoli",
  "Liittimet",
  "Muu",
];

export function getEquipmentCategories(
  equipment: Pick<EquipmentFieldsFragment, "category">[]
): string[] {
  if (!equipment || equipment.length === 0) {
    return [];
  }
  const categories: string[] = [...equipment].map((n) =>
    n.category?.nameFi && equipmentCategoryOrder.includes(n.category?.nameFi)
      ? n.category?.nameFi
      : "Muu"
  );

  categories.sort((a, b) => {
    const left = equipmentCategoryOrder.indexOf(a);
    const right = equipmentCategoryOrder.indexOf(b);
    return left - right;
  });

  return uniq(categories);
}

// Why are we doing complex frontend sorting? and always in finnish?
export function getEquipmentList(
  equipment: EquipmentFieldsFragment[]
): string[] {
  if (!equipment || equipment.length === 0) {
    return [];
  }

  const categories = getEquipmentCategories(equipment);

  const sortedEquipment = flatten(
    categories.map((category) =>
      [...equipment]
        .filter(
          (n) =>
            n.category?.nameFi === category ||
            (category === "Muu" &&
              n.category?.nameFi &&
              !equipmentCategoryOrder.includes(n.category?.nameFi))
        )
        .sort((a, b) =>
          a.nameFi && b.nameFi ? a.nameFi.localeCompare(b.nameFi) : 0
        )
    )
  );

  return sortedEquipment.map((n) => getTranslation(n, "name"));
}

export function getReservationUnitName(
  // TODO use a fragment for ReservationUnitName
  reservationUnit?: Pick<
    ReservationUnitNode,
    "nameFi" | "nameSv" | "nameEn"
  > | null,
  language: string = i18n?.language ?? "fi"
): string | undefined {
  if (!reservationUnit) {
    return undefined;
  }
  const key = `name${capitalize(language)}`;
  if (key in reservationUnit) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- silly magic to avoid implicit any type
    const val: unknown = (reservationUnit as any)[key];
    if (typeof val === "string" && val.length > 0) {
      return val;
    }
  }
  return reservationUnit.nameFi ?? "-";
}

export function getUnitName(
  unit?: Pick<UnitNode, "nameFi" | "nameSv" | "nameEn"> | null,
  locale: string = i18n?.language ?? "fi"
): string | undefined {
  if (unit == null) {
    return undefined;
  }
  return (
    getTranslationSafe(unit, "name", convertLanguageCode(locale ?? "")) ??
    undefined
  );
}

function isActivePricing(pricing: PricingFieldsFragment): boolean {
  return new Date(pricing.begins) <= new Date();
}
function isFuturePricing(pricing: PricingFieldsFragment): boolean {
  return new Date(pricing.begins) > new Date();
}

export function getActivePricing(reservationUnit: {
  pricings: PricingFieldsFragment[];
}): PricingFieldsFragment | undefined {
  const { pricings } = reservationUnit;
  return pricings.find((pricing) => isActivePricing(pricing));
}

export const RESERVATION_INFO_CARD_FRAGMENT = gql`
  fragment PriceReservationUnit on ReservationUnitNode {
    pricings {
      ...PricingFields
    }
    reservationBegins
    reservationEnds
  }
`;

export function getFuturePricing(
  reservationUnit: Maybe<PriceReservationUnitFragment> | undefined,
  applicationRounds: RoundPeriod[] = [],
  reservationDate?: Date
): PricingFieldsFragment | null {
  if (!reservationUnit) {
    return null;
  }
  const { pricings, reservationBegins, reservationEnds } = reservationUnit;

  if (!pricings || pricings.length === 0) {
    return null;
  }

  const futurePricings = pricings
    .filter((p) => isFuturePricing(p))
    .filter((futurePricing) => {
      return isSlotWithinReservationTime(
        new Date(futurePricing.begins),
        reservationBegins ? new Date(reservationBegins) : undefined,
        reservationEnds ? new Date(reservationEnds) : undefined
      );
    })
    .filter((futurePricing) => {
      return !applicationRounds.some((applicationRound) => {
        const { reservationPeriodBegin, reservationPeriodEnd } =
          applicationRound;
        if (!reservationPeriodBegin || !reservationPeriodEnd) {
          return false;
        }
        const begins = new Date(futurePricing.begins);
        const periodStart = new Date(reservationPeriodBegin);
        const periodEnd = new Date(reservationPeriodEnd);
        return begins >= periodStart && begins <= periodEnd;
      });
    })
    .sort((a, b) => (a.begins > b.begins ? 1 : -1));

  if (futurePricings.length === 0) {
    return null;
  }

  return reservationDate
    ? (futurePricings.reverse().find((n) => {
        return n.begins <= toUIDate(new Date(reservationDate), "yyyy-MM-dd");
      }) ?? null)
    : futurePricings[0];
}

function formatPrice(price: number, toCurrency?: boolean): string {
  const enableDecimals = price !== 0;
  const currencyFormatter = enableDecimals
    ? "currencyWithDecimals"
    : "currency";
  const floatFormatter = enableDecimals ? "twoDecimal" : "strippedDecimal";
  const formatters = getFormatters("fi");
  const formatter = formatters[toCurrency ? currencyFormatter : floatFormatter];
  return formatter.format(price);
}

export type GetPriceType = {
  t: TFunction;
  pricing: PricingFieldsFragment;
  minutes?: number; // additional minutes for total price calculation
};

function getReservationVolume(minutes: number, unit: PriceUnit): number {
  if (!minutes) {
    return 1;
  }

  return getUnRoundedReservationVolume(minutes, unit);
}

// TODO rewrite this return number normally
// and a separate function to format it to string
export function getPriceString(props: GetPriceType): string {
  const { t, pricing, minutes = 0 } = props;

  if (isPriceFree(pricing)) {
    return t("prices:priceFree") ?? "0";
  }

  const volume = getReservationVolume(minutes, pricing.priceUnit);
  const highestPrice = parseFloat(pricing.highestPrice) * volume;
  const lowestPrice = parseFloat(pricing.lowestPrice) * volume;
  const priceString =
    lowestPrice === highestPrice
      ? formatPrice(lowestPrice, true)
      : `${formatPrice(lowestPrice)} - ${formatPrice(highestPrice, true)}`;
  const unitString =
    pricing.priceUnit === PriceUnit.Fixed || minutes
      ? ""
      : t(`prices:priceUnits.${pricing.priceUnit}`);
  return trim(`${priceString} / ${unitString}`, " / ");
}

export type GetReservationUnitPriceProps = {
  t: TFunction;
  reservationUnit: PriceReservationUnitFragment;
  pricingDate: Date;
  minutes?: number;
};

export function getReservationUnitPrice(
  props: GetReservationUnitPriceProps
): string | null {
  const { t, reservationUnit: ru, pricingDate, minutes } = props;
  if (Number.isNaN(pricingDate.getTime())) {
    // eslint-disable-next-line no-console
    console.warn("Invalid pricing date", pricingDate);
  }

  const futurePricing = getFuturePricing(ru, [], pricingDate);
  const activePricing = getActivePricing(ru);
  let pricing = futurePricing ?? activePricing;
  // tax percentage change is based on the day of buying
  if (
    futurePricing &&
    activePricing &&
    futurePricing.taxPercentage.value !== activePricing.taxPercentage.value &&
    isReservationUnitPaid([activePricing])
  ) {
    pricing = activePricing;
  }

  if (pricing == null) {
    return null;
  }

  return getPriceString({
    t,
    pricing,
    minutes,
  });
}

// TODO use a fragment
// TODO why do we need both this and getPriceString?
export function getPrice(
  t: TFunction,
  reservation: {
    reservationUnits: PriceReservationUnitFragment[];
    price?: Maybe<string> | undefined;
    state?: Maybe<ReservationStateChoice> | undefined;
    begin: string;
    end: string;
  },
  lang: LocalizationLanguages,
  reservationUnitPriceOnly = false
): string | null {
  const reservationUnit = reservation.reservationUnits.find(() => true);
  const begin = new Date(reservation.begin);
  const end = new Date(reservation.end);
  const minutes = differenceInMinutes(end, begin);
  const showReservationUnitPrice =
    reservationUnitPriceOnly ||
    reservation.state === ReservationStateChoice.RequiresHandling;
  if (showReservationUnitPrice && reservationUnit) {
    return getReservationUnitPrice({
      t,
      reservationUnit,
      pricingDate: begin,
      minutes,
    });
  }
  return getReservationPrice(
    reservation.price ?? undefined,
    t("prices:priceFree"),
    true,
    lang
  );
}

export function isReservationUnitFreeOfCharge(
  pricings: PricingFieldsFragment[],
  date?: Date
): boolean {
  return !isReservationUnitPaid(pricings, date);
}

export function isReservationUnitPaid(
  pricings: PricingFieldsFragment[],
  date?: Date
): boolean {
  const active = pricings.filter((p) => isActivePricing(p));
  const future = pricings.filter((p) => isFuturePricing(p));
  const d =
    date == null
      ? active
      : active.concat(future).filter((p) => {
          const start = new Date(p.begins);
          return start <= date;
        });
  return d.filter((p) => !isPriceFree(p)).length > 0;
}

/// Returns true if the given time is 'inside' the time span
/// inside in this case means it's either the same day or the time span is multiple days
/// TODO should rewrite this to work on dates since we want to do that conversion first anyway
export function isInTimeSpan(
  date: Date,
  timeSpan: NonNullable<ReservationUnitNode["reservableTimeSpans"]>[0]
) {
  const { startDatetime, endDatetime } = timeSpan ?? {};

  if (!startDatetime || !endDatetime) return false;
  const startDate = new Date(startDatetime);
  const endDate = new Date(endDatetime);
  // either we have per day open time, or we have a span of multiple days
  // another option would be to move the starting time to 00:00
  if (isSameDay(date, startDate)) return true;
  if (isBefore(date, startDate)) return false;
  if (isAfter(date, endDate)) return false;
  return true;
}

/// Generate a list of intervals for a day
// TODO this can be moved to reservationUnit (not used here anymore)
export function getDayIntervals(
  startTime: { h: number; m: number },
  endTime: { h: number; m: number },
  interval: ReservationStartInterval
): { h: number; m: number }[] {
  // normalize end time to allow comparison
  const nEnd = endTime.h === 0 && endTime.m === 0 ? { h: 23, m: 59 } : endTime;
  const iMins = getIntervalMinutes(interval);

  const start = startTime;
  const end = nEnd;

  const startMins = start.h * 60 + start.m;
  const endMins = end.h * 60 + end.m;

  const intervals: Array<{ h: number; m: number }> = [];
  for (let i = startMins; i < endMins; i += iMins) {
    // don't allow interval overflow but handle 0:00 as 23:59
    if (i + iMins > endMins + 1) {
      break;
    }
    const m = i % 60;
    const h = (i - m) / 60;
    intervals.push({ h, m });
  }
  return intervals;
}

// Returns an timeslot array (in HH:mm format) with the time-slots that are
// available for reservation on the given date
// TODO should rewrite the timespans to be NonNullable and dates (and do the conversion early, not on each component render)
export function getPossibleTimesForDay({
  reservableTimes,
  interval,
  date,
  reservationUnit,
  activeApplicationRounds,
  durationValue,
  blockingReservations,
}: {
  reservableTimes: ReservableMap;
  interval: ReservationUnitNode["reservationStartInterval"];
  date: Date;
  reservationUnit: Omit<IsReservableFieldsFragment, "reservableTimeSpans">;
  activeApplicationRounds: readonly RoundPeriod[];
  durationValue: number;
  blockingReservations: readonly BlockingReservationFieldsFragment[];
}): { label: string; value: string }[] {
  const allTimes: Array<{ h: number; m: number }> = [];
  const slotsForDay = reservableTimes.get(dateToKey(date)) ?? [];
  for (const slot of slotsForDay) {
    const startDate = slot.start;
    const endDate = slot.end;
    const begin = isSameDay(startDate, date)
      ? startDate
      : set(date, { hours: 0, minutes: 0 });
    const end = isSameDay(endDate, date)
      ? endDate
      : set(date, { hours: 23, minutes: 59 });

    const s: { h: number; m: number } = {
      h: getHours(begin),
      m: getMinutes(begin),
    };
    const e: { h: number; m: number } = {
      h: getHours(end),
      m: getMinutes(end),
    };
    const intervals = getDayIntervals(s, e, interval);
    allTimes.push(...intervals);
  }

  const times = allTimes
    .filter((span) => {
      const { h: slotH, m: slotM } = span;
      const slotDate = new Date(date);
      slotDate.setHours(slotH, slotM, 0, 0);
      if (slotDate < new Date()) {
        return false;
      }
      const isReservable = isRangeReservable({
        blockingReservations,
        range: {
          start: slotDate,
          end: addMinutes(slotDate, durationValue),
        },
        reservationUnit,
        reservableTimes,
        activeApplicationRounds,
      });
      return isReservable;
    })
    // TODO the conversion should be done in a separate function so we can reuse the logic without string conversion
    .map((time) => formatTimeObject(time))
    .map((time) => ({ label: time, value: time }));
  return times;
}

// TODO use a fragment
type IsReservableReservationUnitType = Pick<
  ReservationUnitNode,
  | "reservationState"
  | "reservableTimeSpans"
  | "reservationBegins"
  | "minReservationDuration"
  | "maxReservationDuration"
  | "reservationKind"
  | "reservationsMaxDaysBefore"
  | "reservationsMinDaysBefore"
> &
  MetadataSetsFragment;

export function isReservationUnitReservable(
  reservationUnit?: IsReservableReservationUnitType | null
): [false, string] | [true] {
  if (!reservationUnit) {
    return [false, "reservationUnit is null"];
  }
  const {
    reservationState,
    minReservationDuration,
    maxReservationDuration,
    reservationKind,
  } = reservationUnit;

  switch (reservationState) {
    case ReservationUnitReservationState.Reservable:
    case ReservationUnitReservationState.ScheduledClosing: {
      const resBegins = reservationUnit.reservationBegins
        ? new Date(reservationUnit.reservationBegins)
        : null;
      const hasSupportedFields =
        (reservationUnit.metadataSet?.supportedFields?.length ?? 0) > 0;
      const hasReservableTimes =
        (reservationUnit.reservableTimeSpans?.length ?? 0) > 0;
      if (!hasSupportedFields) {
        return [false, "reservationUnit has no supported fields"];
      }
      if (!hasReservableTimes) {
        return [false, "reservationUnit has no reservable times"];
      }
      if (resBegins && resBegins > new Date()) {
        return [false, "reservationUnit reservation begins in future"];
      }
      if (!minReservationDuration || !maxReservationDuration) {
        return [false, "reservationUnit has no min/max reservation duration"];
      }
      if (reservationKind === ReservationKind.Season) {
        return [
          false,
          "reservationUnit is only available for seasonal booking",
        ];
      }
      return [true];
    }
    default:
      return [false, "reservationUnit is not reservable"];
  }
}
