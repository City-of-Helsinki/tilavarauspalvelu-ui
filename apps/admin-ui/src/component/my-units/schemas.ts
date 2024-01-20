import { z } from "zod";

export const ReservationMadeSchema = z.object({
  reservationPk: z.number().optional(),
  startTime: z.string(),
  endTime: z.string(),
  date: z.date(),
  error: z.string().or(z.unknown()).optional(),
});
export type ReservationMade = z.infer<typeof ReservationMadeSchema>;

export const RecurringReservationDoneParamsSchema = z.object({
  reservations: z.array(ReservationMadeSchema),
  recurringPk: z.number(),
});
