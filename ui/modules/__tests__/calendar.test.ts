import { addDays, format } from "date-fns";
import { TFunction } from "next-i18next";
import {
  areSlotsReservable,
  doReservationsCollide,
  getWeekOption,
  getWeekOptions,
  isReservationLongEnough,
  isReservationShortEnough,
  isSlotWithinTimeframe,
} from "../calendar";
import { ReservationType } from "../gql-types";
import { ApplicationEvent, ApplicationRound } from "../types";

jest.mock("next/config", () => () => ({
  serverRuntimeConfig: {},
  publicRuntimeConfig: {},
}));

type TranslationOptions = {
  date?: Date;
};

const translateWithDate = (str: string, options: TranslationOptions) =>
  `${str} ${options?.date ? format(options.date, "yyyy-MM-dd") : ""}`.trim();

test("getWeekOption", () => {
  expect(
    getWeekOption(new Date(2021, 10, 10), translateWithDate as TFunction)
  ).toEqual({
    label:
      "common:month.10 common:dateLong 2021-11-08 - common:dateLong 2021-11-14 ",
    value: 1636322400000,
  });
});

test("getWeekOptions", () => {
  expect(
    getWeekOptions(
      translateWithDate as TFunction,
      {
        begin: new Date(2021, 11, 10).toISOString(),
        end: new Date(2022, 0, 10).toISOString(),
      } as ApplicationEvent
    )
  ).toEqual([
    {
      label:
        "common:month.11 common:dateLong 2021-12-06 - common:dateLong 2021-12-12 ",
      value: 1638741600000,
    },
    {
      label:
        "common:month.11 common:dateLong 2021-12-13 - common:dateLong 2021-12-19 ",
      value: 1639346400000,
    },
    {
      label:
        "common:month.11 common:dateLong 2021-12-20 - common:dateLong 2021-12-26 ",
      value: 1639951200000,
    },
    {
      label:
        "common:month.11 common:dateLong 2021-12-27 - common:dateLong 2022-01-02 ",
      value: 1640556000000,
    },
    {
      label:
        "common:month.0 common:dateLong 2022-01-03 - common:dateLong 2022-01-09 ",
      value: 1641160800000,
    },
  ]);
});

test("isReservationShortEnough", () => {
  expect(
    isReservationShortEnough(
      new Date(2021, 11, 10, 12, 0, 0),
      new Date(2021, 11, 10, 12, 30, 0),
      "1:30:00"
    )
  ).toBe(true);
  expect(
    isReservationShortEnough(
      new Date(2021, 11, 10, 12, 0, 0),
      new Date(2021, 11, 10, 13, 30, 0),
      "1:30:00"
    )
  ).toBe(true);
  expect(
    isReservationShortEnough(
      new Date(2021, 11, 10, 12, 0, 0),
      new Date(2021, 11, 10, 13, 31, 0),
      "1:30:00"
    )
  ).toBe(false);
});

test("isReservationLongEnough", () => {
  expect(
    isReservationLongEnough(
      new Date(2021, 11, 10, 12, 0, 0),
      new Date(2021, 11, 10, 12, 30, 0),
      "1:30:00"
    )
  ).toBe(false);
  expect(
    isReservationLongEnough(
      new Date(2021, 11, 10, 12, 0, 0),
      new Date(2021, 11, 10, 13, 30, 0),
      "1:30:00"
    )
  ).toBe(true);
  expect(
    isReservationLongEnough(
      new Date(2021, 11, 10, 12, 0, 0),
      new Date(2021, 11, 10, 13, 31, 0),
      "1:30:00"
    )
  ).toBe(true);
});

test("isSlotWithinTimeframe", () => {
  expect(isSlotWithinTimeframe(new Date(2021, 9, 9))).toBe(false);
  expect(isSlotWithinTimeframe(new Date())).toBe(false);
  expect(isSlotWithinTimeframe(new Date(), -1)).toBe(true);
});

test("areSlotsReservable", () => {
  const openingTimes = [
    {
      date: format(addDays(new Date(), 7), "yyyy-MM-dd"),
      endTime: "21:00:00",
      perioids: null,
      startTime: "09:00:00",
      state: "open",
    },
    {
      date: format(addDays(new Date(), 8), "yyyy-MM-dd"),
      endTime: "21:00:00",
      perioids: null,
      startTime: "09:00:00",
      state: "open",
    },
  ];

  const activeApplicationRounds = [
    {
      reservationPeriodBegin: format(addDays(new Date(), 8), "yyyy-MM-dd"),
      reservationPeriodEnd: format(addDays(new Date(), 8), "yyyy-MM-dd"),
    },
  ] as ApplicationRound[];

  expect(areSlotsReservable([addDays(new Date(), 6)], openingTimes, [])).toBe(
    false
  );
  expect(
    areSlotsReservable([addDays(new Date().setHours(6), 7)], openingTimes, [])
  ).toBe(false);
  expect(
    areSlotsReservable([addDays(new Date().setHours(9), 7)], openingTimes, [])
  ).toBe(true);
  expect(
    areSlotsReservable([addDays(new Date().setHours(9), 8)], openingTimes, [])
  ).toBe(true);
  expect(
    areSlotsReservable(
      [addDays(new Date().setHours(9), 8)],
      openingTimes,
      activeApplicationRounds
    )
  ).toBe(false);
  expect(areSlotsReservable([addDays(new Date(), 10)], openingTimes, [])).toBe(
    false
  );
});

test("doReservationsCollide", () => {
  const reservations = [
    {
      begin: "2021-10-31T09:30:00+00:00",
      end: "2021-10-31T10:30:00+00:00",
    },
  ] as ReservationType[];

  expect(
    doReservationsCollide(reservations, {
      start: new Date("2021-10-31T09:00:00+00:00"),
      end: new Date("2021-10-31T09:30:00+00:00"),
    })
  ).toBe(false);
  expect(
    doReservationsCollide(reservations, {
      start: new Date("2021-10-31T09:00:00+00:00"),
      end: new Date("2021-10-31T09:31:00+00:00"),
    })
  ).toBe(true);
  expect(
    doReservationsCollide(reservations, {
      start: new Date("2021-10-31T10:30:00+00:00"),
      end: new Date("2021-10-31T11:30:00+00:00"),
    })
  ).toBe(false);
  expect(
    doReservationsCollide(reservations, {
      start: new Date("2021-10-31T10:30:00+00:00"),
      end: new Date("2021-10-31T11:30:00+00:00"),
    })
  ).toBe(false);
});
