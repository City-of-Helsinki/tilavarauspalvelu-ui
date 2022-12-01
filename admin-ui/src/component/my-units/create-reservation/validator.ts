import coreJoi from "joi";
import joiDate from "@joi/date";
import { startOfDay } from "date-fns";

const joi = coreJoi.extend(joiDate) as typeof coreJoi;

export enum ReservationType {
  "STAFF",
  "NORMAL",
  "BLOCKED",
}

export const reservationSchema = joi.object({
  type: joi
    .string()
    .required()
    .valid(
      ...Object.values(ReservationType).filter((v) => typeof v === "string")
    )
    .required(),
  date: joi.date().format("D.M.yyyy").required().min(startOfDay(new Date())),
  startTime: joi.date().format("HH:mm").required().min(new Date()),
  endTime: joi.date().format("HH:mm").required().greater(joi.ref("startTime")),
  workingMemo: joi.string().allow(""),
});
