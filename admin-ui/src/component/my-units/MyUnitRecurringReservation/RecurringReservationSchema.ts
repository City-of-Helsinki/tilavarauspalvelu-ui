import Joi from "joi";

// TODO handle metadata (variable form fields) instead of using .unkown(true)
// It should be it's own schema object that is included in both forms
// and it should be constructed based on the backend data.

// TODO this Option.required pattern doesn't work for validation
// { label: X, value: 'Valitse' } is valid but if it's supposed to be startTime what does it mean?
const Option = Joi.object({
  label: Joi.string().required(),
  value: Joi.string().required(),
});

// const RecurringReservationRepeatPattern: string = "weekly" || "biweekly";
const RecurringReservationFormSchema = Joi.object({
  reservationUnit: Option.required(),
  startingDate: Joi.date().required(),
  endingDate: Joi.date().required(),
  repeatPattern: Option.required(),
  startingTime: Option.required(),
  endingTime: Option.required(),
  repeatOnDays: Joi.array().items(Joi.number()).required(),
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
