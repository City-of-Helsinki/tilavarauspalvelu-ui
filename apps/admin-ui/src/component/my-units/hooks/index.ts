import { useMemo } from "react";
import { sortBy } from "lodash";
import { getReservationApplicationFields } from "common/src/reservation-form/util";
import { useQuery } from "@apollo/client";
import type {
  Query,
  ReservationUnitNode,
  QueryUnitArgs,
  QueryReservationUnitArgs,
  ReservationUnitNodeReservationSetArgs,
} from "common/types/gql-types";
import {
  CustomerTypeChoice,
  ReservationTypeChoice,
} from "common/types/gql-types";
import { toApiDate } from "common/src/common/util";
import { base64encode, filterNonNullable } from "common/src/helpers";
import { useNotification } from "@/context/NotificationContext";
import {
  OPTIONS_QUERY,
  UNIT_VIEW_QUERY,
  RESERVATION_UNITS_BY_UNIT,
  RESERVATION_UNIT_QUERY,
} from "./queries";
import { RELATED_RESERVATION_STATES } from "common/src/const";

export const useApplicationFields = (
  reservationUnit: ReservationUnitNode,
  reserveeType?: CustomerTypeChoice
) => {
  return useMemo(() => {
    const reserveeTypeString = reserveeType || CustomerTypeChoice.Individual;

    const supportedFields = filterNonNullable(
      reservationUnit.metadataSet?.supportedFields
    );
    const type = reservationUnit.metadataSet?.supportedFields?.find(
      (n) => n.fieldName === "reservee_type"
    )
      ? reserveeTypeString
      : CustomerTypeChoice.Individual;

    return getReservationApplicationFields({
      supportedFields,
      reserveeType: type,
    });
  }, [reservationUnit.metadataSet?.supportedFields, reserveeType]);
};

export const useGeneralFields = (reservationUnit: ReservationUnitNode) => {
  return useMemo(() => {
    const supportedFields = filterNonNullable(
      reservationUnit.metadataSet?.supportedFields
    );
    return getReservationApplicationFields({
      supportedFields,
      reserveeType: "common",
    }).filter((n) => n !== "reserveeType");
  }, [reservationUnit.metadataSet?.supportedFields]);
};

export const useOptions = () => {
  const { data: optionsData } = useQuery<Query>(OPTIONS_QUERY);

  const purpose = sortBy(
    optionsData?.reservationPurposes?.edges || [],
    "node.nameFi"
  ).map((purposeType) => ({
    label: purposeType?.node?.nameFi ?? "",
    value: Number(purposeType?.node?.pk),
  }));

  const ageGroup = sortBy(
    optionsData?.ageGroups?.edges || [],
    "node.minimum"
  ).map((group) => ({
    label: `${group?.node?.minimum}-${group?.node?.maximum || ""}`,
    value: Number(group?.node?.pk),
  }));

  const homeCity = sortBy(optionsData?.cities?.edges || [], "node.nameFi").map(
    (cityType) => ({
      label: cityType?.node?.nameFi ?? "",
      value: Number(cityType?.node?.pk),
    })
  );

  return { ageGroup, purpose, homeCity };
};

// TODO this should be combined with the code in CreateReservationModal (duplicated for now)
export function useReservationUnitQuery(pk?: number) {
  const typename = "ReservationUnitNode";
  const id = base64encode(`${typename}:${pk}`);
  const { data, loading } = useQuery<Query, QueryReservationUnitArgs>(
    RESERVATION_UNIT_QUERY,
    {
      variables: { id },
      skip: pk == null || pk === 0,
    }
  );

  const { reservationUnit } = data ?? {};

  return { reservationUnit, loading };
}

export function useUnitQuery(pk?: number | string) {
  const { notifyError } = useNotification();

  const typename = "UnitNode";
  const id = base64encode(`${typename}:${pk}`);
  const res = useQuery<Query, QueryUnitArgs>(UNIT_VIEW_QUERY, {
    skip: pk == null,
    variables: { id },
    onError: (err) => {
      notifyError(err.message);
    },
  });

  return res;
}

export function useUnitResources(
  begin: Date,
  unitPk: string,
  reservationUnitTypes?: number[]
) {
  const { notifyError } = useNotification();

  const id = base64encode(`UnitNode:${unitPk}`);
  const { data, ...rest } = useQuery<
    Query,
    QueryReservationUnitArgs & ReservationUnitNodeReservationSetArgs
  >(RESERVATION_UNITS_BY_UNIT, {
    skip: unitPk === "" || Number.isNaN(Number(unitPk)) || Number(unitPk) === 0,
    variables: {
      id,
      beginDate: toApiDate(begin),
      // TODO should this be +1 day? or is it already inclusive? seems to be inclusive
      endDate: toApiDate(begin),
      state: RELATED_RESERVATION_STATES,
    },
    onError: () => {
      notifyError("Varauksia ei voitu hakea");
    },
  });

  const resources = filterNonNullable(data?.unit?.reservationunitSet)
    .filter(
      (x) =>
        !reservationUnitTypes?.length ||
        (x.reservationUnitType?.pk != null &&
          reservationUnitTypes.includes(x.reservationUnitType.pk))
    )
    .map((x) => ({
      title: x.nameFi ?? "",
      url: String(x.pk || 0),
      isDraft: x.isDraft,
      pk: x.pk ?? 0,
      events:
        filterNonNullable(x.reservationSet).map((y) => ({
          event: {
            ...y,
            ...(y.type !== ReservationTypeChoice.Blocked
              ? {
                  bufferTimeBefore:
                    y.bufferTimeBefore ?? x.bufferTimeBefore ?? 0,
                  bufferTimeAfter: y.bufferTimeAfter ?? x.bufferTimeAfter ?? 0,
                }
              : {}),
          },
          title: y.name ?? "",
          start: new Date(y.begin),
          end: new Date(y.end),
        })) ?? [],
    }));

  return { ...rest, resources };
}
