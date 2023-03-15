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
  startingTime: z.string(),
  endingTime: z.string(),
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
    bufferTimeBefore: z.boolean().optional(),
    bufferTimeAfter: z.boolean().optional(),
  })
  .merge(timeSelectionSchemaBase)
  // need passthrough otherwise zod will strip the metafields
  .passthrough();

const TIME_PATTERN = /^[0-9+]{2}:[0-9+]{2}$/;

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
  .refine((s) => s.startingTime.match(TIME_PATTERN), {
    path: ["startingTime"],
    message: "Start time is not in time format.",
  })
  .refine((s) => s.endingTime.match(TIME_PATTERN), {
    path: ["endingTime"],
    message: "End time is not in time format.",
  })
  .refine((s) => Number(s.startingTime.replace(":", ".")) < 24, {
    path: ["startingTime"],
    message: "Start time can't be more than 24 hours.",
  })
  .refine((s) => Number(s.endingTime.replace(":", ".")) < 24, {
    path: ["endingTime"],
    message: "End time can't be more than 24 hours.",
  })
  // start time < end time (weird time format)
  .refine(
    (s) =>
      Number(s.startingTime.replace(":", ".")) <
      Number(s.endingTime.replace(":", ".")),
    {
      path: ["endingTime"],
      message: "Start time can't be after end time.",
    }
  );

// NOTE dupe of timeSelection refinement
// limitation of zod: you can't merge refinements (breaks type inferance)
// FIXME this code dupe is really bad
// can we refactor this so that we only use the refinement in the time portion
// and display those erros differently
// as in run the validation from a watch function instead of using form.state.errors
// Do a manual validation step and show the errors if the first part fails
// then show any remaining errors using the resolver? or forgo the resolver completely
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
    .refine((s) => s.startingTime.match(TIME_PATTERN), {
      path: ["startingTime"],
      message: "Start time is not in time format.",
    })
    .refine((s) => s.endingTime.match(TIME_PATTERN), {
      path: ["endingTime"],
      message: "End time is not in time format.",
    })
    .refine((s) => Number(s.startingTime.replace(":", ".")) < 24, {
      path: ["startingTime"],
      message: "Start time can't be more than 24 hours.",
    })
    .refine((s) => Number(s.endingTime.replace(":", ".")) < 24, {
      path: ["endingTime"],
      message: "End time can't be more than 24 hours.",
    })
    .refine(
      (s) =>
        Number(s.startingTime.replace(":", ".")) <
        Number(s.endingTime.replace(":", ".")),
      {
        path: ["endingTime"],
        message: "End time needs to be after start.",
      }
    );

export type RecurringReservationForm = z.infer<
  typeof RecurringReservationFormBaseSchema
>;
