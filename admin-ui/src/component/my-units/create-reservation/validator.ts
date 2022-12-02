import coreJoi from "joi";
import joiDate from "@joi/date";
import { startOfDay } from "date-fns";
import i18n from "../../../i18n";
import { ReservationType } from "./types";

const joi = coreJoi.extend(joiDate) as typeof coreJoi;

export const reservationSchema = joi
  .object({
    type: joi
      .string()
      .required()
      .valid(
        ...Object.values(ReservationType).filter((v) => typeof v === "string")
      )
      .required()
      .messages({
        "any.required": i18n.t("ReservationDialog.validation.typeRequired"),
      }),
    date: joi
      .date()
      .format("D.M.yyyy")
      .required()
      .min(startOfDay(new Date()))
      .messages({
        "date.min": i18n.t("ReservationDialog.validation.noPastDate"),
      }),
    startTime: joi
      .date()
      .format("HH:mm")
      .required()
      .min(new Date())
      .messages({
        "date.min": i18n.t("ReservationDialog.validation.noPastDate"),
      }),
    endTime: joi
      .date()
      .required()
      .format("HH:mm")
      .required()
      .greater(joi.ref("startTime"))
      .messages({
        "date.greater": i18n.t("ReservationDialog.validation.endAfterBegin"),
      }),
    workingMemo: joi.string().allow(""),
  })
  .options({
    messages: {
      "date.format": i18n.t("validation.any.required"),
    },
  });
