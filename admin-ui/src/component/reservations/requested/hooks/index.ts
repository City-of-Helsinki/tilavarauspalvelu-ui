import {
  Query,
  QueryReservationsArgs,
  ReservationsReservationStateChoices,
  ReservationType,
} from "common/types/gql-types";
import { useQuery } from "@apollo/client";
import { RESERVATIONS_BY_RESERVATIONUNIT } from "./queries";
import { useNotification } from "../../../../context/NotificationContext";

// TODO this should be combined to the other version of it used when making a reservation
// TODO there might be an improved performance if we query minimum of 7 days always
export const useReservationData = (
  begin: Date,
  end: Date,
  reservationUnitPk: string,
  reservationPk?: number
) => {
  const { notifyError } = useNotification();

  const { data, ...rest } = useQuery<Query, QueryReservationsArgs>(
    RESERVATIONS_BY_RESERVATIONUNIT,
    {
      variables: {
        reservationUnit: [reservationUnitPk],
        begin: begin.toISOString(),
        end: end.toISOString(),
      },
      onError: () => {
        notifyError("Varauksia ei voitu hakea");
      },
    }
  );

  const events =
    data?.reservations?.edges
      .map((e) => e?.node)
      .filter((r): r is ReservationType => r != null)
      .filter(
        (r) =>
          [
            ReservationsReservationStateChoices.Confirmed,
            ReservationsReservationStateChoices.RequiresHandling,
          ].includes(r.state) || r.pk === reservationPk
      )
      .map((r) => ({
        title: `${
          r.reserveeOrganisationName ||
          `${r.reserveeFirstName || ""} ${r.reserveeLastName || ""}`
        }`,
        event: r,
        // TODO use zod for datetime conversions
        start: new Date(r.begin),
        end: new Date(r.end),
      })) ?? [];

  return { ...rest, events };
};
