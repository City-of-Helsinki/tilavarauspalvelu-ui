import { z } from "zod";
import { subDays } from "date-fns";

const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;

// TODO handle metadata (variable form fields) instead of using .passthrough
// It should be it's own schema object that is included in both forms
// and it should be constructed based on the backend data.

// TODO schema refinement maps into the later variable (path)
// so form errors are only displayed when the latter variable has been changed e.g.
// change startTime to be after endTime doesn't cause an error, but
// changing endTime displayes the error.
// Can't be fixed by adding multiple paths (this hides the error completely).

const Option = z.object({
  label: z.string(),
  value: z.string(),
});

const timeSelectionSchemaBase = z.object({
  startingDate: z.coerce.date(),
  endingDate: z.coerce.date(),
  startingTime: Option,
  endingTime: Option,
  repeatOnDays: z.array(z.number()).min(1).max(7),
  repeatPattern: z.object({
    label: z.string(),
    value: z.literal("weekly").or(z.literal("biweekly")),
  }),
});

const RecurringReservationFormBaseSchema = z
  .object({
    reservationUnit: Option,
    type: z.string(),
    seriesName: z.string(),
    comments: z.string().max(500).optional(),
    bufferTimeBefore: z.boolean(),
    bufferTimeAfter: z.boolean(),
  })
  .merge(timeSelectionSchemaBase)
  // TODO is passthrough necessary?
  .passthrough();

export const timeSelectionSchema = timeSelectionSchemaBase
  .refine((s) => s.startingDate > subDays(new Date(), 1), {
    path: ["startingDate"],
    message: "Start date can't be in the past",
  })
  .refine((s) => s.startingDate < s.endingDate, {
    path: ["endingDate"],
    message: "Start date can't be after end date.",
  })
  // Need to have a year limit otherwise a single backspace can crash the application (due to computing).
  // 1.1.2023 -> press backspace => 1.1.203 calculates the interval of 1820 years.
  // Similarly mis typing 20234 as a year results in 18200 year interval.
  .refine(
    (s) =>
      Math.abs(s.endingDate.getTime() - s.startingDate.getTime()) <
      TEN_YEARS_MS,
    {
      path: ["endingDate"],
      message: "Start and end time needs to be within a decade.",
    }
  )
  // start time < end time (weird time format)
  .refine(
    (s) =>
      Number(s.startingTime.value.replace(":", ".")) <
      Number(s.endingTime.value.replace(":", ".")),
    {
      path: ["endingTime"],
      message: "Start time can't be after end time.",
    }
  );

// NOTE dupe of timeSelection refinement
// limitation of zod: you can't merge refinements (breaks type inferance)
export const RecurringReservationFormSchema =
  RecurringReservationFormBaseSchema.refine(
    (s) => s.startingDate > subDays(new Date(), 1),
    {
      path: ["startingDate"],
      message: "Start date can't be in the past",
    }
  )
    .refine((s) => s.startingDate < s.endingDate, {
      path: ["endingDate"],
      message: "Start date can't be after end date.",
    })
    .refine(
      (s) =>
        Math.abs(s.endingDate.getTime() - s.startingDate.getTime()) <
        TEN_YEARS_MS,
      {
        path: ["endingDate"],
        message: "Start and end time needs to be within a decade.",
      }
    )
    .refine(
      (s) =>
        Number(s.startingTime.value.replace(":", ".")) <
        Number(s.endingTime.value.replace(":", ".")),
      {
        path: ["endingTime"],
        message: "End time needs to be after start.",
      }
    );

export type RecurringReservationForm = z.infer<
  typeof RecurringReservationFormBaseSchema
>;
