import Joi from "joi";

export enum ReservationType {
  "STAFF",
  "NORMAL",
  "BLOCKED",
}

export const reservationSchema = Joi.object({
  reservationUnitPks: Joi.array().items(Joi.number()),
  type: Joi.string()
    .required()
    .valid(...Object.values(ReservationType))
    .required(),
  begin: Joi.date().required().greater(Date.now()),
  end: Joi.date()
    .required()
    .greater(
      Joi.ref("begin", {
        adjust: (begin) => new Date(begin),
      })
    ),
  workingMemo: Joi.string(),
});
