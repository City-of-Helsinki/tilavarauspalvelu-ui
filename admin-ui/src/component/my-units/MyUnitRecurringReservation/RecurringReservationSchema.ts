import { z } from "zod";

const tenYearsInMs = 10 * 365 * 24 * 60 * 60 * 1000;

// TODO handle metadata (variable form fields) instead of using .passthrough
// It should be it's own schema object that is included in both forms
// and it should be constructed based on the backend data.

// NOTE this is wonky since to get the error in hook-form you have to do
// variable?.value?.message instead of just variable?.message like with primitives
// the optionals are mandatory and will silently fail on invalid code.
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

const RecurringReservationFormSchema = z
  .object({
    reservationUnit: Option,
    typeOfReservation: z.string(),
    seriesName: z.string(),
    comments: z.string().max(500).optional(),
    bufferTimeBefore: z.boolean(),
    bufferTimeAfter: z.boolean(),
  })
  .merge(timeSelectionSchemaBase)
  // TODO is passthrough necessary?
  .passthrough();

export const timeSelectionSchema = timeSelectionSchemaBase
  // TODO should we add startDate >= today? or near at least
  .refine((s) => s.startingDate < s.endingDate, {
    message: "start date can't be after end date",
  })
  // Need to have a year limit otherwise a single backspace can crash the application (due to computing).
  // 1.1.2023 -> press backspace => 1.1.203 calculates the interval of 1820 years.
  // distance(startDate, endDate) < 10 years
  .refine(
    (s) =>
      Math.abs(s.endingDate.getTime() - s.startingDate.getTime()) <
      tenYearsInMs,
    {
      message: "start and end time needs to be within a decade",
    }
  )
  // start time < end time (weird time format)
  .refine(
    (s) =>
      Number(s.startingTime.value.replace(":", ".")) <
      Number(s.endingTime.value.replace(":", ".")),
    { message: "start time can't be after end time" }
  );

// TODO dupe the refinement code for RecurringReservationFormScehema
// limitation of zod that you can't merge the two
// if we don't dupe them the user is not shown the errors because they aren't form erorrs

type RecurringReservationForm = z.infer<typeof RecurringReservationFormSchema>;

export { RecurringReservationFormSchema };
export type { RecurringReservationForm };
