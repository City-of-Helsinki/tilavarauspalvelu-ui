import Joi from "joi";

const Option = Joi.object({
  label: Joi.string().required(),
  value: Joi.string().required(),
});

// const RecurringReservationRepeatPattern: string = "weekly" || "biweekly";
const RecurringReservationFormSchema = Joi.object({
  reservationUnit: Option.required(),
  startingDate: Joi.string().required(),
  endingDate: Joi.string().required(),
  repeatPattern: Option.required(),
  startingTime: Option.required(),
  endingTime: Option.required(),
  repeatOnDays: Joi.array().items(Joi.number()).required(),
  typeOfReservation: Joi.string().required(),
  name: Joi.string().required(),
  comments: Joi.string().max(500),
  bufferTimeBefore: Joi.boolean(),
  bufferTimeAfter: Joi.boolean(),
});

type RecurringReservationForm = {
  reservationUnit: { value: string; label: string };
  startingDate: string;
  endingDate: string;
  repeatPattern: { value: "weekly" | "biweekly"; label: string };
  startingTime: { value: string; label: string };
  endingTime: { value: string; label: string };
  startInterval: boolean;
  repeatOnDays: number[];
  typeOfReservation: string;
  name: string;
  comments: string;
  bufferTimeBefore: boolean;
  bufferTimeAfter: boolean;
};

export { RecurringReservationFormSchema };
export type { RecurringReservationForm };
