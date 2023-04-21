import { useEffect, useState } from "react";
import { ApolloError, useMutation, useQuery } from "@apollo/client";
import {
  PaymentOrderType,
  Query,
  QueryOrderArgs,
  QueryReservationByPkArgs,
  RefreshOrderMutationInput,
  RefreshOrderMutationPayload,
  ReservationType,
} from "common/types/gql-types";
import {
  GET_ORDER,
  GET_RESERVATION,
  REFRESH_ORDER,
} from "../modules/queries/reservation";

export const useOrder = (
  orderUuid: string
): {
  order: PaymentOrderType | null;
  error: boolean;
  refreshError: ApolloError;
  loading: boolean;
  refresh: () => void;
  called: boolean;
} => {
  const [called, setCalled] = useState(false);

  const {
    data,
    error,
    loading: orderLoading,
    refetch,
  } = useQuery<Query, QueryOrderArgs>(GET_ORDER, {
    fetchPolicy: "no-cache",
    skip: !orderUuid,
    variables: { orderUuid },
    onCompleted: () => {
      setCalled(true);
    },
    onError: () => {
      setCalled(true);
    },
  });

  const [
    refresh,
    { data: refreshData, error: refreshError, loading: refreshLoading },
  ] = useMutation<
    { refreshOrder: RefreshOrderMutationPayload },
    { input: RefreshOrderMutationInput }
  >(REFRESH_ORDER, {
    fetchPolicy: "no-cache",
    variables: { input: { orderUuid } },
    onError: () => {},
  });

  useEffect(() => {
    if (refreshData?.refreshOrder && !refreshLoading) {
      refetch();
    }
  }, [refetch, refreshData, refreshLoading]);

  return {
    order: data?.order,
    error: error != null,
    refreshError,
    loading: orderLoading || refreshLoading,
    refresh,
    called,
  };
};

export const useReservation = (
  reservationPk: number
): { reservation: ReservationType; error: ApolloError; loading: boolean } => {
  const { data, error, loading } = useQuery<Query, QueryReservationByPkArgs>(
    GET_RESERVATION,
    {
      fetchPolicy: "no-cache",
      variables: { pk: reservationPk },
      skip: !reservationPk,
    }
  );

  return { reservation: data?.reservationByPk, error, loading };
};
