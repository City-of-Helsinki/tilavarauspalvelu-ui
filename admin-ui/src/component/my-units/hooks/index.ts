import type { Query, QueryReservationUnitsArgs } from "common/types/gql-types";
import { useQuery } from "@apollo/client";
import { RESERVATION_UNIT_QUERY } from "../create-reservation/queries";

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
