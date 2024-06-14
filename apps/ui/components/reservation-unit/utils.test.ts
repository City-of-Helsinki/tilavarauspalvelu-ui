import { addDays } from "date-fns";
import { getLastPossibleReservationDate, getNextAvailableTime } from "./utils";
import {
  ReservationKind,
  ReservationStartInterval,
} from "common/gql/gql-types";
import { ReservationUnitPageQuery } from "@/gql/gql-types";

describe("getLastPossibleReservationDate", () => {
  test("returns null if no reservationUnit is given", () => {
    expect(getLastPossibleReservationDate()).toBeNull();
  });
  test("returns null if no reservableTimeSpans are given in the reservationUnit", () => {
    const input = {
      reservationsMaxDaysBefore: 1,
      // reservableTimeSpans: null,
      reservationEnds: addDays(new Date(), 10).toISOString(),
    };
    expect(getLastPossibleReservationDate(input)).toBeNull();
  });
  test("if 'reservationsMaxDaysBefore' is set to 1 returns tomorrow", () => {
    // TODO mock system clock so this doesn't flake
    const input = {
      reservationsMaxDaysBefore: 1,
      reservableTimeSpans: [
        {
          startDatetime: addDays(new Date(), -10).toISOString(),
          endDatetime: addDays(new Date(), 10).toISOString(),
        },
      ],
      reservationEnds: addDays(new Date(), 10).toISOString(),
    };
    const expected = addDays(new Date(), 1);
    expect(getLastPossibleReservationDate(input)).toEqual(expected);
  });
  test("if 'reservationEnds' is set for tomorrow returns tomorrow", () => {
    const input = {
      reservationsMaxDaysBefore: 1,
      reservableTimeSpans: [
        {
          startDatetime: addDays(new Date(), -10).toISOString(),
          endDatetime: addDays(new Date(), 10).toISOString(),
        },
      ],
      reservationEnds: addDays(new Date(), 1).toISOString(),
    };
    const expected = addDays(new Date(), 1);
    expect(getLastPossibleReservationDate(input)).toEqual(expected);
  });
  test("if 'reservableTimeSpans' contains a range that ends tomorrow returns tomorrow", () => {
    const input = {
      reservationsMaxDaysBefore: null,
      reservableTimeSpans: [
        {
          startDatetime: addDays(new Date(), -10).toISOString(),
          endDatetime: addDays(new Date(), 1).toISOString(),
        },
      ],
      reservationEnds: null,
    };
    const expected = addDays(new Date(), 1);
    expect(getLastPossibleReservationDate(input)).toEqual(expected);
  });
  test("returns the minimum of the above", () => {
    const input = {
      reservationsMaxDaysBefore: 5,
      reservableTimeSpans: [
        {
          startDatetime: addDays(new Date(), -10).toISOString(),
          endDatetime: addDays(new Date(), 10).toISOString(),
        },
      ],
      reservationEnds: addDays(new Date(), 3).toISOString(),
    };
    const expected = addDays(new Date(), 3);
    expect(getLastPossibleReservationDate(input)).toEqual(expected);
  });
});

const reservationUnit: ReservationUnitPageQuery["reservationUnit"] = {
  id: "123",
  pk: 123,
  isDraft: false,
  reservationKind: ReservationKind.Direct,
  bufferTimeBefore: 0,
  bufferTimeAfter: 0,
  requireReservationHandling: false,
  canApplyFreeOfCharge: false,
  reservationStartInterval: ReservationStartInterval.Interval_30Mins,
  uuid: "123",
  images: [],
  applicationRoundTimeSlots: [],
  equipments: [],
  pricings: [],
};

// Rules for writing tests:
// 1. default data for happy path, progressively modify it for other cases
// 2. only modify one thing at a time
// 3. never cast inputs for any reason
// These avoid errors (false positives) due to incorrect mocks.
// More important when testing error cases.
// Alternative would be to refactor and reduce inputs to the function.
// e.g. this is not necessary for a function that takes 2 - 3 parameters.
describe("getNextAvailableTime", () => {
  test("finds the next available time for today", () => {
    const reservableTimes = new Map();
    const input = {
      start: new Date(),
      duration: 60,
      reservationUnit: {
        ...reservationUnit,
      },
      reservableTimes,
      activeApplicationRounds: [],
    };
    const val = getNextAvailableTime(input);
    expect(val).toBeInstanceOf(Date);
  });
  // there is earlier times available but they are too short
  test.todo("finds the correct length time today");
  // today is reservable, has available times but they are too short
  test.todo("finds the correct length time tomorrow");
  test.todo("finds no available times if the duration is too long");
  // if minReservableDays before is 7
  describe("reservationsMinDaysBefore check", () => {
    test.todo("finds the next available time a week from now");
    test.todo(
      "NO times if times are only available after reservationsMinDaysBefore"
    );
  });
  describe("reservationsMaxDaysBefore check", () => {
    // FIXME use the end date to iterate till we find a day
    test.todo(
      "NO times if times are only available after reservationsMaxDaysBefore"
    );
  });
});
