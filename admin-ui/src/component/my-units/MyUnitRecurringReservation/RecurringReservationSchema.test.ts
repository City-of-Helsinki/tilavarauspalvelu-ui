// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from "@jest/globals";
import { addDays } from "date-fns";

import { timeSelectionSchema } from "./RecurringReservationSchema";

const tomorrow = addDays(new Date(), 1);
const reservation = {
  type: "BLOCKED",
  reservationUnit: {
    label: "unit",
    value: "1",
  },
  startingDate: tomorrow,
  endingDate: addDays(tomorrow, 6),
  repeatOnDays: [1],
  repeatPattern: {
    label: "weekly",
    value: "weekly",
  },
  startingTime: "09:00",
  endingTime: "10:15",
  seriesName: "name",
};

// Tests timeSelectionSchema instead of the form schema because of refinements

// TODO need to make more complex
// so the basic form validation test is first week (today -> week)
// with start time / end time
// with reservation unit
// no metadata
// type? BLOCKED or STAFF
test(`one week blocked reservation on a single day is valid`, () => {
  const res = timeSelectionSchema.safeParse(reservation);

  expect(res.success).toBeTruthy();
});

test("over 24h time should fail", () => {
  const res = timeSelectionSchema.safeParse({
    ...reservation,
    startingTime: "32:00",
    endingTime: "33:15",
  });

  expect(res.success).toBeFalsy();
});

test(`invalid time string should fail`, () => {
  const res = timeSelectionSchema.safeParse({
    ...reservation,
    startingTime: "fo:ba",
  });

  expect(res.success).toBeFalsy();
});

test(`time start after time end should fail`, () => {
  const res = timeSelectionSchema.safeParse({
    ...reservation,
    startingTime: "10:30",
    endingTime: "10:00",
  });

  expect(res.success).toBeFalsy();
});

test.todo(`STAFF reservation should be a success`);

test.todo(`start date cannot be in the past`);
test.todo(`end date cannot be after start date`);
test.todo(`start time can't be after end time`);
test.todo("RecurringReservationFormSchema checks for empty fields");
test.todo("RecurringReservationFormSchema passthrough unkown fields");
// TODO should check the error types from failures also but need to think through those cases
// for example missing type should still give a refinement error for dates
