import {
  Query,
  QueryReservationDenyReasonsArgs,
  QueryReservationsArgs,
  ReservationDenyReasonType,
  ReservationsReservationStateChoices,
  ReservationType,
} from "common/types/gql-types";
import { useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  RESERVATIONS_BY_RESERVATIONUNIT,
  RECURRING_RESERVATION_QUERY,
} from "./queries";
import { useNotification } from "../../../../context/NotificationContext";
import { RESERVATION_DENY_REASONS } from "../queries";
import { OptionType } from "../../../../common/types";

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
      }))
      .map((x) => ({
        ...x,
        title:
          x.event.type === "blocked"
            ? "Suljettu"
            : x.title.trim() !== ""
            ? x.title
            : "No title",
        event: {
          ...x.event,
          name: x.event.name?.trim() !== "" ? x.event.name : "No name",
        },
      })) ?? [];

  return { ...rest, events };
};

const LIMIT = 100;

type OptionsType = {
  limit: number;
};
const defaultOptions = {
  limit: LIMIT,
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
        count: limit < LIMIT ? limit : LIMIT,
        state: states,
      },
      // handle automatic fetching and let the cache manage merging
      onCompleted: (d: Query) => {
        const allCount = d?.reservations?.totalCount ?? 0;
        const edgeCount = d?.reservations?.edges.length ?? 0;

        if (
          limit > LIMIT &&
          allCount > LIMIT &&
          edgeCount > 0 &&
          edgeCount < allCount
        ) {
          fetchMore({ variables: { offset: edgeCount } });
        }
      },
      onError: () => {
        notifyError(t("RequestedReservation.errorFetchingData"));
      },
    }
  );

  const qd = data?.reservations;
  const ds =
    qd?.edges
      ?.map((x) => x?.node)
      .filter((x): x is ReservationType => x != null) ?? [];

  const nAlreayLoaded = data?.reservations?.edges?.length ?? 0;
  const nAllToLoad = data?.reservations?.totalCount ?? 0;
  const stillDataToLoad = nAlreayLoaded < nAllToLoad;

  return {
    loading: loading || stillDataToLoad,
    reservations: ds,
    fetchMore,
    pageInfo: data?.reservations?.pageInfo,
    totalCount: data?.reservations?.totalCount,
  };
};

// TODO this has the same useState being local problems as the useRecurringReservations
// but it's not obvious because we don't use refetch here.
// cache it in Apollo InMemory cache instead.
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
