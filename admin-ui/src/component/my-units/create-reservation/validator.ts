import { z } from "zod";
import { subDays } from "date-fns";
import { ReservationUnitsReservationUnitReservationStartIntervalChoices } from "common/types/gql-types";
import { intervalToNumber } from "./utils";

const THREE_YEARS_MS = 3 * 365 * 24 * 60 * 60 * 1000;
const TIME_PATTERN = /^[0-9+]{2}:[0-9+]{2}$/;

export const ReservationTypes = ["STAFF", "NORMAL", "BLOCKED"] as const;
export const ReservationTypeSchema = z.enum(ReservationTypes);

export type ReservationType = z.infer<typeof ReservationTypeSchema>;

const ReservationFormSchema = z
  .object({
    date: z.date(),
    startTime: z.string(),
    endTime: z.string(),
    comments: z.string().optional(),
    type: ReservationTypeSchema,
    bufferTimeAfter: z.boolean().optional(),
    bufferTimeBefore: z.boolean().optional(),
  })
  // passthrough since this is combined to the metafields
  .passthrough();

// partial because of how Zod works
// refinements are only ran if the required fields are set
// this shows refinement errors before required of course we need to either do a second
// pass or add custom Required refinements
const ReservationFormSchemaPartial = ReservationFormSchema.partial();

// TODO use these with RecurringReservation validators
const checkDate = (
  data: z.infer<typeof ReservationFormSchemaPartial>,
  ctx: z.RefinementCtx,
  path: string
) => {
  if (!data.date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [path],
      message: "Date can't be null",
    });
  } else if (data.date < subDays(new Date(), 1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [path],
      message: "Date can't be in the past",
    });
  } else if (
    Math.abs(new Date().getTime() - data.date.getTime()) > THREE_YEARS_MS
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [path],
      message: "Date needs to be within three years.",
    });
  }
};

const checkTimeString = (
  data: string | undefined,
  ctx: z.RefinementCtx,
  path: string
) => {
  if (!data) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [path],
      message: `${path} can't be empty.`,
    });
  } else if (!data.match(TIME_PATTERN)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [path],
      message: `${data} is not in time format.`,
    });
  } else if (Number(data.replace(":", ".")) > 23) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [path],
      message: `${path} can't be more than 24 hours.`,
    });
  }
};

const checkTimes = (
  data: z.infer<typeof ReservationFormSchemaPartial>,
  ctx: z.RefinementCtx
) => {
  if (
    data.startTime &&
    data.endTime &&
    Number(data.startTime.replace(":", ".")) >
      Number(data.endTime.replace(":", "."))
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endTime"],
      message: "End time needs to be after start time.",
    });
  }
};

const checkInterval = (
  time: string | undefined,
  ctx: z.RefinementCtx,
  path: string,
  interval: number
) => {
  if (time && Number(time.substring(3)) % interval !== 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [path],
      message: `${path} has to be in ${interval} minutes increments.`,
    });
  }
};

const ReservationFormSchemaRefined = (
  interval: ReservationUnitsReservationUnitReservationStartIntervalChoices
) =>
  ReservationFormSchema.partial()
    .superRefine((val, ctx) => checkDate(val, ctx, "date"))
    .superRefine((val, ctx) => checkTimeString(val.startTime, ctx, "startTime"))
    .superRefine((val, ctx) => checkTimeString(val.endTime, ctx, "endTime"))
    .superRefine((val, ctx) => checkTimes(val, ctx))
    .superRefine((val, ctx) =>
      checkInterval(val.startTime, ctx, "startTime", intervalToNumber(interval))
    )
    .superRefine((val, ctx) => checkInterval(val.endTime, ctx, "endTime", 15))
    .refine((s) => s.type, {
      path: ["type"],
      message: "Required",
    });

export { ReservationFormSchemaRefined as ReservationFormSchema };

export type ReservationFormType = z.infer<typeof ReservationFormSchema>;
