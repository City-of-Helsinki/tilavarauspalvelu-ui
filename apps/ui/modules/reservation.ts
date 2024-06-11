import {
  addMinutes,
  isWithinInterval,
  isBefore,
  startOfDay,
  areIntervalsOverlapping,
  addSeconds,
  differenceInSeconds,
  isAfter,
  isValid,
  addDays,
  format,
  isSameDay,
  set,
  roundToNearestMinutes,
  differenceInMinutes,
} from "date-fns";
import type { PendingReservation } from "common/types/common";
import {
  State,
  type ReservationNode,
  ReservationStartInterval,
  CustomerTypeChoice,
  type ReservationMetadataFieldNode,
  type Maybe,
  type PaymentOrderNode,
  type ListReservationsQuery,
  IsReservableFieldsFragment,
  ReservationUnitNode,
  ReservableTimeSpanType,
} from "@gql/gql-types";
import { getReservationApplicationFields } from "common/src/reservation-form/util";
import { filterNonNullable } from "common/src/helpers";
import { getDayIntervals, getTranslation } from "./util";
import type { TFunction } from "i18next";
import { type SlotProps } from "common/src/calendar/Calendar";
import { toUIDate } from "common/src/common/util";

// TimeSlots change the Calendar view. How many intervals are shown i.e. every half an hour, every hour
// we use every hour only => 2
export const SLOTS_EVERY_HOUR = 2;

/// @param opts subset of ReservationUnitNode
/// @param t translation function
/// opts should never include undefined values but our codegen doesn't properly type it
export function getDurationOptions(
  opts: {
    minReservationDuration?: Maybe<number>;
    maxReservationDuration?: Maybe<number>;
    reservationStartInterval: Maybe<ReservationStartInterval> | undefined;
  },
  t: TFunction
): { label: string; value: number }[] {
  if (
    !opts.minReservationDuration ||
    !opts.maxReservationDuration ||
    !opts.reservationStartInterval
  ) {
    return [];
  }
  const intervalMinutes = getIntervalMinutes(opts.reservationStartInterval);
  if (!intervalMinutes) {
    return [];
  }

  const minuteString = (mins: number, hours: number) => {
    if (mins > 90)
      return t("common:abbreviations.minute", { count: mins % 60 });
    if (mins <= 90) return t("common:abbreviations.minute", { count: mins });
    if (mins !== 0)
      return t("common:abbreviations.minute", {
        count: mins - hours * 60,
      });
    return "";
  };

  const durationOptions: { label: string; value: number }[] = [];
  const minReservationDurationMinutes = opts.minReservationDuration / 60;
  const maxReservationDurationMinutes = opts.maxReservationDuration / 60;
  const start =
    minReservationDurationMinutes > intervalMinutes
      ? minReservationDurationMinutes
      : intervalMinutes;

  for (
    let i = start;
    i <= maxReservationDurationMinutes;
    i += intervalMinutes
  ) {
    const hours: number = Math.floor(i / 60);
    const hourString =
      i > 90 ? t("common:abbreviations.hour", { count: hours }) : "";

    const optionString = `${hourString} ${minuteString(i, hours)}`;
    durationOptions.push({
      label: optionString,
      value: i,
    });
  }

  return durationOptions;
}

export function isReservationInThePast(
  reservation: Pick<ReservationNode, "begin">
): boolean {
  if (!reservation?.begin) {
    return false;
  }

  const now = new Date().setSeconds(0, 0);
  return !isAfter(new Date(reservation.begin).setSeconds(0, 0), now);
}

type ReservationQueryT = NonNullable<ListReservationsQuery["reservations"]>;
type ReservationEdgeT = NonNullable<ReservationQueryT["edges"]>[0];
type ReservationNodeT = NonNullable<NonNullable<ReservationEdgeT>["node"]>;

type IsWithinCancellationPeriodReservationT = Pick<
  ReservationNodeT,
  "begin"
> & {
  reservationUnit?: Array<{
    cancellationRule?: Pick<
      NonNullable<ReservationUnitNode["cancellationRule"]>,
      "canBeCancelledTimeBefore" | "needsHandling"
    > | null;
  }> | null;
};
type GetReservationCancellationReasonReservationT = Pick<
  ReservationNodeT,
  "begin"
> & {
  reservationUnit?: Array<{
    cancellationRule?: Pick<
      NonNullable<ReservationUnitNode["cancellationRule"]>,
      "canBeCancelledTimeBefore" | "needsHandling"
    > | null;
  }> | null;
};

function isReservationWithinCancellationPeriod(
  reservation: IsWithinCancellationPeriodReservationT
): boolean {
  const reservationUnit = reservation.reservationUnit?.[0];
  const begin = new Date(reservation.begin);

  const minutesBeforeCancel =
    reservationUnit?.cancellationRule?.canBeCancelledTimeBefore ?? 0;
  const cancelLatest = addSeconds(new Date(), minutesBeforeCancel);

  return cancelLatest > begin;
}

export function canUserCancelReservation(
  reservation: IsWithinCancellationPeriodReservationT &
    Pick<NonNullable<ReservationNodeT>, "state">,
  skipTimeCheck = false
): boolean {
  const reservationUnit = reservation.reservationUnit?.[0];
  if (reservation.state !== State.Confirmed) return false;
  if (!reservationUnit?.cancellationRule) return false;
  if (reservationUnit?.cancellationRule?.needsHandling) return false;
  if (!skipTimeCheck && isReservationWithinCancellationPeriod(reservation))
    return false;

  return true;
}

export function getReservationApplicationMutationValues(
  // TODO don't use Records to avoid proper typing
  payload: Record<string, string | number | boolean>,
  supportedFields: Pick<ReservationMetadataFieldNode, "fieldName">[],
  reserveeType: CustomerTypeChoice
): Record<string, string | number | boolean> {
  const result: typeof payload = { reserveeType };
  const intValues = ["numPersons"];
  const changes = [
    { field: "homeCity", mutationField: "homeCityPk" },
    { field: "ageGroup", mutationField: "ageGroupPk" },
    { field: "purpose", mutationField: "purposePk" },
  ];
  const fields = getReservationApplicationFields({
    supportedFields,
    reserveeType,
  });

  const commonFields = getReservationApplicationFields({
    supportedFields,
    reserveeType: "common",
  });

  [...fields, ...commonFields].forEach((field: string) => {
    const key = changes.find((c) => c.field === field)?.mutationField || field;
    result[key] = intValues.includes(field)
      ? Number(payload[field])
      : payload[field];
  });

  result.reserveeType = reserveeType;

  return result;
}

type ReservationCancellationReason =
  | "PAST"
  | "NO_CANCELLATION_RULE"
  | "REQUIRES_HANDLING"
  | "BUFFER";

export function getReservationCancellationReason(
  reservation: GetReservationCancellationReasonReservationT
): ReservationCancellationReason | null {
  const reservationUnit = reservation.reservationUnit?.[0];

  if (isReservationInThePast(reservation)) {
    return "PAST";
  }

  if (!reservationUnit?.cancellationRule) {
    return "NO_CANCELLATION_RULE";
  }

  if (reservationUnit.cancellationRule?.needsHandling) {
    return "REQUIRES_HANDLING";
  }

  if (
    reservationUnit.cancellationRule?.canBeCancelledTimeBefore &&
    isReservationWithinCancellationPeriod(reservation)
  ) {
    return "BUFFER";
  }

  return null;
}

function shouldShowOrderStatus(state: State) {
  if (
    state === State.Created ||
    state === State.WaitingForPayment ||
    state === State.RequiresHandling
  ) {
    return false;
  }
  return true;
}

export function getNormalizedReservationOrderStatus(
  reservation: Pick<ReservationNode, "state"> & {
    order?: Pick<PaymentOrderNode, "status"> | null | undefined;
  }
): string | null {
  if (!reservation) {
    return null;
  }

  if (shouldShowOrderStatus(reservation.state)) {
    return reservation.order?.status ?? null;
  }

  return null;
}

function isReservationLongEnough(
  start: Date,
  end: Date,
  minDuration: number
): boolean {
  if (!minDuration) return true;

  const reservationDuration = differenceInSeconds(
    new Date(end),
    new Date(start)
  );
  return reservationDuration >= minDuration;
}

function isReservationShortEnough(
  start: Date,
  end: Date,
  maxDuration: number
): boolean {
  if (!maxDuration) return true;

  const reservationDuration = differenceInSeconds(
    new Date(end),
    new Date(start)
  );
  return reservationDuration <= maxDuration;
}

type ReservationUnitReservableProps = {
  reservationUnit: IsReservableFieldsFragment;
  activeApplicationRounds: RoundPeriod[];
  start: Date;
  end: Date;
  skipLengthCheck: boolean;
};

/// NOTE don't return [boolean, string] causes issues in TS / JS
/// instead break this function into cleaner separate functions
export function isReservationReservable({
  reservationUnit,
  activeApplicationRounds,
  start,
  end,
  skipLengthCheck = false,
}: ReservationUnitReservableProps): boolean {
  if (!reservationUnit) {
    return false;
  }

  const normalizedEnd = addMinutes(end, -1);

  const {
    reservationSet,
    bufferTimeBefore,
    bufferTimeAfter,
    reservableTimeSpans: reservableTimes,
    maxReservationDuration,
    minReservationDuration,
    reservationStartInterval,
    reservationsMaxDaysBefore,
    reservationsMinDaysBefore,
    reservationBegins,
    reservationEnds,
  } = reservationUnit;

  if (!isValid(start) || !isValid(end)) {
    return false;
  }

  const reservationsArr = filterNonNullable(reservationSet);
  if (
    doBuffersCollide(
      {
        start,
        end,
        isBlocked: false,
        bufferTimeBefore: bufferTimeBefore ?? 0,
        bufferTimeAfter: bufferTimeAfter ?? 0,
      },
      reservationsArr
    )
  ) {
    return false;
  }

  const reservableTimeSpans = filterNonNullable(reservableTimes) ?? [];
  if (
    !isStartTimeWithinInterval(
      start,
      reservableTimeSpans,
      reservationStartInterval
    )
  ) {
    return false;
  }

  if (
    !isRangeReservable({
      range: [new Date(start), normalizedEnd],
      reservableTimeSpans,
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

  if (
    !skipLengthCheck &&
    !isReservationLongEnough(start, end, minReservationDuration ?? 0)
  ) {
    return false;
  }

  if (
    !skipLengthCheck &&
    !isReservationShortEnough(start, end, maxReservationDuration ?? 0)
  ) {
    return false;
  }

  if (doReservationsCollide({ start, end }, reservationsArr)) {
    return false;
  }

  return true;
}

const isReservationConfirmed = (reservation: { state: State }): boolean =>
  reservation.state === State.Confirmed;

const isReservationFreeOfCharge = (
  reservation: Pick<ReservationNode, "price">
): boolean => parseInt(String(reservation.price), 10) === 0;

export type CanReservationBeChangedProps = {
  reservation?: Pick<
    ReservationNode,
    "begin" | "end" | "isHandled" | "state" | "price"
  >;
  newReservation?: ReservationNode | PendingReservation;
  reservationUnit?: IsReservableFieldsFragment;
  activeApplicationRounds?: RoundPeriod[];
};

/// NOTE [boolean, string] causes issues in TS / JS
/// ![false] === ![true] === false, with no type errors
/// either refactor the return value or add lint rules to disable ! operator
/// TODO disable undefined from reservation and reservationUnit
export function canReservationTimeBeChanged({
  reservation,
  newReservation,
  reservationUnit,
  activeApplicationRounds = [],
}: CanReservationBeChangedProps): [boolean, string?] {
  if (reservation == null) {
    return [false];
  }
  // existing reservation state is not CONFIRMED
  if (!isReservationConfirmed(reservation)) {
    return [false, "RESERVATION_MODIFICATION_NOT_ALLOWED"];
  }

  // existing reservation begin time is in the future
  if (isReservationInThePast(reservation)) {
    return [false, "RESERVATION_BEGIN_IN_PAST"];
  }

  // existing reservation is free
  if (!isReservationFreeOfCharge(reservation)) {
    return [false, "RESERVATION_MODIFICATION_NOT_ALLOWED"];
  }

  // existing reservation has valid cancellation rule that does not require handling
  if (!canUserCancelReservation(reservation, true)) {
    return [false, "RESERVATION_MODIFICATION_NOT_ALLOWED"];
  }

  // existing reservation cancellation buffer is not exceeded
  if (!canUserCancelReservation(reservation)) {
    return [false, "CANCELLATION_TIME_PAST"];
  }

  // existing reservation has been handled
  if (reservation.isHandled) {
    return [false, "RESERVATION_MODIFICATION_NOT_ALLOWED"];
  }

  if (newReservation) {
    //  new reservation is free
    if (!isReservationFreeOfCharge(newReservation)) {
      return [false, "RESERVATION_MODIFICATION_NOT_ALLOWED"];
    }

    if (reservationUnit == null) {
      return [false, "RESERVATION_UNIT_NOT_FOUND"];
    }

    //  new reservation is valid
    const isReservable = isReservationReservable({
      reservationUnit,
      activeApplicationRounds,
      start: new Date(newReservation.begin),
      end: new Date(newReservation.end),
      skipLengthCheck: false,
    });
    if (!isReservable) {
      return [false, "RESERVATION_TIME_INVALID"];
    }
  }

  return [true];
};

// FIXME this is awful: we don't use the Node type anymore, this is not type safe, it's not intuative what this does and why
export function getReservationValue(
  reservation: ReservationNode,
  key: string
): string | number | null {
  switch (key) {
    case "ageGroup": {
      const { minimum, maximum } = reservation.ageGroup || {};
      return minimum && maximum ? `${minimum} - ${maximum}` : null;
    }
    case "purpose": {
      if (reservation.purpose != null) {
        return getTranslation(reservation.purpose, "name");
      }
      return null;
    }
    case "homeCity": {
      if (reservation.homeCity == null) {
        return null;
      }
      return (
        getTranslation(reservation.homeCity, "name") ||
        reservation.homeCity.name
      );
    }
    default: {
      if (key in reservation) {
        const val = reservation[key as keyof ReservationNode];
        if (typeof val === "string" || typeof val === "number") {
          return val;
        }
      }
      return null;
    }
  }
};

export function getCheckoutUrl(
  order?: Maybe<{ checkoutUrl?: Maybe<string> }>,
  lang = "fi"
): string | undefined {
  const { checkoutUrl } = order ?? {};

  if (!checkoutUrl) {
    return undefined;
  }

  try {
    const { origin, pathname, searchParams } = new URL(checkoutUrl);
    const baseUrl = `${origin}${pathname}`;
    searchParams.set("lang", lang);
    return `${baseUrl}/paymentmethod?${searchParams.toString()}`;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
  return undefined;
}

export function isRangeReservable({
  range,
  reservableTimeSpans,
  reservationBegins,
  reservationEnds,
  reservationsMinDaysBefore = 0,
  reservationsMaxDaysBefore = 0,
  activeApplicationRounds = [],
}: {
  range: Date[];
  reservableTimeSpans: ReservableTimeSpanType[];
  reservationsMinDaysBefore: number;
  reservationsMaxDaysBefore: number;
  reservationBegins?: Date;
  reservationEnds?: Date;
  activeApplicationRounds: RoundPeriod[];
}): boolean {
  const slots = generateSlots(
    range[0],
    range[1],
    ReservationStartInterval.Interval_15Mins
  );

  if (
    !slots.every((slot) =>
      areReservableTimesAvailable(reservableTimeSpans, slot, true)
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

export type RoundPeriod = {
  reservationPeriodBegin: string;
  reservationPeriodEnd: string;
};
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

export function areSlotsReservable(
  slots: Date[],
  reservableTimeSpans: ReservableTimeSpanType[],
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
      areReservableTimesAvailable(reservableTimeSpans, slotDate, true) &&
      !doesSlotCollideWithApplicationRounds(slotDate, activeApplicationRounds)
  );
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

export const getSlotPropGetter =
  ({
    reservableTimeSpans,
    activeApplicationRounds,
    reservationBegins,
    reservationEnds,
    reservationsMinDaysBefore,
    reservationsMaxDaysBefore,
    customValidation,
  }: {
    reservableTimeSpans: ReservableTimeSpanType[];
    activeApplicationRounds: RoundPeriod[];
    reservationsMinDaysBefore: number;
    reservationsMaxDaysBefore: number;
    customValidation?: (arg: Date) => boolean;
    reservationBegins?: Date;
    reservationEnds?: Date;
  }) =>
  (date: Date): SlotProps => {
    if (
      areSlotsReservable(
        [date],
        reservableTimeSpans,
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

type BufferCollideCheckReservation = Pick<
  ReservationNode,
  "begin" | "end" | "isBlocked" | "bufferTimeBefore" | "bufferTimeAfter"
>;
export function doBuffersCollide(
  newReservation: {
    start: Date;
    end: Date;
    isBlocked?: boolean;
    bufferTimeBefore?: number;
    bufferTimeAfter?: number;
  },
  reservations: BufferCollideCheckReservation[] = []
): boolean {
  return reservations.some((reservation) =>
    doesBufferCollide(reservation, newReservation)
  );
}

function doesBufferCollide(
  reservation: BufferCollideCheckReservation,
  newReservation: {
    start: Date;
    end: Date;
    isBlocked?: boolean;
    bufferTimeBefore?: number;
    bufferTimeAfter?: number;
  }
): boolean {
  if (newReservation.isBlocked) return false;

  const newReservationStartBuffer =
    reservation.bufferTimeAfter &&
    reservation.bufferTimeAfter > (newReservation.bufferTimeBefore || 0)
      ? reservation.bufferTimeAfter
      : newReservation.bufferTimeBefore;
  const newReservationEndBuffer =
    reservation.bufferTimeBefore &&
    reservation.bufferTimeBefore > (newReservation.bufferTimeAfter || 0)
      ? reservation.bufferTimeBefore
      : newReservation.bufferTimeAfter;

  const bufferedNewReservation = getBufferedEventTimes(
    newReservation.start,
    newReservation.end,
    newReservationStartBuffer,
    newReservationEndBuffer
  );

  const reservationInterval = {
    start: new Date(reservation.begin),
    end: new Date(reservation.end),
  };

  const newReservationInterval = reservation.isBlocked
    ? { start: newReservation.start, end: newReservation.end }
    : {
        start: bufferedNewReservation.start,
        end: bufferedNewReservation.end,
      };

  return areIntervalsOverlapping(reservationInterval, newReservationInterval);
}

export function doReservationsCollide(
  newReservation: { start: Date; end: Date },
  reservations: Pick<ReservationNode, "begin" | "end">[] = []
): boolean {
  const { start, end } = newReservation;
  return reservations.some((reservation) =>
    areIntervalsOverlapping(
      {
        start: new Date(reservation.begin),
        end: new Date(reservation.end),
      },
      { start, end }
    )
  );
}

export function areReservableTimesAvailable(
  reservableTimeSpans: ReservableTimeSpanType[],
  slotDate: Date,
  validateEnding = false
): boolean {
  return reservableTimeSpans?.some((rts) => {
    const { startDatetime, endDatetime } = rts;

    if (!startDatetime || !endDatetime) return false;

    const startDate = new Date(startDatetime);
    const endDate = new Date(endDatetime);

    if (validateEnding) {
      return startDate <= slotDate && endDate > slotDate;
    }
    return startDate <= slotDate;
  });
}

/// TODO this function is still a performance problem (looking at the flame graph)
/// The filtering helps, but the real solution would be to refactor the TimeSpan construction
/// to the Page load: do 7 / 30 days at a time, not all intervals (2 years)
export function isStartTimeWithinInterval(
  start: Date,
  reservableTimeSpans: ReservableTimeSpanType[],
  interval?: ReservationStartInterval
): boolean {
  if (reservableTimeSpans.length < 1) return false;
  if (!interval) return true;

  // TODO this is awfully similar to the one in QuickReservation
  // TODO could early break if the start is after the last interval
  // TODO this part should be refactored to either the Node backend or on Page load
  // split the intervals into days so we can just do a hash table search
  type TimeFrame = { start: Date; end: Date };
  const timeframeArr = reservableTimeSpans
    .map((n) =>
      n.startDatetime != null && n.endDatetime != null
        ? { start: new Date(n.startDatetime), end: new Date(n.endDatetime) }
        : null
    )
    .filter((n): n is NonNullable<typeof n> => n != null)
    .filter((n) => {
      if (n.start > start) return false;
      return n.end >= start;
    })
    .filter((n) => {
      const begin = isSameDay(n.start, start)
        ? n.start
        : set(start, { hours: 0, minutes: 0 });
      const end = isSameDay(n.end, start)
        ? new Date(n.end)
        : set(start, { hours: 23, minutes: 59 });
      return isWithinInterval(start, { start: begin, end });
    });

  const timeframe = timeframeArr.reduce<TimeFrame | null>((acc, curr) => {
    const begin = isSameDay(new Date(curr.start), start)
      ? new Date(curr.start)
      : set(start, { hours: 0, minutes: 0 });
    const end = isSameDay(new Date(curr.end), start)
      ? new Date(curr.end)
      : set(start, { hours: 23, minutes: 59 });
    return {
      start: acc?.start && acc.start < begin ? acc.start : begin,
      end: acc?.end && acc.end > end ? acc.end : end,
    };
  }, null);

  if (timeframe?.start == null || timeframe.end == null) {
    return false;
  }

  const startHMS = `${toUIDate(start, "HH:mm")}:00`;
  return getDayIntervals(
    format(timeframe.start, "HH:mm"),
    format(timeframe.end, "HH:mm"),
    interval
  ).includes(startHMS);
}

export function isReservationStartInFuture(
  reservationUnit: Pick<
    ReservationUnitNode,
    "reservationBegins" | "reservationsMaxDaysBefore"
  >,
  now = new Date()
): boolean {
  const { reservationBegins, reservationsMaxDaysBefore } = reservationUnit;
  const bufferDays = reservationsMaxDaysBefore ?? 0;
  const negativeBuffer = Math.abs(bufferDays) * -1;

  return (
    !!reservationBegins &&
    now < addDays(new Date(reservationBegins), negativeBuffer)
  );
}

export function getNewReservation({
  start,
  end,
  reservationUnit,
}: {
  reservationUnit: Pick<
    ReservationUnitNode,
    "minReservationDuration" | "reservationStartInterval"
  >;
  start: Date;
  end: Date;
}): PendingReservation {
  const { minReservationDuration, reservationStartInterval } = reservationUnit;

  const { end: minEnd } = getMinReservation({
    begin: start,
    minReservationDuration: minReservationDuration || 0,
    reservationStartInterval,
  });

  let normalizedEnd =
    getValidEndingTime({
      start,
      end: roundToNearestMinutes(end),
      reservationStartInterval,
    }) ?? roundToNearestMinutes(end);

  if (normalizedEnd < minEnd) {
    normalizedEnd = minEnd;
  }

  return {
    begin: start.toISOString(),
    end: normalizedEnd.toISOString(),
  };
}

function getMinReservation({
  begin,
  reservationStartInterval,
  minReservationDuration = 0,
}: {
  begin: Date;
  reservationStartInterval: ReservationStartInterval;
  minReservationDuration?: number;
}): { begin: Date; end: Date } {
  const minDurationMinutes = minReservationDuration / 60;
  const intervalMinutes = getIntervalMinutes(reservationStartInterval);

  const minutes =
    minDurationMinutes < intervalMinutes ? intervalMinutes : minDurationMinutes;
  return { begin, end: addMinutes(begin, minutes) };
}

function getValidEndingTime({
  start,
  end,
  reservationStartInterval,
}: {
  start: Date;
  end: Date;
  reservationStartInterval: ReservationStartInterval;
}): Date | null {
  if (!start || !end || !reservationStartInterval) return null;

  const intervalMinutes = getIntervalMinutes(reservationStartInterval);

  const durationMinutes = differenceInMinutes(end, start);
  const remainder = durationMinutes % intervalMinutes;

  if (remainder !== 0) {
    const wholeIntervals = Math.abs(
      Math.floor(durationMinutes / intervalMinutes)
    );

    return addMinutes(start, wholeIntervals * intervalMinutes);
  }

  return end;
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

function getIntervalMinutes(
  reservationStartInterval: ReservationStartInterval
): number {
  switch (reservationStartInterval) {
    case "INTERVAL_15_MINS":
      return 15;
    case "INTERVAL_30_MINS":
      return 30;
    case "INTERVAL_60_MINS":
      return 60;
    case "INTERVAL_90_MINS":
      return 90;
    case "INTERVAL_120_MINS":
      return 120;
    case "INTERVAL_180_MINS":
      return 180;
    case "INTERVAL_240_MINS":
      return 240;
    case "INTERVAL_300_MINS":
      return 300;
    case "INTERVAL_360_MINS":
      return 360;
    case "INTERVAL_420_MINS":
      return 420;
    default:
      throw new Error("Invalid reservation start interval");
  }
}

function getBufferedEventTimes(
  start: Date,
  end: Date,
  bufferTimeBefore?: number,
  bufferTimeAfter?: number
): { start: Date; end: Date } {
  const before = addSeconds(start, -1 * (bufferTimeBefore ?? 0));
  const after = addSeconds(end, bufferTimeAfter ?? 0);
  return { start: before, end: after };
}
