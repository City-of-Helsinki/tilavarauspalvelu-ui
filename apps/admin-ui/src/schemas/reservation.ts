import { z } from "zod";
import { fromUIDate } from "common/src/common/util";
import { ReservationUnitsReservationUnitReservationStartIntervalChoices } from "common/types/gql-types";
import { intervalToNumber } from "./utils";
import { checkTimeStringFormat, checkValidFutureDate } from "./schemaCommon";
import { constructApiDate } from "@/helpers";

export const ReservationTypes = [
  "STAFF",
  "BEHALF",
  "BLOCKED",
  "NORMAL",
] as const;
export const ReservationTypeSchema = z.enum(ReservationTypes);

export type ReservationType = z.infer<typeof ReservationTypeSchema>;

export const TimeFormSchema = z.object({
  // NOTE date needs to be string that is not coerced because it uses FI format
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  bufferTimeAfter: z.boolean(),
  bufferTimeBefore: z.boolean(),
});

const ReservationFormSchema = z
  .object({
    comments: z.string().optional(),
    type: ReservationTypeSchema,
  })
  .merge(TimeFormSchema)
  // passthrough since this is combined to the metafields
  .passthrough();

// partial because of how Zod works
// refinements are only ran if the required fields are set
// this shows refinement errors before required of course we need to either do a second
// pass or add custom Required refinements
const ReservationFormSchemaPartial = ReservationFormSchema.partial();

export const checkStartEndTime = (
  data: Pick<
    z.infer<typeof ReservationFormSchemaPartial>,
    "startTime" | "endTime"
  >,
  ctx: z.RefinementCtx
) => {
  if (
    data.startTime &&
    data.endTime &&
    Number(data.startTime.replace(":", ".")) >=
      Number(data.endTime.replace(":", "."))
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endTime"],
      message: "End time needs to be after start time.",
    });
  }
};

export const checkReservationInterval = (
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
    .superRefine((val, ctx) => {
      if (val.date) {
        checkValidFutureDate(fromUIDate(val.date), ctx, "date");
      }
    })
    .superRefine((val, ctx) =>
      checkTimeStringFormat(val.startTime, ctx, "startTime")
    )
    .superRefine((val, ctx) =>
      checkTimeStringFormat(val.endTime, ctx, "endTime")
    )
    .superRefine((val, ctx) => checkStartEndTime(val, ctx))
    .superRefine((val, ctx) => {
      if (val.startTime && val.date) {
        const d = constructApiDate(val.date, val.startTime);
        if (d != null && new Date(d) < new Date()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "startTime must be before now",
            path: ["startTime"],
          });
        }
      }
    })
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
    )
    .refine((s) => s.type, {
      path: ["type"],
      message: "Required",
    });

// NOTE duplicated schema because schemas need to be refined after merge (only times in this case)
export const TimeChangeFormSchemaRefined = (
  interval: ReservationUnitsReservationUnitReservationStartIntervalChoices
) =>
  TimeFormSchema.partial()
    .superRefine((val, ctx) => {
      if (val.date) {
        checkValidFutureDate(fromUIDate(val.date), ctx, "date");
      }
    })
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

export { ReservationFormSchemaRefined as ReservationFormSchema };

export type ReservationFormType = z.infer<typeof ReservationFormSchema>;

export const ReservationChangeFormSchema = z
  .object({
    type: ReservationTypeSchema,
    seriesName: z.string().optional(),
    comments: z.string().optional(),
    showBillingAddress: z.boolean().optional(),
  })
  // passthrough since this is combined to the metafields
  .passthrough();

export type ReservationChangeFormType = z.infer<
  typeof ReservationChangeFormSchema
>;
