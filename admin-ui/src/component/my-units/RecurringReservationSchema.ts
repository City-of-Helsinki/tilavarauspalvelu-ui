import Joi from "joi";

const RecurringReservationRepeatPattern: string = "weekly" || "bi-weekly";
const RecurringReservationFormSchema = Joi.object({
  reservationUnit: Joi.string().required(),
  startingDate: Joi.date().required(),
  endingDate: Joi.date().required(),
  repeatPattern: Joi.string()
    .valid(RecurringReservationRepeatPattern)
    .required(),
  startingTime: Joi.date().required(),
  endingTime: Joi.date().required(),
  startInterval: Joi.boolean().required(),
  repeatOnDays: Joi.array().items(Joi.string()).required,
  typeOfReservation: Joi.string().required(),
  name: Joi.string().required(),
  comments: Joi.string().max(500),
});

type RecurringReservationForm = {
  reservationUnit: { value: string; label: string };
  startingDate: string;
  endingDate: string;
  repeatPattern: { value: "weekly" | "biweekly"; label: string };
  startingTime: string;
  endingTime: string;
  startInterval: boolean;
  repeatOnDays: number[];
  typeOfReservation: string;
  name: string;
  comments: string;
};

export { RecurringReservationFormSchema };
export type { RecurringReservationForm };
