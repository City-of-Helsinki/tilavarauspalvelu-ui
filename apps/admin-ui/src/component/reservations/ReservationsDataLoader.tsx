import React from "react";
import { ApolloError, useQuery } from "@apollo/client";
import { trim, values } from "lodash";
import {
  Query,
  QueryReservationsArgs,
  ReservationType,
} from "common/types/gql-types";
import { More } from "@/component/More";
import { LIST_PAGE_SIZE } from "../../common/const";
import { useNotification } from "../../context/NotificationContext";
import Loader from "../Loader";
import { FilterArguments } from "./Filters";
import { RESERVATIONS_QUERY } from "./queries";
import ReservationsTable from "./ReservationsTable";
import { fromUIDate } from "common/src/common/util";

export type Sort = {
  field: string;
  asc: boolean;
};

type Props = {
  filters: FilterArguments;
  sort?: Sort;
  sortChanged: (field: string) => void;
  defaultFiltering: QueryReservationsArgs;
};

function parseDate(hdsDate: string): string | null {
  if (trim(hdsDate) === "") {
    return null;
  }

  const d = fromUIDate(hdsDate);
  if (d && !isNaN(d.getTime())) {
    return d.toISOString();
  }
  return null;
}

const mapFilterParams = (
  params: FilterArguments,
  defaultParams: QueryReservationsArgs
): QueryReservationsArgs => {
  const emptySearch =
    values(params).filter((v) => !(v === "" || v.length === 0)).length === 0;

  // only use defaults if search is "empty"
  const defaults = emptySearch ? defaultParams : {};
  return {
    unit: params.unit?.map((u) => u.value as string),
    reservationUnitType: params.reservationUnitType?.map(
      (u) => u.value as string
    ),
    reservationUnit: params.reservationUnit?.map((ru) => ru.value as string),
    state:
      params.reservationState.length > 0
        ? params.reservationState
            ?.map((ru) => ru.value)
            ?.map((x) => (x != null ? String(x) : null))
        : defaults.state,
    textSearch: params.textSearch || undefined,
    begin: parseDate(params.begin) || defaults.begin,
    end: parseDate(params.end),
    priceGte: params.minPrice !== "" ? params.minPrice : undefined,
    priceLte: params.maxPrice !== "" ? params.maxPrice : undefined,
    orderStatus: params.paymentStatuses
      ?.map((status) => status.value)
      .map((x) => (x != null ? String(x) : null)),
  };
};

const useReservations = (
  filters: FilterArguments,
  defaultFiltering: QueryReservationsArgs,
  sort?: Sort
) => {
  const { notifyError } = useNotification();

  let sortString;
  if (sort) {
    if (sort.field === "begin") {
      if (sort.asc) {
        sortString = "begin,end";
      } else {
        sortString = "-begin,-end";
      }
    } else {
      sortString = `${(sort?.asc ? "" : "-") + sort.field},begin,end`;
    }
  } else {
    sortString = "state";
  }

  const { fetchMore, loading, data } = useQuery<Query, QueryReservationsArgs>(
    RESERVATIONS_QUERY,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      errorPolicy: "all",
      variables: {
        orderBy: sortString,
        first: LIST_PAGE_SIZE,
        ...mapFilterParams(filters, defaultFiltering),
      },
      onError: (err: ApolloError) => {
        notifyError(err.message);
      },
    }
  );

  const reservations = (data?.reservations?.edges || [])
    .map((edge) => edge?.node)
    .filter((x): x is ReservationType => x != null);

  return {
    fetchMore,
    loading,
    data: reservations,
    totalCount: data?.reservations?.totalCount,
    offset: data?.reservations?.edges?.length,
  };
};

const ReservationsDataLoader = ({
  filters,
  sort,
  sortChanged: onSortChanged,
  defaultFiltering,
}: Props): JSX.Element => {
  const { fetchMore, loading, data, totalCount, offset } = useReservations(
    filters,
    defaultFiltering,
    sort
  );

  if (loading && !data) {
    return <Loader />;
  }

  return (
    <>
      <ReservationsTable
        reservations={data}
        sort={sort}
        sortChanged={onSortChanged}
      />
      <More
        totalCount={totalCount || 0}
        count={data.length}
        fetchMore={() => fetchMore({ variables: { offset } })}
      />
    </>
  );
};

export default ReservationsDataLoader;
