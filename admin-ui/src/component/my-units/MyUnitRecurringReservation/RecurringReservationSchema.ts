import { z } from "zod";
import { ReservationUnitsReservationUnitReservationStartIntervalChoices } from "common/types/gql-types";
import {
  ReservationTypeSchema,
  checkDate,
  checkReservationInterval,
  checkStartEndTime,
  checkTimeStringFormat,
} from "../create-reservation/validator";
import { intervalToNumber } from "../create-reservation/utils";

// TODO handle metadata (variable form fields) instead of using .passthrough
// It should be it's own schema object that is included in both forms
// and it should be constructed based on the backend data.

// NOTE schema refinement is quirky since zod objects can't be merged after it
// always use the exact refined scheme for validation and displaying errors to the user
// the merged schemes are for type inferance.

// NOTE zod doesn't run refinements if part of the required data is missing
// i.e. the core zod schema is run first if it passes then refinements are run
// solutions to that are either use partial schemas or split schemas and check the parts.
const Option = z.object({
  label: z.string(),
  value: z.string(),
});

const timeSelectionSchemaBase = z.object({
  startingDate: z.coerce.date(),
  endingDate: z.coerce.date(),
  startTime: z.string(),
  endTime: z.string(),
  repeatOnDays: z.array(z.number()).min(1).max(7),
  repeatPattern: z.object({
    label: z.string(),
    value: z.literal("weekly").or(z.literal("biweekly")),
  }),
});

export const RecurringReservationFormSchema = z
  .object({
    reservationUnit: Option,
    type: ReservationTypeSchema,
    seriesName: z.string().optional(),
    comments: z.string().max(500).optional(),
    bufferTimeBefore: z.boolean().optional(),
    bufferTimeAfter: z.boolean().optional(),
  })
  .merge(timeSelectionSchemaBase)
  // need passthrough otherwise zod will strip the metafields
  .passthrough()
  // this refine works in this case since it's the last required value (unlike datetimes)
  .refine(
    (s) =>
      s.type === "BLOCKED" ||
      (s.seriesName !== undefined && s.seriesName.length > 0),
    {
      path: ["seriesName"],
      message: "Required",
    }
  );

// TODO use Partials instead (so we can migrate check logic to form validation)

// TODO more complex approach using superRefine (like in validator.ts) allows us to split this into different functions
// and reuse some of that code.
export const timeSelectionSchema = (
  interval: ReservationUnitsReservationUnitReservationStartIntervalChoices
) =>
  timeSelectionSchemaBase
    .superRefine((val, ctx) => checkDate(val.startingDate, ctx, "startingDate"))
    .superRefine((val, ctx) => checkDate(val.endingDate, ctx, "endingDate"))
    .refine(
      (s) =>
        s.startingDate &&
        s.endingDate &&
        s.startingDate.getTime() < s.endingDate.getTime(),
      {
        path: ["endingDate"],
        message: "Start date can't be after end date.",
      }
    )
    .superRefine((val, ctx) =>
      checkTimeStringFormat(val.startTime, ctx, "startTime")
    )
    .superRefine((val, ctx) =>
      checkTimeStringFormat(val.endTime, ctx, "endTime")
    )
    .superRefine((val, ctx) => checkStartEndTime(val, ctx))
    .superRefine((val, ctx) =>
      checkReservationInterval(
        val.startTime,
        ctx,
        "startTime",
        intervalToNumber(interval)
      )
    )
    .superRefine((val, ctx) =>
      checkReservationInterval(val.endTime, ctx, "endTime", 15)
    );

export type TimeSelectorType = z.infer<typeof timeSelectionSchemaBase>;

export type RecurringReservationForm = z.infer<
  typeof RecurringReservationFormSchema
>;
