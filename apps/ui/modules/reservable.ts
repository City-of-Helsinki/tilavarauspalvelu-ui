/** Common functions for checking if a reservation is valid
 *  If it can be made, or if it can be changed
 *  Used by both new reservations and editing existing ones.
 */
import {
  ReservationStartInterval,
  type ReservationNode,
  type IsReservableFieldsFragment,
  type ReservableTimeSpanType,
  ReservationStateChoice,
  type Maybe,
} from "@/gql/gql-types";
import {
  dayMax,
  dayMin,
  filterNonNullable,
  getIntervalMinutes,
} from "common/src/helpers";
import {
  set,
  differenceInSeconds,
  isValid,
  format,
  getHours,
  getMinutes,
  addMinutes,
  areIntervalsOverlapping,
  startOfDay,
  isAfter,
  addDays,
  isBefore,
  isWithinInterval,
  addSeconds,
  endOfDay,
  isSameDay,
  addMilliseconds,
  differenceInMinutes,
} from "date-fns";
import { getDayIntervals } from "./util";
import { type SlotProps } from "common/src/calendar/Calendar";
import { type ReservationUnitNode } from "common/gql/gql-types";

export type RoundPeriod = {
  reservationPeriodBegin: string;
  reservationPeriodEnd: string;
};

type BufferCollideCheckReservation = Pick<
  ReservationNode,
  "begin" | "end" | "isBlocked" | "bufferTimeBefore" | "bufferTimeAfter"
>;

// TODO sub classing Map and overriding get would be a lot cleaner
// because of the way get compares (===) the keys we have to serialize keys to strings
// which removes all type information (and allows empty strings or malformed keys)
// we want the key to be { year, month, day } and not a string
// for now using "yyyy-mm-dd" as the key to test it, refactor later (using a subclass).
// TODO values should be { hour, minute } not Date objects
// TODO provide serialization and deserialization functions (that have format checkers)
export type ReservableMapKey = string; // format: "yyyy-mm-dd"
export type ReservableMap = Map<
  ReservableMapKey,
  Array<{ start: Date; end: Date }>
>;

export function dateToKey(date: Date): ReservableMapKey {
  return format(date, "yyyy-MM-dd");
}
/// This function converts a time span array into a map of days with the time spans
// Cases:
// - multiple time spans on the same day
// - single time span spanning multiple days
// - a time span that starts on the previous day and ends on the next day
// TODO (later) this should reduce the amount of memory we use by
// - storing only the times not date (and constructing the date from the key)
// - store a smaller interval (like a month at a time, not the whole 2 years)
// TODO splitting Date into actual Date and Time would make this a lot easier
// because the key should only care about the Date part and we don't want
// make stupid mistakes by using Map.get(new Date()) instead of Map.get(startOfDay(new Date()))
export function generateReservableMap(
  reservableTimeSpans: ReservableTimeSpanType[]
): ReservableMap {
  const converted = reservableTimeSpans
    .map((n) => {
      if (n.startDatetime == null || n.endDatetime == null) {
        return null;
      }
      const end = new Date(n.endDatetime);
      const start = new Date(n.startDatetime);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
      }
      if (isBefore(end, start)) {
        return null;
      }
      // remove all days that are in the past
      if (isBefore(end, new Date())) {
        return null;
      }
      if (isBefore(start, startOfDay(new Date()))) {
        start.setTime(startOfDay(new Date()).getTime());
      }
      if (end.getTime() === startOfDay(end).getTime()) {
        end.setTime(addMilliseconds(end, -1).getTime());
      }
      return { start, end };
    })
    .filter((n): n is NonNullable<typeof n> => n != null);

  // eslint-disable-next-line no-console -- should enforce that input type is never null instead
  console.assert(converted.length === reservableTimeSpans.length);

  const map = new Map<string, Array<{ start: Date; end: Date }>>();
  for (const n of converted) {
    if (!isSameDay(n.start, n.end)) {
      const start = startOfDay(n.start);
      const end = endOfDay(n.end);
      for (let i = start; i < end; i = addDays(i, 1)) {
        const day = dateToKey(i);
        const start_ = dayMax([n.start, i]);
        const end_ = dayMin([n.end, endOfDay(i)]);
        // eslint-disable-next-line no-console
        console.assert(start_ != null && end_ != null);
        if (start_ == null || end_ == null) {
          continue;
        }
        const val = {
          start: start_,
          end: end_,
        };
        // eslint-disable-next-line no-console
        console.assert(val.start.getDate() === val.end.getDate());
        if (map.has(day)) {
          const arr = map.get(day) ?? [];
          arr.push(val);
          // TODO isn't this superfluous?
          map.set(day, arr);
        } else {
          map.set(day, [val]);
        }
      }
    } else {
      // the simplest case is when the start and end are on the same day
      const day = dateToKey(new Date(n.start));
      if (map.has(day)) {
        const arr = map.get(day) ?? [];
        arr.push(n);
        // TODO isn't this superfluous?
        map.set(day, arr);
        continue;
      } else {
        map.set(day, [n]);
      }
    }
  }

  return map;
}

export function isSlotWithinReservationTime(
  start: Date,
  reservationBegins?: Date,
  reservationEnds?: Date
): boolean {
  return (
    (!reservationBegins || isAfter(start, new Date(reservationBegins))) &&
    (!reservationEnds || isBefore(start, new Date(reservationEnds)))
  );
}

type ReservationUnitReservableProps = {
  range: {
    start: Date;
    end: Date;
  };
  reservationUnit: Omit<IsReservableFieldsFragment, "reservableTimeSpans">;
  // pregenerated open slots
  reservableTimes: ReservableMap;
  activeApplicationRounds: RoundPeriod[];
};

/// NOTE don't return [boolean, string] causes issues in TS / JS
/// instead break this function into cleaner separate functions
/// FIXME this function is getting called 100s or 1000s times when dragging a calendar event
/// when moving with a click this is called 20+ times
/// time change using the form elements also 20+ times
/// TODO this should be renamed and moved
/// is range reservable is a better name
/// range: { start, end } should be the first parameter
export function isRangeReservable({
  range,
  reservationUnit,
  activeApplicationRounds,
  reservableTimes,
}: ReservationUnitReservableProps): boolean {
  const {
    reservationSet,
    bufferTimeBefore,
    bufferTimeAfter,
    maxReservationDuration,
    minReservationDuration,
    reservationStartInterval,
    reservationsMaxDaysBefore,
    reservationsMinDaysBefore,
    reservationBegins,
    reservationEnds,
  } = reservationUnit;
  const { start, end } = range;

  if (!isValid(start) || !isValid(end)) {
    return false;
  }

  const normalizedEnd = addMilliseconds(end, -1);
  if (isBefore(normalizedEnd, start)) {
    return false;
  }

  // check interval length
  // can't use normalized end because that would make the interval 1ms shorter
  const intervalMinutes = getIntervalMinutes(reservationStartInterval);
  if (differenceInSeconds(end, start) % (intervalMinutes * 60) !== 0) {
    return false;
  }

  if (minReservationDuration) {
    const dur = differenceInSeconds(new Date(end), new Date(start));
    if (!(dur >= minReservationDuration)) {
      return false;
    }
  }
  if (maxReservationDuration) {
    const dur = differenceInSeconds(new Date(end), new Date(start));
    if (!(dur <= maxReservationDuration)) {
      return false;
    }
  }

  const shouldReservationBlock = (r: Pick<ReservationNode, "state">) => {
    return (
      r.state !== ReservationStateChoice.Denied &&
      r.state !== ReservationStateChoice.Cancelled
    );
  };
  const others = filterNonNullable(reservationSet).filter(
    shouldReservationBlock
  );
  const reservation = {
    start,
    end,
    bufferTimeBefore,
    bufferTimeAfter,
  };

  const isBufferCollision = others.some((r) => hasCollisions(r, reservation));
  if (isBufferCollision) {
    return false;
  }

  if (!isDateInsideInterval(start, reservableTimes, reservationStartInterval)) {
    return false;
  }

  // TODO what does this do?
  if (
    !isRangeReservable_({
      range: [start, normalizedEnd],
      reservableTimes,
      reservationBegins: reservationBegins
        ? new Date(reservationBegins)
        : undefined,
      reservationEnds: reservationEnds ? new Date(reservationEnds) : undefined,
      reservationsMaxDaysBefore: reservationsMaxDaysBefore ?? 0,
      reservationsMinDaysBefore: reservationsMinDaysBefore ?? 0,
      activeApplicationRounds,
    })
  ) {
    return false;
  }

  return true;
}

export type TimeFrameSlot = { start: Date; end: Date };
// checks that the start time is valid for the interval of the reservation unit
function isDateInsideInterval(
  date: Date,
  timeSlots: ReservableMap,
  interval: ReservationStartInterval
): boolean {
  const slotsForDay = timeSlots.get(dateToKey(date));
  if (slotsForDay == null) {
    return false;
  }

  const timeframe = slotsForDay.reduce<TimeFrameSlot | null>((acc, curr) => {
    const begin = new Date(curr.start);
    const end = new Date(curr.end);
    return {
      start: acc?.start && acc.start < begin ? acc.start : begin,
      end: acc?.end && acc.end > end ? acc.end : end,
    };
  }, null);

  const { start, end } = timeframe ?? {};
  if (start == null || end == null) {
    return false;
  }

  const s: { h: number; m: number } = {
    h: getHours(start),
    m: getMinutes(start),
  };
  const e: { h: number; m: number } = { h: getHours(end), m: getMinutes(end) };
  const intervals = getDayIntervals(s, e, interval);
  for (const i of intervals) {
    if (i.h === s.h && i.m === s.m) {
      return true;
    }
  }
  return false;
}

// TODO rename and rework this function
function isRangeReservable_({
  range,
  reservableTimes,
  reservationBegins,
  reservationEnds,
  reservationsMinDaysBefore = 0,
  reservationsMaxDaysBefore = 0,
  activeApplicationRounds = [],
}: {
  range: Date[];
  reservableTimes: ReservableMap;
  reservationsMinDaysBefore: number;
  reservationsMaxDaysBefore: number;
  reservationBegins?: Date;
  reservationEnds?: Date;
  activeApplicationRounds: RoundPeriod[];
}): boolean {
  // eslint-disable-next-line no-console
  console.assert(range.length === 2, "Invalid range", range);
  // FIXME this is not good
  // we should be able to check the range without generating all the slots
  const slots = generateSlots(
    range[0],
    range[1],
    ReservationStartInterval.Interval_15Mins
  );

  if (
    !slots.every((slot) =>
      areReservableTimesAvailable(reservableTimes, slot, true)
    )
  ) {
    return false;
  }

  const isSlotReservable = (slot: Date) => {
    const isInFrame = isSlotWithinTimeframe(
      slot,
      reservationsMinDaysBefore,
      reservationsMaxDaysBefore,
      reservationBegins,
      reservationEnds
    );
    const collides = doesSlotCollideWithApplicationRounds(
      slot,
      activeApplicationRounds
    );
    return isInFrame && !collides;
  };

  return range.every((slot) => isSlotReservable(slot));
}

// TODO this is a bad name
// it does handle buffer check but also checks against all reservations
function hasCollisions(
  reservation: BufferCollideCheckReservation,
  newReservation: {
    start: Date;
    end: Date;
    bufferTimeBefore: number;
    bufferTimeAfter: number;
  }
): boolean {
  function getBufferedEventTimes(
    start: Date,
    end: Date,
    bufferTimeBefore: number,
    bufferTimeAfter: number,
    isBlocked?: Maybe<boolean> | undefined
  ): { start: Date; end: Date } {
    if (isBlocked) {
      return { start, end };
    }
    return {
      start: addSeconds(start, -bufferTimeBefore),
      end: addSeconds(end, bufferTimeAfter),
    };
  }

  const bufferedReservation = getBufferedEventTimes(
    new Date(reservation.begin),
    new Date(reservation.end),
    reservation.bufferTimeBefore,
    reservation.bufferTimeAfter,
    reservation.isBlocked
  );
  const bufferedNewReservation = getBufferedEventTimes(
    newReservation.start,
    newReservation.end,
    newReservation.bufferTimeBefore,
    newReservation.bufferTimeAfter
  );
  return areIntervalsOverlapping(bufferedReservation, bufferedNewReservation);
}

function generateSlots(
  start: Date,
  end: Date,
  reservationStartInterval: ReservationStartInterval
): Date[] {
  if (!start || !end || !reservationStartInterval) return [];

  const slots = [];
  const intervalMinutes = getIntervalMinutes(reservationStartInterval);

  for (let i = new Date(start); i <= end; i = addMinutes(i, intervalMinutes)) {
    slots.push(i);
  }

  return slots;
}

function areReservableTimesAvailable(
  reservableTimes: ReservableMap,
  slotDate: Date,
  validateEnding = false
): boolean {
  // TODO this should be done differently slots is kinda bad
  const day = startOfDay(slotDate);
  const reservableTimesForDay = reservableTimes.get(dateToKey(day));
  if (reservableTimesForDay == null) {
    return false;
  }
  return reservableTimesForDay.some((slot) => {
    const startDate = slot.start;
    const endDate = slot.end;

    if (validateEnding) {
      return startDate <= slotDate && endDate > slotDate;
    }
    return startDate <= slotDate;
  });
}

function isSlotWithinTimeframe(
  start: Date,
  minDaysBefore: number,
  maxDaysBefore: number,
  reservationBegins?: Date,
  reservationEnds?: Date
) {
  const isLegalTimeframe =
    isAfter(start, new Date()) &&
    isSlotWithinReservationTime(start, reservationBegins, reservationEnds);
  const maxDay = addDays(new Date(), maxDaysBefore);
  // if max days === 0 => latest = today
  const isBeforeMaxDaysBefore = maxDaysBefore === 0 || !isAfter(start, maxDay);
  const minDay = addDays(new Date(), minDaysBefore);
  const isAfterMinDaysBefore = !isBefore(start, startOfDay(minDay));
  return isLegalTimeframe && isAfterMinDaysBefore && isBeforeMaxDaysBefore;
}

function doesSlotCollideWithApplicationRounds(
  slot: Date,
  rounds: RoundPeriod[]
): boolean {
  if (rounds.length < 1) return false;

  return rounds.some((round) =>
    isWithinInterval(slot, {
      start: new Date(round.reservationPeriodBegin),
      end: new Date(round.reservationPeriodEnd).setHours(23, 59, 59),
    })
  );
}

function areSlotsReservable(
  slots: Date[],
  reservableTimes: ReservableMap,
  reservationsMinDaysBefore: number,
  reservationsMaxDaysBefore: number,
  reservationBegins?: Date,
  reservationEnds?: Date,
  activeApplicationRounds: RoundPeriod[] = []
): boolean {
  return slots.every(
    (slotDate) =>
      // NOTE seems that the order of checks improves performance
      isSlotWithinTimeframe(
        slotDate,
        reservationsMinDaysBefore,
        reservationsMaxDaysBefore,
        reservationBegins,
        reservationEnds
      ) &&
      areReservableTimesAvailable(reservableTimes, slotDate, true) &&
      !doesSlotCollideWithApplicationRounds(slotDate, activeApplicationRounds)
  );
}

type PropGetterProps = {
  reservableTimes: ReservableMap;
  activeApplicationRounds: RoundPeriod[];
  reservationsMinDaysBefore: number;
  reservationsMaxDaysBefore: number;
  customValidation?: (arg: Date) => boolean;
  reservationBegins?: Date;
  reservationEnds?: Date;
};
// TODO refactor this (it's way too complicated and passes all it's parameters to another function)
export const getSlotPropGetter =
  ({
    reservableTimes,
    activeApplicationRounds,
    reservationBegins,
    reservationEnds,
    reservationsMinDaysBefore,
    reservationsMaxDaysBefore,
    customValidation,
  }: PropGetterProps) =>
  (date: Date): SlotProps => {
    if (
      areSlotsReservable(
        [date],
        reservableTimes,
        reservationsMinDaysBefore,
        reservationsMaxDaysBefore,
        reservationBegins,
        reservationEnds,
        activeApplicationRounds
      ) &&
      (customValidation ? customValidation(date) : true)
    ) {
      return {};
    }

    return {
      className: "rbc-timeslot-inactive",
    };
  };

/// Clamp the user selected start time and duration to the nearest interval
/// TODO should this also do range check?
export function getBoundCheckedReservation({
  start,
  end,
  reservationUnit,
  durationOptions,
}: {
  start: Date;
  end: Date;
  reservationUnit: Pick<
    ReservationUnitNode,
    | "minReservationDuration"
    | "maxReservationDuration"
    | "reservationStartInterval"
  >;
  durationOptions: { label: string; value: number }[];
}): { start: Date; end: Date } | null {
  // the next check is going to systematically fail unless the times are at least minReservationDuration apart
  const { minReservationDuration, reservationStartInterval } = reservationUnit;
  const minReservationDurationMinutes =
    getMinReservationDuration(reservationUnit);
  const maxReservationDurationMinutes =
    getMaxReservationDuration(reservationUnit);

  const minEnd = addSeconds(start, minReservationDuration ?? 0);
  // duration should never be smaller than the minimum duration option
  const originalDuration = differenceInMinutes(end, start);

  // start time and duration needs to be snapped to the nearest interval
  // i.e. case where the options are 60 mins apart but the drag and drop allows 30 mins increments
  // this causes backend validation errors
  const interval = getIntervalMinutes(reservationStartInterval);
  let dayTime = start.getHours() * 60 + start.getMinutes();
  if (dayTime % interval !== 0) {
    dayTime = Math.ceil(dayTime / interval) * interval;
  }
  const newStart = set(startOfDay(start), {
    hours: dayTime / 60,
    minutes: dayTime % 60,
  });
  let duration = clampDuration(
    originalDuration,
    minReservationDurationMinutes,
    maxReservationDurationMinutes,
    durationOptions
  );
  if (duration % interval !== 0) {
    duration = Math.ceil(duration / interval) * interval;
  }
  const newEnd = dayMax([end, minEnd, addMinutes(newStart, duration)]);
  if (newEnd == null || newStart == null) {
    return null;
  }
  return { start: newStart, end: newEnd };
}

// technically can be left empty (backend allows it)
export function getMinReservationDuration(
  reservationUnit: Pick<ReservationUnitNode, "minReservationDuration">
): number {
  return reservationUnit.minReservationDuration
    ? reservationUnit.minReservationDuration / 60
    : 30;
}

// technically can be left empty (backend allows it)
export function getMaxReservationDuration(
  reservationUnit: Pick<ReservationUnitNode, "maxReservationDuration">
): number {
  return reservationUnit.maxReservationDuration
    ? reservationUnit.maxReservationDuration / 60
    : Number.MAX_SAFE_INTEGER;
}

// Duration needs to always be within the bounds of the reservation unit
// and be defined otherwise the Duration select breaks (visual bugs)
export function clampDuration(
  duration: number,
  minReservationDurationMinutes: number,
  maxReservationDurationMinutes: number,
  durationOptions: { label: string; value: number }[]
): number {
  const initialDuration = Math.max(
    minReservationDurationMinutes,
    durationOptions[0]?.value ?? 0
  );
  return Math.min(
    Math.max(duration, initialDuration),
    maxReservationDurationMinutes
  );
}