import {
  Query,
  QueryReservationDenyReasonsArgs,
  QueryReservationsArgs,
  ReservationDenyReasonType,
  ReservationsReservationStateChoices,
  ReservationType,
  QueryReservationByPkArgs,
} from "common/types/gql-types";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  RESERVATIONS_BY_RESERVATIONUNIT,
  RECURRING_RESERVATION_QUERY,
} from "./queries";
import { useNotification } from "../../../../context/NotificationContext";
import { RESERVATION_QUERY, RESERVATION_DENY_REASONS } from "../queries";
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
  states: ReservationsReservationStateChoices[];
  limit: number;
};
const defaultOptions = {
  states: [
    ReservationsReservationStateChoices.Confirmed,
    ReservationsReservationStateChoices.Denied,
  ],
  limit: LIMIT,
};

/// @param recurringPk fetch reservations related to this pk
/// @param state optionally only fetch some reservation states
/// @param limit allows to over fetch: 100 is the limit per query, larger amounts are done with multiple fetches
/// TODO for some reason ReservationList is not updated after deny all (cache invalidation / refetch doesn't work properly)
/// FIXME refetchSingle is broken after cache change
/// Prefer the use of refetchSingle if at all possible, it takes a reservation pk as an argument
/// and only updates that.
/// refetch does a full cache reset that can take a long time and also causes rendering artefacts
/// because it resets a list to [].
/// refetchSingle has no error reporting incorrect reservation pk's are ignored
export const useRecurringReservations = (
  recurringPk?: number,
  options?: Partial<OptionsType>
) => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();

  const { limit, states } = { ...defaultOptions, ...options };
  const {
    data,
    loading,
    refetch: baseRefetch,
    fetchMore,
  } = useQuery<
    Query,
    {
      pk: number;
      count: number;
      offset: number;
      state: ReservationsReservationStateChoices[];
    }
  >(RECURRING_RESERVATION_QUERY, {
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
    // handle automatic refetching and let the cache manage merging
    onCompleted: (d: Query) => {
      const allCount = d?.reservations?.totalCount ?? 0;
      const edgeCount = d?.reservations?.edges.length ?? 0;

      if (limit > LIMIT) {
        if (allCount > 0 && edgeCount > 0 && edgeCount < limit) {
          fetchMore({ variables: { offset: edgeCount } });
        }
      }
    },
    onError: () => {
      notifyError(t("RequestedReservation.errorFetchingData"));
    },
  });

  const [getReservation] = useLazyQuery<Query, QueryReservationByPkArgs>(
    RESERVATION_QUERY
  );

  const qd = data?.reservations;
  const ds =
    qd?.edges
      ?.map((x) => x?.node)
      .filter((x): x is ReservationType => x != null) ?? [];

  // TODO there should be a version to invalidate a single part or a range
  // full cache reset is slow
  // FIXME this doesn't work properly (at least in ReservationList)
  const refetch = () => {
    baseRefetch({ offset: 0, count: LIMIT });
  };

  // FIXME this doesn't work right now (how does it update the cache?)
  // it does the request but doesn't cache invalidate it because
  // RESERVATION query is different than RESERVATIONS query (so their caches are separate)
  // either use the original query with a recurringPk + begin parameters (to only update a single day in the cache)
  // or see if we can use reservationByPk to update reservations cache automatically (reservations is just a subset of the getByPk)
  // there is no pk filtering for reservations query so no luck there
  const refetchSingle = (pk: number) => {
    getReservation({ variables: { pk } }).then((res) => {
      console.log("refetched reservation: ", res);
      /*
      const data = res.data?.reservationByPk;
      const indexToUpdate = reservations.findIndex((x) => x.pk === data?.pk);
      if (data && indexToUpdate > -1) {
        setReservations([
          ...reservations.slice(0, indexToUpdate),
          data,
          ...reservations.slice(indexToUpdate + 1),
        ]);
      }
      */
    });
  };

  // TODO how does the limit work with this? (as in what happens if the limit ~100)
  const nAlreayLoaded = data?.reservations?.edges?.length ?? 0;
  const nAllToLoad = data?.reservations?.totalCount ?? 0;
  const stillDataToLoad = nAlreayLoaded < nAllToLoad;

  return {
    loading: loading || stillDataToLoad,
    reservations: ds,
    refetch,
    refetchSingle,
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
