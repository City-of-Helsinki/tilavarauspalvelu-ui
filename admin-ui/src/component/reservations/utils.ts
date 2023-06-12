import { z } from "zod";
import { set } from "date-fns";
import { checkDate, checkTimeStringFormat } from "app/schemas";
import { ReservationUnitsReservationUnitReservationStartIntervalChoices } from "common/types/gql-types";

export const TimeFormSchema = z.object({
  // TODO this needs to be string and we have to use custom date checker because it's in FI format
  // string because it can be invalid date while user is typing
  date: z.date(),
  startTime: z.string(),
  length: z.string(),
});

// No refinement for length since the select doesn't allow invalid values
export const TimeChangeFormSchemaRefined = TimeFormSchema.partial()
  .superRefine((val, ctx) => checkDate(val.date, ctx, "date"))
  .superRefine((val, ctx) =>
    checkTimeStringFormat(val.startTime, ctx, "startTime")
  );

export const timeToDuration = (time: string) => {
  const dindex = time.indexOf(":");
  if (dindex > 0) {
    const hours = Number(time.substring(0, dindex) ?? "0");
    const minutes = Number(time.substring(dindex + 1) ?? "0");
    return { hours, minutes };
  }
  return undefined;
};

export const setTimeOnDate = (date: Date, time: string): Date => {
  const duration = timeToDuration(time);
  if (duration) {
    return set(date, duration);
  }
  return date;
};

export const intervalToMinutes = (
  interval: ReservationUnitsReservationUnitReservationStartIntervalChoices
): number => {
  switch (interval) {
    case ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_15Mins:
      return 15;
    case ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_30Mins:
      return 30;
    case ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_60Mins:
      return 60;
    case ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_90Mins:
      return 90;
    default:
      return 15;
  }
};

export type Duration = { hours: number; minutes: number };
export const durationDiff = (d1: Duration, d2: Duration): Duration => ({
  hours: d1.hours - d2.hours,
  minutes: d1.minutes - d2.minutes,
});

export const divideDuration = (dur: Duration, mins: number): number => {
  const total = dur.hours * 60 + dur.minutes;
  return total / mins;
};

export const addToDuration = (dur: Duration, mins: number): Duration => {
  const mtmp = dur.minutes + mins;
  if (mtmp < 60) {
    return { hours: dur.hours, minutes: mtmp };
  }
  return {
    minutes: mtmp % 60,
    hours: Math.floor(dur.hours + Math.floor(mtmp / 60)),
  };
};

const padWithZeros = (x: number) => `${x >= 0 && x < 10 ? "0" : ""}${x}`;
export const durationToTimeString = (d: Duration): string =>
  `${d.hours}:${padWithZeros(d.minutes)}`;
export const minutesToDuration = (mins: number): Duration => ({
  hours: Math.floor(mins / 60),
  minutes: mins % 60,
});

export const generateTimeIntervals = (
  intervalMins: number,
  min: Duration,
  max: Duration
): string[] => {
  const diff = durationDiff(max, min);
  if (
    diff.hours < 0 ||
    diff.minutes < 0 ||
    (diff.hours === 0 && diff.minutes === 0)
  ) {
    return [];
  }

  const count = divideDuration(diff, intervalMins);
  return count > 0
    ? Array.from(Array(count + 1).keys())
        // TODO conversion
        .map((x) => addToDuration(min, x * intervalMins))
        .map((x) => durationToTimeString(x))
    : [];
};
