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

export const useRecurringReservations = (recurringPk?: number) => {
  const [reservations, setReservations] = useState<ReservationType[]>([]);

  const { notifyError } = useNotification();
  const { t } = useTranslation();

  const { loading, refetch: baseRefetch } = useQuery<
    Query,
    { pk: number; offset: number; count: number }
  >(RECURRING_RESERVATION_QUERY, {
    skip: !recurringPk,
    variables: {
      pk: recurringPk ?? 0,
      offset: reservations.length,
      count: LIMIT,
    },
    onCompleted: (data) => {
      const qd = data?.reservations;
      if (qd?.edges.length != null && qd?.totalCount && qd?.edges.length > 0) {
        const ds =
          qd?.edges
            ?.map((x) => x?.node)
            .filter((x): x is ReservationType => x != null) ?? [];

        setReservations([...reservations, ...ds]);
      }
    },
    onError: () => {
      notifyError(t("RequestedReservation.errorFetchingData"));
    },
  });

  // TODO there should be a version to invalidate a single part or a range
  // full cache reset is slow
  const refetch = () => {
    setReservations([]);
    baseRefetch();
  };

  return { loading, reservations, refetch };
};

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
