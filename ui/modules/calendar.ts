import {
  addDays,
  areIntervalsOverlapping,
  differenceInMinutes,
  getISODay,
  isBefore,
} from "date-fns";
import { TFunction } from "next-i18next";
import { SlotProps } from "../components/calendar/Calendar";
import {
  ApplicationEvent,
  OpeningHour,
  OptionType,
  Reservation,
} from "./types";
import {
  apiDurationToMinutes,
  endOfWeek,
  parseDate,
  startOfWeek,
} from "./util";

export const longDate = (date: Date, t: TFunction): string =>
  t("common:dateLong", {
    date,
  });

export const getWeekOption = (date: Date, t: TFunction): OptionType => {
  const begin = startOfWeek(date);
  const end = endOfWeek(date);
  const monthName = t(`common:month.${begin.getMonth()}`);
  return {
    label: `${monthName} ${longDate(begin, t)} - ${longDate(end, t)} `,
    value: begin.getTime(),
  };
};

export const getWeekOptions = (
  t: TFunction,
  applicationEvent: ApplicationEvent
): OptionType[] => {
  const { begin, end } = applicationEvent;
  const beginDate = parseDate(begin as string);
  const endDate = parseDate(end as string);
  const endSunday = addDays(endDate, getISODay(endDate));
  let date = beginDate;
  const options = [] as OptionType[];
  while (isBefore(date, endSunday)) {
    options.push(getWeekOption(date, t));
    date = addDays(date, 7);
  }
  return options;
};

export const displayDate = (date: Date, t: TFunction): string => {
  const weekday = t(`common:weekDay.${date.getDay()}`);
  return `${weekday} ${longDate(date, t)}`;
};

export const isReservationShortEnough = (
  start: Date,
  end: Date,
  maxDuration: string
): boolean => {
  if (!maxDuration) return true;

  const reservationDuration = differenceInMinutes(
    new Date(end),
    new Date(start)
  );
  const maxMinutes = apiDurationToMinutes(maxDuration);
  return reservationDuration <= maxMinutes;
};

export const isReservationLongEnough = (
  start: Date,
  end: Date,
  minDuration: string
): boolean => {
  if (!minDuration) return true;

  const reservationDuration = differenceInMinutes(
    new Date(end),
    new Date(start)
  );
  const minMinutes = apiDurationToMinutes(minDuration);
  return reservationDuration >= minMinutes;
};

export const areSlotsReservable = (
  slots: Date[],
  openingHours: OpeningHour[]
): boolean => {
  return slots.every((slot) => {
    const slotDate = new Date(slot);
    return !!openingHours.some((oh) => {
      const startDate = oh.date;
      const startTime = new Date(`${startDate}T${oh.times.startTime}`);
      const endTime = new Date(`${startDate}T${oh.times.endTime}`);
      return (
        startTime.getDay() === slotDate.getDay() &&
        startTime.getHours() <= slotDate.getHours() &&
        endTime.getHours() >= slotDate.getHours()
      );
    });
  });
};

export const doReservationsCollide = (
  reservations: Reservation[],
  newReservation: { start: Date; end: Date }
): boolean => {
  return reservations.some((reservation) =>
    areIntervalsOverlapping(
      { start: new Date(reservation.begin), end: new Date(reservation.end) },
      newReservation
    )
  );
};

export const getSlotPropGetter =
  (openingHours: OpeningHour[]) =>
  (date: Date): SlotProps => {
    switch (areSlotsReservable([date], openingHours)) {
      case true:
        return {};
      default:
        return {
          className: "rbc-timeslot-inactive",
        };
    }
  };
