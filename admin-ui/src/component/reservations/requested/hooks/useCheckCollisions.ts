import { Query, QueryReservationUnitByPkArgs } from "common/types/gql-types";
import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useNotification } from "app/context/NotificationContext";
import { RESERVATIONS_BY_RESERVATIONUNIT } from "./queries";

const useCheckCollisions = ({
  reservationPk,
  reservationUnitPk,
  start,
  end,
}: {
  reservationPk?: number;
  reservationUnitPk: number;
  start?: Date;
  end?: Date;
}) => {
  const { notifyError } = useNotification();

  const { data, loading } = useQuery<
    Query,
    QueryReservationUnitByPkArgs & { from: string; to: string }
  >(RESERVATIONS_BY_RESERVATIONUNIT, {
    fetchPolicy: "no-cache",
    skip: !reservationUnitPk || !start || !end,
    variables: {
      pk: reservationUnitPk,
      from: format(start ?? new Date(), "yyyy-MM-dd"),
      to: format(end ?? new Date(), "yyyy-MM-dd"),
    },
    onError: () => {
      notifyError("Varauksia ei voitu hakea");
    },
  });

  type Interval = { start: Date; end: Date };
  const collides = (a: Interval, b: Interval): boolean => {
    if (a.start < b.start && a.end <= b.start) return false;
    if (a.start >= b.end && a.end > b.end) return false;
    return true;
  };

  const reservations = data?.reservationUnitByPk?.reservations ?? [];
  const collisions = reservations
    .filter((x) => x?.pk !== reservationPk)
    .filter(
      (x) =>
        x?.begin &&
        x?.end &&
        end &&
        start &&
        collides(
          { start, end },
          { start: new Date(x.begin), end: new Date(x.end) }
        )
    );

  return { isLoading: loading, hasCollisions: collisions.length > 0 };
};

export default useCheckCollisions;
