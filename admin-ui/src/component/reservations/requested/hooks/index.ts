import { useState } from "react";
import {
  type Query,
  type ReservationType,
  ReservationsReservationStateChoices,
  type QueryReservationUnitByPkArgs,
  type ReservationDenyReasonType,
  type QueryReservationDenyReasonsArgs,
  type QueryReservationByPkArgs,
} from "common/types/gql-types";
import { useTranslation } from "react-i18next";
import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import {
  RECURRING_RESERVATION_QUERY,
  RESERVATIONS_BY_RESERVATIONUNIT,
  SINGLE_RESERVATION_QUERY,
} from "./queries";
import { useNotification } from "../../../../context/NotificationContext";
import { RESERVATION_DENY_REASONS } from "../queries";
import { OptionType } from "../../../../common/types";
import { GQL_MAX_RESULTS_PER_QUERY } from "../../../../common/const";

const getEventName = (eventType?: string, title?: string) =>
  eventType === "blocked"
    ? "Suljettu"
    : title && title.trim() !== ""
    ? title
    : "No title";

const getReservationTitle = (r: ReservationType) =>
  `${
    r.reserveeOrganisationName ||
    `${r.reserveeFirstName || ""} ${r.reserveeLastName || ""}`
  }`;

// TODO move it to utils
export const convertReservationToCalendarEvent = (r: ReservationType) => ({
  title: getEventName(r.type ?? undefined, getReservationTitle(r)),
  event: {
    ...r,
    name: r.name?.trim() !== "" ? r.name : "No name",
  },
  // TODO use zod for datetime conversions
  start: new Date(r.begin),
  end: new Date(r.end),
});

// TODO This would be better if we combined two GQL queries, one for the reservation itself
// and other that includes the states (now we are fetching a lot of things we don't need)
const shouldBeShownInTheCalendar = (r: ReservationType, ownPk?: number) =>
  r.state === ReservationsReservationStateChoices.Confirmed ||
  r.state === ReservationsReservationStateChoices.RequiresHandling ||
  r.pk === ownPk;

/// NOTE only fetches 100 reservations => use pageInfo and fetchMore
export const useReservationData = (
  begin: Date,
  end: Date,
  reservationUnitPk: string,
  reservationPk?: number
) => {
  const { notifyError } = useNotification();

  const { data, ...rest } = useQuery<
    Query,
    QueryReservationUnitByPkArgs & { from: string; to: string }
  >(RESERVATIONS_BY_RESERVATIONUNIT, {
    fetchPolicy: "no-cache",
    variables: {
      pk: Number(reservationUnitPk),
      from: format(begin, "yyyy-MM-dd"),
      to: format(end, "yyyy-MM-dd"),
    },
    onError: () => {
      notifyError("Varauksia ei voitu hakea");
    },
  });

  const events =
    data?.reservationUnitByPk?.reservations
      ?.filter((r): r is ReservationType => r != null)
      ?.filter((r) => shouldBeShownInTheCalendar(r, reservationPk))
      ?.map((r) => convertReservationToCalendarEvent(r)) ?? [];

  return { ...rest, events };
};

export const useReservationEditData = (id?: string) => {
  const { data, loading, refetch } = useQuery<Query, QueryReservationByPkArgs>(
    SINGLE_RESERVATION_QUERY,
    {
      skip: !id,
      fetchPolicy: "no-cache",
      variables: {
        pk: Number(id),
      },
    }
  );

  const reservation = data?.reservationByPk ?? undefined;
  const reservationUnit =
    data?.reservationByPk?.reservationUnits?.find((x) => x != null) ??
    undefined;

  return { reservation, reservationUnit, loading, refetch };
};

type OptionsType = {
  limit: number;
};
const defaultOptions = {
  limit: GQL_MAX_RESULTS_PER_QUERY,
};

type CustomQueryParams = {
  pk: number;
  count: number;
  offset: number;
  state: ReservationsReservationStateChoices[];
  begin?: Date;
  end?: Date;
};

/// @param recurringPk fetch reservations related to this pk
/// @param state optionally only fetch some reservation states
/// @param limit allows to over fetch: 100 is the limit per query, larger amounts are done with multiple fetches
///
/// NOTE on cache
/// refetching this query is a super bad idea
/// use cache invalidation in the mutation instead
/// The two solutions are either to queryInvalidate / refetch if you REALLY REALLY must do it (it's super slow)
/// or use the update callback in the mutation to update the cache manually with cache.modify
export const useRecurringReservations = (
  recurringPk?: number,
  options?: Partial<OptionsType>
) => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();

  const states = [
    ReservationsReservationStateChoices.Confirmed,
    ReservationsReservationStateChoices.Denied,
  ];
  const { limit } = { ...defaultOptions, ...options };
  const { data, loading, fetchMore } = useQuery<Query, CustomQueryParams>(
    RECURRING_RESERVATION_QUERY,
    {
      skip: !recurringPk,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      errorPolicy: "all",
      variables: {
        pk: recurringPk ?? 0,
        offset: 0,
        count: Math.min(limit, defaultOptions.limit),
        state: states,
      },
      // do automatic fetching and let the cache manage merging
      onCompleted: (d: Query) => {
        const allCount = d?.reservations?.totalCount ?? 0;
        const edgeCount = d?.reservations?.edges.length ?? 0;

        if (
          limit > defaultOptions.limit && // user wanted over fetching
          edgeCount > 0 && // don't fetch if last fetch had no data
          edgeCount < allCount // backend has more data available
        ) {
          fetchMore({ variables: { offset: edgeCount } });
        }
      },
      onError: () => {
        notifyError(t("RequestedReservation.errorFetchingData"));
      },
    }
  );

  const reservations =
    data?.reservations?.edges
      ?.map((x) => x?.node)
      .filter((x): x is ReservationType => x != null) ?? [];

  const edgeCount = data?.reservations?.edges?.length ?? 0;
  const totalCount = data?.reservations?.totalCount ?? 0;
  const hasDataToLoad = edgeCount < totalCount;

  return {
    loading: loading || hasDataToLoad,
    reservations,
    fetchMore,
    pageInfo: data?.reservations?.pageInfo,
    totalCount: data?.reservations?.totalCount,
  };
};

// TODO this has the same useState being local problems as useRecurringReservations
// used to have but it's not obvious because we don't mutate / refetch this.
// Cache it in Apollo InMemory cache instead.
export const useDenyReasonOptions = () => {
  const [denyReasonOptions, setDenyReasonOptions] = useState<OptionType[]>([]);
  const { notifyError } = useNotification();
  const { t } = useTranslation();

  const { loading } = useQuery<Query, QueryReservationDenyReasonsArgs>(
    RESERVATION_DENY_REASONS,
    {
      onCompleted: ({ reservationDenyReasons }) => {
        if (reservationDenyReasons) {
          setDenyReasonOptions(
            reservationDenyReasons.edges
              .map((x) => x?.node)
              .filter((x): x is ReservationDenyReasonType => x != null)
              .map(
                (dr): OptionType => ({
                  value: dr?.pk ?? 0,
                  label: dr?.reasonFi ?? "",
                })
              )
          );
        }
      },
      onError: () => {
        notifyError(t("RequestedReservation.errorFetchingData"));
      },
    }
  );

  return { options: denyReasonOptions, loading };
};
