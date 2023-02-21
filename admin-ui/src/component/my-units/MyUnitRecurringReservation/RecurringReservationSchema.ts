import Joi from "joi";

// TODO handle metadata (variable form fields) instead of using .unkown(true)
// It should be it's own schema object that is included in both forms
// and it should be constructed based on the backend data.

// NOTE this is really wonky since to get the error you have to do
// variable.value.message instead of just variable.message like with primitives
const Option = Joi.object({
  label: Joi.string().required(),
  value: Joi.string().required(),
});

// const RecurringReservationRepeatPattern: string = "weekly" || "biweekly";
const RecurringReservationFormSchema = Joi.object({
  reservationUnit: Option.required(),
  // TODO check that the endingDate > startingDate > today
  startingDate: Joi.date().required(),
  endingDate: Joi.date().required(),
  repeatPattern: Option.required(),
  startingTime: Option.required(),
  endingTime: Option.required(),
  repeatOnDays: Joi.array().items(Joi.number()).min(1).max(7).required(),
  typeOfReservation: Joi.string().required(),
  seriesName: Joi.string().required(),
  comments: Joi.string().empty("").max(500).optional(),
  bufferTimeBefore: Joi.boolean(),
  bufferTimeAfter: Joi.boolean(),
}).unknown(true);

type RecurringReservationForm = {
  reservationUnit: { value: string; label: string };
  startingDate: Date;
  endingDate: Date;
  repeatPattern: { value: "weekly" | "biweekly"; label: string };
  startingTime: { value: string; label: string };
  endingTime: { value: string; label: string };
  startInterval: boolean;
  repeatOnDays: number[];
  typeOfReservation: string;
  seriesName: string;
  comments: string;
  bufferTimeBefore: boolean;
  bufferTimeAfter: boolean;
};

export { RecurringReservationFormSchema };
export type { RecurringReservationForm };
