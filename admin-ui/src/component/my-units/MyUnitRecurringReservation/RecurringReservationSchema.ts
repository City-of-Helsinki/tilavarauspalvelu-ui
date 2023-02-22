import { z } from "zod";

// TODO handle metadata (variable form fields) instead of using .passthrough
// It should be it's own schema object that is included in both forms
// and it should be constructed based on the backend data.

// NOTE this is wonky since to get the error in hook-form you have to do
// variable?.value?.message instead of just variable?.message like with primitives
// the optionals are mandatory and will silently fail on invalid code.
const Option = z.object({
  label: z.string(),
  value: z.string(),
});

const RecurringReservationFormSchema = z
  .object({
    reservationUnit: Option,
    startingDate: z.coerce.date(),
    endingDate: z.coerce.date(),
    repeatPattern: z.object({
      label: z.string(),
      value: z.literal("weekly").or(z.literal("biweekly")),
    }),
    startingTime: Option,
    endingTime: Option,
    repeatOnDays: z.array(z.number()).min(1).max(7),
    typeOfReservation: z.string(),
    seriesName: z.string(),
    comments: z.string().max(500).optional(),
    bufferTimeBefore: z.boolean(),
    bufferTimeAfter: z.boolean(),
  })
  // TODO is passthrough necessary?
  .passthrough()
  .refine((schema) => schema.startingDate < schema.endingDate, {
    message: "start date can't be after end date",
  });

type RecurringReservationForm = z.infer<typeof RecurringReservationFormSchema>;

export { RecurringReservationFormSchema };
export type { RecurringReservationForm };
