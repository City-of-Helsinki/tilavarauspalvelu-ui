import React, { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Query,
  ReservationsReservationReserveeTypeChoices,
  ReservationUnitType,
} from "common/types/gql-types";
import { useQuery } from "@apollo/client";
import { sortBy } from "lodash";
import { getReservationApplicationFields } from "common/src/reservation-form/util";
import MetaFields from "common/src/reservation-form/MetaFields";
import { OPTIONS_QUERY } from "./queries";
import { ReservationFormType } from "./types";
import { useReservationTranslation } from "./hooks";

type Props = {
  reservationUnit: ReservationUnitType;
};

const useApplicatioonFields = (
  reservationUnit: ReservationUnitType,
  reserveeType?: ReservationsReservationReserveeTypeChoices
) => {
  return useMemo(() => {
    const reserveeTypeString =
      reserveeType || ReservationsReservationReserveeTypeChoices.Individual;

    const type = reservationUnit.metadataSet?.supportedFields?.includes(
      "reservee_type"
    )
      ? reserveeTypeString
      : ReservationsReservationReserveeTypeChoices.Individual;

    return getReservationApplicationFields({
      supportedFields:
        reservationUnit.metadataSet?.supportedFields?.filter(
          (x): x is string => x != null
        ) ?? [],
      reserveeType: type,
      camelCaseOutput: true,
    });
  }, [reservationUnit.metadataSet?.supportedFields, reserveeType]);
};

const useGeneralFields = (reservationUnit: ReservationUnitType) => {
  return useMemo(() => {
    return getReservationApplicationFields({
      supportedFields:
        reservationUnit.metadataSet?.supportedFields?.filter(
          (x): x is string => x != null
        ) ?? [],
      reserveeType: "common",
      camelCaseOutput: true,
    }).filter((n) => n !== "reserveeType");
  }, [reservationUnit]);
};

const MetadataSetForm = ({ reservationUnit }: Props): JSX.Element => {
  const [reserveeType, setReserveeType] = useState<
    ReservationsReservationReserveeTypeChoices | undefined
  >(undefined);

  const { t } = useReservationTranslation();

  const { data: optionsData } = useQuery<Query>(OPTIONS_QUERY);

  const { getValues } = useFormContext<ReservationFormType>();

  const purpose = sortBy(optionsData?.purposes?.edges || [], "node.nameFi").map(
    (purposeType) => ({
      label: purposeType?.node?.nameFi ?? "",
      value: Number(purposeType?.node?.pk),
    })
  );

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

  const generalFields = useGeneralFields(reservationUnit);
  const reservationApplicationFields = useApplicatioonFields(
    reservationUnit,
    reserveeType
  );

  const options = { ageGroup, purpose, homeCity };

  return (
    <MetaFields
      reservationUnit={reservationUnit}
      options={options}
      reserveeType={reserveeType}
      setReserveeType={setReserveeType}
      generalFields={generalFields}
      reservationApplicationFields={reservationApplicationFields}
      reservation={getValues()}
      t={t}
    />
  );
};

export default MetadataSetForm;
