import { z } from "zod";
import { subDays } from "date-fns";
import { ReservationUnitsReservationUnitReservationStartIntervalChoices } from "common/types/gql-types";
import { intervalToNumber } from "./utils";

const THREE_YEARS_MS = 3 * 365 * 24 * 60 * 60 * 1000;
const TIME_PATTERN = /^[0-9+]{2}:[0-9+]{2}$/;

export const ReservationTypeSchema = z.enum(["STAFF", "NORMAL", "BLOCKED"]);

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

// TODO dupe code with ReservationsList (refinements) with slight changes to naming of things / translations
const ReservationFormSchemaRefined = (
  interval: ReservationUnitsReservationUnitReservationStartIntervalChoices
) =>
  ReservationFormSchema.refine((s) => s.date > subDays(new Date(), 1), {
    path: ["date"],
    message: "Date can't be in the past",
  })
    .refine(
      (s) => Math.abs(new Date().getTime() - s.date.getTime()) < THREE_YEARS_MS,
      {
        path: ["date"],
        message: "Date needs to be within three years.",
      }
    )
    .refine((s) => s.startTime.match(TIME_PATTERN), {
      path: ["startTime"],
      message: "Start time is not in time format.",
    })
    .refine((s) => s.endTime.match(TIME_PATTERN), {
      path: ["endTime"],
      message: "End time is not in time format.",
    })
    .refine((s) => Number(s.startTime.replace(":", ".")) < 24, {
      path: ["startTime"],
      message: "Start time can't be more than 24 hours.",
    })
    .refine((s) => Number(s.endTime.replace(":", ".")) < 24, {
      path: ["endTime"],
      message: "End time can't be more than 24 hours.",
    })
    .refine(
      (s) =>
        Number(s.startTime.replace(":", ".")) <
        Number(s.endTime.replace(":", ".")),
      {
        path: ["endTime"],
        message: "End time needs to be after start time.",
      }
    )
    .refine(
      (s) =>
        Number(s.startTime.substring(3)) % intervalToNumber(interval) === 0,
      {
        path: ["startTime"],
        message: `Starting time has to be in ${intervalToNumber(
          interval
        )} minutes increments.`,
      }
    )
    .refine((s) => Number(s.endTime.substring(3)) % 15 === 0, {
      path: ["endTime"],
      message: "End time has to be increment of 15 minutes.",
    });
export { ReservationFormSchemaRefined as ReservationFormSchema };

export type ReservationFormType = z.infer<typeof ReservationFormSchema>;
