import React from "react";
import { useFormContext } from "react-hook-form";
import { Reservation } from "common/src/reservation-form/types";
import {
  ReservationsReservationReserveeTypeChoices,
  ReservationUnitType,
} from "common/types/gql-types";
import {
  ReserverMetaFields,
  ReservationMetaFields,
} from "common/src/reservation-form/MetaFields";
import {
  useApplicatioonFields,
  useGeneralFields,
  useOptions,
  useReservationTranslation,
} from "./hooks";

type Props = {
  reservationUnit: ReservationUnitType;
};

export const ReservationMetadataSetForm = ({
  reservationUnit,
}: Props): JSX.Element => {
  const options = useOptions();
  const { t } = useReservationTranslation();
  // TODO naming: generalFields = reservationFields (Varauksen tiedot)
  // or maybe metadataReservationFields?
  const generalFields = useGeneralFields(reservationUnit);

  return (
    <ReservationMetaFields
      fields={generalFields}
      reservationUnit={reservationUnit}
      options={options}
      t={t}
    />
  );
};

// TODO this component can be wholly deprecated maybe? translations / options?
export const ReserverMetadataSetForm = ({
  reservationUnit,
}: Props): JSX.Element => {
  // FIXME this breaks UI
  const { watch } = useFormContext<Reservation>();

  const { t } = useReservationTranslation();

  const options = useOptions();

  // TODO naming: applicationFields = reserverFields (Varaajan tiedot)
  const reservationApplicationFields = useApplicatioonFields(
    reservationUnit,
    // FIXME typesafe conversion
    watch("reserveeType") as ReservationsReservationReserveeTypeChoices
  );

  return (
    <ReserverMetaFields
      fields={reservationApplicationFields}
      reservationUnit={reservationUnit}
      options={options}
      t={t}
    />
  );
};
