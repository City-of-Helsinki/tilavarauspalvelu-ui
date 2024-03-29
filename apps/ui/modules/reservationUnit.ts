import {
  type ReservationUnitNode,
  formatters as getFormatters,
  getReservationVolume,
} from "common";
import { flatten, trim, uniq } from "lodash";
import { format, isAfter, isBefore, isSameDay, set } from "date-fns";
import { i18n } from "next-i18next";
import { toUIDate } from "common/src/common/util";
import {
  type RoundPeriod,
  getDayIntervals,
  isSlotWithinReservationTime,
} from "common/src/calendar/util";
import {
  type EquipmentType,
  type ReservationUnitPricingType,
  ReservationUnitState,
  type UnitType,
  type ReservationUnitByPkType,
  State,
  PricingType,
  Status,
} from "common/types/gql-types";
import { filterNonNullable } from "common/src/helpers";
import { capitalize, getTranslation } from "./util";

export const isReservationUnitPublished = (
  reservationUnit?: ReservationUnitNode
): boolean => {
  if (!reservationUnit) {
    return false;
  }
  const { state } = reservationUnit;

  switch (state) {
    case ReservationUnitState.Published:
    case ReservationUnitState.ScheduledHiding:
      return true;
    default:
      return false;
  }
};

const equipmentCategoryOrder = [
  "Huonekalut",
  "Keittiö",
  "Liikunta- ja pelivälineet",
  "Tekniikka",
  "Pelikonsoli",
  "Liittimet",
  "Muu",
];

export const getEquipmentCategories = (
  equipment: EquipmentType[]
): string[] => {
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
};

export const getEquipmentList = (equipment: EquipmentType[]): string[] => {
  if (!equipment || equipment.length === 0) {
    return [];
  }

  const categories = getEquipmentCategories(equipment);

  const sortedEquipment: EquipmentType[] = flatten(
    categories.map((category) => {
      const eq: EquipmentType[] = [...equipment].filter(
        (n) =>
          n.category?.nameFi === category ||
          (category === "Muu" &&
            n.category?.nameFi &&
            !equipmentCategoryOrder.includes(n.category?.nameFi))
      );
      eq.sort((a, b) =>
        a.nameFi && b.nameFi ? a.nameFi.localeCompare(b.nameFi) : 0
      );
      return eq;
    })
  );

  return sortedEquipment.map((n) => getTranslation(n, "name"));
};

export const getReservationUnitName = (
  reservationUnit?: ReservationUnitNode,
  language: string = i18n?.language ?? "fi"
): string | undefined => {
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
};

export const getUnitName = (
  unit?: UnitType,
  language: string = i18n?.language ?? "fi"
): string | undefined => {
  if (unit == null) {
    return undefined;
  }
  const key = `name${capitalize(language)}`;
  if (key in unit) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- silly magic to avoid implicit any type
    const val: unknown = (unit as any)[key];
    if (typeof val === "string" && val.length > 0) {
      return val;
    }
  }
  return unit.nameFi ?? "-";
};

export const getReservationUnitInstructionsKey = (
  state: State
): string | null => {
  switch (state) {
    case State.Created:
    case State.RequiresHandling:
      return "reservationPendingInstructions";
    case State.Cancelled:
      return "reservationCancelledInstructions";
    case State.Confirmed:
      return "reservationConfirmedInstructions";
    case State.Denied:
    default:
      return null;
  }
};

export const getDurationRange = (
  reservationUnit: ReservationUnitNode
): string => {
  return `${reservationUnit.minReservationDuration} - ${reservationUnit.maxReservationDuration}`;
};

export const getActivePricing = (
  reservationUnit: ReservationUnitNode
): ReservationUnitPricingType | undefined => {
  const { pricings } = reservationUnit;

  if (!pricings || pricings.length === 0) {
    return undefined;
  }

  return pricings.find((pricing) => pricing?.status === "ACTIVE") ?? undefined;
};

export const getFuturePricing = (
  reservationUnit: ReservationUnitNode,
  applicationRounds: RoundPeriod[] = [],
  reservationDate?: Date
): ReservationUnitPricingType | undefined => {
  const { pricings, reservationBegins, reservationEnds } = reservationUnit;

  if (!pricings || pricings.length === 0) {
    return undefined;
  }

  const now = toUIDate(new Date(), "yyyy-MM-dd");

  const futurePricings = pricings
    .filter((pricing) => pricing?.status === Status.Future)
    .filter((x): x is NonNullable<typeof x> => x != null)
    .filter((futurePricing) => futurePricing.begins > now)
    .filter((futurePricing) => {
      const start = new Date(futurePricing.begins);
      return isSlotWithinReservationTime(
        start,
        reservationBegins ? new Date(reservationBegins) : undefined,
        reservationEnds ? new Date(reservationEnds) : undefined
      );
    })
    .filter((futurePricing) => {
      if (futurePricing.begins == null) {
        return false;
      }
      return !applicationRounds.some((applicationRound) => {
        const { reservationPeriodBegin, reservationPeriodEnd } =
          applicationRound;
        if (!reservationPeriodBegin || !reservationPeriodEnd) return false;
        const begins = new Date(futurePricing.begins);
        const periodStart = new Date(reservationPeriodBegin);
        const periodEnd = new Date(reservationPeriodEnd);
        return begins >= periodStart && begins <= periodEnd;
      });
    })
    .sort((a, b) => (a.begins > b.begins ? 1 : -1));

  if (futurePricings.length === 0) {
    return undefined;
  }

  return reservationDate
    ? futurePricings.reverse().find((n) => {
        return n.begins <= toUIDate(new Date(reservationDate), "yyyy-MM-dd");
      })
    : futurePricings[0];
};

export type GetPriceType = {
  pricing: ReservationUnitPricingType;
  minutes?: number; // additional minutes for total price calculation
  trailingZeros?: boolean;
  asInt?: boolean;
};

// TODO refactor: this is over complex and does weird things
// asInt and trailingZeros should be split to separate functions
// bad: combining the actual price calculation and formatting
export const getPrice = (props: GetPriceType): string => {
  const { pricing, minutes, trailingZeros = false, asInt = false } = props;

  const currencyFormatter = trailingZeros ? "currencyWithDecimals" : "currency";
  const floatFormatter = trailingZeros ? "twoDecimal" : "strippedDecimal";

  const formatters = getFormatters("fi");

  const lowestPrice = parseFloat(pricing.lowestPrice);
  const highestPrice = parseFloat(pricing.highestPrice);
  if (pricing.pricingType === "PAID" && highestPrice > 0) {
    const volume = getReservationVolume(minutes ?? 0, pricing.priceUnit);
    const unitStr =
      pricing.priceUnit === "FIXED" || minutes
        ? ""
        : i18n?.t(`prices:priceUnits.${pricing.priceUnit}`);
    const fLowestPrice = parseFloat(pricing.lowestPrice?.toString())
      ? formatters[floatFormatter].format(lowestPrice * volume)
      : 0;
    const fHighestPrice = formatters[currencyFormatter].format(
      highestPrice * volume
    );
    const price =
      lowestPrice === highestPrice
        ? formatters[currencyFormatter].format(lowestPrice * volume)
        : `${fLowestPrice} - ${fHighestPrice}`;
    return trim(`${price} / ${unitStr}`, " / ");
  }

  return asInt ? "0" : i18n?.t("prices:priceFree") ?? "0";
};

export type GetReservationUnitPriceProps = {
  reservationUnit?: ReservationUnitNode | null;
  pricingDate?: Date;
  minutes?: number;
  trailingZeros?: boolean;
  asInt?: boolean;
};

export const getReservationUnitPrice = (
  props: GetReservationUnitPriceProps
): string | undefined => {
  const {
    reservationUnit: ru,
    pricingDate,
    minutes,
    trailingZeros = false,
    asInt = false,
  } = props;

  if (!ru) {
    return undefined;
  }

  const pricing: ReservationUnitPricingType | undefined = pricingDate
    ? getFuturePricing(ru, [], pricingDate) || getActivePricing(ru)
    : getActivePricing(ru);

  return pricing
    ? getPrice({ pricing, minutes, trailingZeros, asInt })
    : undefined;
};

export const isReservationUnitPaidInFuture = (
  pricings: ReservationUnitPricingType[]
): boolean => {
  return pricings
    .filter(
      (pricing) =>
        [Status.Active, Status.Future].includes(pricing.status) &&
        pricing.pricingType === PricingType.Paid
    )
    .map((pricing) => getPrice({ pricing, asInt: true }))
    .some((n) => n !== "0");
};

/// Returns true if the given time is 'inside' the time span
/// inside in this case means it's either the same day or the time span is multiple days
/// TODO should rewrite this to work on dates since we want to do that conversion first anyway
export function isInTimeSpan(
  date: Date,
  timeSpan: NonNullable<ReservationUnitByPkType["reservableTimeSpans"]>[0]
) {
  const { startDatetime, endDatetime } = timeSpan ?? {};

  if (!startDatetime) return false;
  if (!endDatetime) return false;
  const startDate = new Date(startDatetime);
  const endDate = new Date(endDatetime);
  // either we have per day open time, or we have a span of multiple days
  // another option would be to move the starting time to 00:00
  if (isSameDay(date, startDate)) return true;
  if (isBefore(date, startDate)) return false;
  if (isAfter(date, endDate)) return false;
  return true;
}

// Returns an timeslot array (in HH:mm format) with the time-slots that are
// available for reservation on the given date
// TODO should rewrite the timespans to be NonNullable and dates (and do the conversion early, not on each component render)
export function getPossibleTimesForDay(
  reservableTimeSpans: ReservationUnitByPkType["reservableTimeSpans"],
  reservationStartInterval: ReservationUnitByPkType["reservationStartInterval"],
  date: Date
): string[] {
  const allTimes: string[] = [];
  filterNonNullable(reservableTimeSpans)
    .filter((x) => isInTimeSpan(date, x))
    .forEach((rts) => {
      if (!rts?.startDatetime || !rts?.endDatetime) return;
      const begin = isSameDay(new Date(rts.startDatetime), date)
        ? new Date(rts.startDatetime)
        : set(date, { hours: 0, minutes: 0 });
      const end = isSameDay(new Date(rts.endDatetime), date)
        ? new Date(rts.endDatetime)
        : set(date, { hours: 23, minutes: 59 });
      // TODO I hate this function, don't use strings for durations
      // wasteful because we do date -> string -> object -> number -> string
      // the numbers are what we compare but all the scaffolding to mess with memory alloc
      const intervals = getDayIntervals(
        format(begin, "HH:mm"),
        format(end, "HH:mm"),
        reservationStartInterval
      );

      // TODO why is this needed?
      const times: string[] = intervals.map((val) => {
        const [startHours, startMinutes] = val.split(":");
        return `${startHours}:${startMinutes}`;
      });
      allTimes.push(...times);
    });
  return allTimes;
}
