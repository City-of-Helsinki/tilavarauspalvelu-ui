import { useMemo } from "react";
import type { Query, QueryReservationUnitsArgs } from "common/types/gql-types";
import type { UseFormReturn } from "react-hook-form";
import { useQuery } from "@apollo/client";
import { RESERVATION_UNIT_QUERY } from "../create-reservation/queries";
import { generateReservations } from "./ReservationsList";
import type { RecurringReservationForm } from "./RecurringReservationSchema";

// TODO this should be combined with the code in CreateReservationModal (duplicated for now)
export const useReservationUnitQuery = (unitPk?: number) => {
  const { data, loading } = useQuery<Query, QueryReservationUnitsArgs>(
    RESERVATION_UNIT_QUERY,
    {
      variables: { pk: [`${unitPk}`] },
    }
  );

  const reservationUnit =
    data?.reservationUnits?.edges.find((ru) => ru)?.node ?? undefined;

  return { reservationUnit, loading };
};

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
