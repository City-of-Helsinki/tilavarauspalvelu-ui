import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { generateReservations } from "./ReservationsList";
import type { RecurringReservationForm } from "./RecurringReservationSchema";

export const useMultipleReservation = (
  form: UseFormReturn<RecurringReservationForm>
) => {
  const { watch } = form;

  const selectedReservationParams = watch([
    "startingDate",
    "endingDate",
    "startingTime",
    "endingTime",
    "repeatPattern",
    "repeatOnDays",
  ]);

  return useMemo(
    () =>
      generateReservations({
        startingDate: selectedReservationParams[0],
        endingDate: selectedReservationParams[1],
        startingTime: selectedReservationParams[2],
        endingTime: selectedReservationParams[3],
        repeatPattern: selectedReservationParams[4],
        repeatOnDays: selectedReservationParams[5],
      }),
    [selectedReservationParams]
  );
};
