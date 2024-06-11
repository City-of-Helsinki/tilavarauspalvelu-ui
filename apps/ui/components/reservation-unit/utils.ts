import { filterNonNullable } from "common/src/helpers";
import { addDays, addMinutes, isAfter, isBefore, set } from "date-fns";
import type {
  ReservationUnitNode,
  ReservationUnitPageQuery,
} from "@gql/gql-types";
import { getPossibleTimesForDay } from "@/modules/reservationUnit";
import {
  type RoundPeriod,
  isReservationReservable,
  ReservableMap,
  dateToKey,
} from "@/modules/reservation";

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
const dayMin = (days: Array<Date | undefined>): Date | undefined => {
  return filterNonNullable(days).reduce<Date | undefined>((acc, day) => {
    return pickMaybeDay(acc, day, isBefore);
  }, undefined);
};

const dayMax = (days: Array<Date | undefined>): Date | undefined => {
  return filterNonNullable(days).reduce<Date | undefined>((acc, day) => {
    return pickMaybeDay(acc, day, isAfter);
  }, undefined);
};

// Returns the last possible reservation date for the given reservation unit
export function getLastPossibleReservationDate(
  reservationUnit?: Pick<
    ReservationUnitNode,
    "reservationsMaxDaysBefore" | "reservableTimeSpans" | "reservationEnds"
  >
): Date | null {
  if (!reservationUnit) {
    return null;
  }
  const { reservationsMaxDaysBefore, reservableTimeSpans, reservationEnds } =
    reservationUnit;
  if (!reservableTimeSpans?.length) {
    return null;
  }

  const lastPossibleReservationDate =
    reservationsMaxDaysBefore != null && reservationsMaxDaysBefore > 0
      ? addDays(new Date(), reservationsMaxDaysBefore)
      : undefined;
  const reservationUnitNotReservable = reservationEnds
    ? new Date(reservationEnds)
    : undefined;
  const endDateTime = reservableTimeSpans.at(-1)?.endDatetime ?? undefined;
  const lastOpeningDate = endDateTime ? new Date(endDateTime) : new Date();
  return (
    dayMin([
      reservationUnitNotReservable,
      lastPossibleReservationDate,
      lastOpeningDate,
    ]) ?? null
  );
}

type QueryT = NonNullable<ReservationUnitPageQuery["reservationUnit"]>;
type AvailableTimesProps = {
  start: Date;
  duration: number;
  reservationUnit: QueryT;
  reservableTimes: ReservableMap;
  activeApplicationRounds: RoundPeriod[];
  fromStartOfDay?: boolean;
};

// Returns an array of available times for the given duration and day
// TODO this is really slow (especially if called from a loop)
function getAvailableTimesForDay({
  start,
  duration,
  reservationUnit,
  reservableTimes,
  activeApplicationRounds,
}: AvailableTimesProps): string[] {
  if (!reservationUnit || !activeApplicationRounds) {
    return [];
  }
  const [timeHours, timeMinutesRaw] = [0, 0];

  const timeMinutes = timeMinutesRaw > 59 ? 59 : timeMinutesRaw;
  const { reservationStartInterval: interval } = reservationUnit;
  return getPossibleTimesForDay(
    reservableTimes,
    interval,
    start,
    reservationUnit,
    activeApplicationRounds,
    duration
  )
    .map((n) => {
      const [slotHours, slotMinutes] = n.label.split(":").map(Number);
      const startDate = new Date(start);
      startDate.setHours(slotHours, slotMinutes, 0, 0);
      const endDate = addMinutes(startDate, duration ?? 0);
      const startTime = new Date(start);
      startTime.setHours(timeHours, timeMinutes, 0, 0);
      const isReservable = isReservationReservable({
        reservationUnit,
        reservableTimes,
        activeApplicationRounds,
        start: startDate,
        end: endDate,
        skipLengthCheck: false,
      });

      return isReservable && !isBefore(startDate, startTime) ? n.label : null;
    })
    .filter((n): n is NonNullable<typeof n> => n != null);
}

// Returns the next available time, after the given time (Date object)
export function getNextAvailableTime(props: AvailableTimesProps): Date | null {
  const { start, reservationUnit, reservableTimes } = props;
  if (reservationUnit == null) {
    return null;
  }
  const { reservationsMinDaysBefore, reservationsMaxDaysBefore } =
    reservationUnit;

  const today = addDays(new Date(), reservationsMinDaysBefore ?? 0);
  const possibleEndDay = getLastPossibleReservationDate(reservationUnit);
  const endDay = possibleEndDay ? addDays(possibleEndDay, 1) : undefined;
  const minDay = dayMax([today, start]) ?? today;
  // Find the first possible day
  // FIXME use the end date to iterate till we find a day
  const openTimes = reservableTimes.get(dateToKey(minDay));
  if (openTimes == null) {
    return null;
  }
  const interval = openTimes[0];
  const startDay = dayMax([new Date(interval.start), minDay]) ?? minDay;

  const daysToGenerate = reservationsMaxDaysBefore ?? 180;
  const days = Array.from({ length: daysToGenerate }, (_, i) =>
    addDays(startDay, i)
  );

  // Find the first possible time for that day, continue for each day until we find one
  for (const singleDay of days) {
    // have to run this complex check to remove already reserved times
    const availableTimesForDay = getAvailableTimesForDay({
      ...props,
      start: singleDay,
    });
    const hasAvailableTimes = availableTimesForDay.length > 0;
    if (hasAvailableTimes) {
      const startDatetime = availableTimesForDay[0];
      const [hours, minutes] = startDatetime
        .split(":")
        .map(Number)
        .filter(Number.isFinite);
      return set(singleDay, { hours, minutes });
    }
  }

  return null;
}
