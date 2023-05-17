import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import type {
  Query,
  QueryReservationUnitByPkArgs,
  QueryUnitsArgs,
  ReservationUnitByPkTypeReservationsArgs,
  ReservationUnitType,
} from "common/types/gql-types";
import { ReservationUnitsReservationUnitReservationStartIntervalChoices } from "common/types/gql-types";
import type { UseFormReturn } from "react-hook-form";
import { generateReservations } from "./generateReservations";
import type { RecurringReservationForm } from "./RecurringReservationSchema";
import { useNotification } from "../../../context/NotificationContext";
import { RECURRING_RESERVATION_UNIT_QUERY } from "../queries";
import { GET_RESERVATIONS_IN_INTERVAL } from "./queries";

export const useMultipleReservation = (
  form: UseFormReturn<RecurringReservationForm>,
  interval: ReservationUnitsReservationUnitReservationStartIntervalChoices = ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_15Mins
) => {
  const { watch } = form;

  const selectedReservationParams = watch([
    "startingDate",
    "endingDate",
    "startTime",
    "endTime",
    "repeatPattern",
    "repeatOnDays",
  ]);

  return useMemo(
    () =>
      generateReservations(
        {
          startingDate: selectedReservationParams[0],
          endingDate: selectedReservationParams[1],
          startTime: selectedReservationParams[2],
          endTime: selectedReservationParams[3],
          repeatPattern: selectedReservationParams[4],
          repeatOnDays: selectedReservationParams[5],
        },
        interval
      ),
    [selectedReservationParams, interval]
  );
};

// NOTE pks are integers even though the query uses strings
export const useRecurringReservationsUnits = (unitId: number) => {
  const { notifyError } = useNotification();

  const { loading, data } = useQuery<Query, QueryUnitsArgs>(
    RECURRING_RESERVATION_UNIT_QUERY,
    {
      variables: {
        pk: [String(unitId)],
        offset: 0,
      },
      onError: (err) => {
        notifyError(err.message);
      },
    }
  );

  const unit = data?.units?.edges[0];
  const reservationUnits = unit?.node?.reservationUnits?.filter(
    (item): item is ReservationUnitType => !!item
  );

  return { loading, reservationUnits };
};

// TODO this should be in cache or use a custom context, because the amount of reservations
// in an interval can easily be more than 2000
// to be fair it would require a complex cache strategy to allow extending the range without refetching everything
// so if the date is moved by one in a 1 year range that would refetch everything
export const useReservationsInInterval = ({
  begin,
  end,
  reservationUnitPk,
}: {
  begin: Date;
  end: Date;
  reservationUnitPk: number;
}) => {
  const { notifyError } = useNotification();

  // TODO check if we have more than 100 elements
  const { loading, data } = useQuery<
    Query,
    QueryReservationUnitByPkArgs & ReservationUnitByPkTypeReservationsArgs
  >(GET_RESERVATIONS_IN_INTERVAL, {
    skip:
      !reservationUnitPk || Number.isNaN(reservationUnitPk) || !begin || !end,
    variables: {
      pk: reservationUnitPk,
      from: begin ? format(begin, "yyyy-MM-dd") : undefined,
      to: end ? format(end, "yyyy-MM-dd") : undefined,
    },
    onError: (err) => {
      notifyError(err.message);
    },
  });

  const reservations = useMemo(
    () =>
      data?.reservationUnitByPk?.reservations
        ?.map((x) =>
          x?.begin && x?.end
            ? { begin: new Date(x.begin), end: new Date(x.end) }
            : undefined
        )
        ?.filter((x): x is { begin: Date; end: Date } => x != null) ?? [],
    [data]
  );

  return { reservations, loading };
};
