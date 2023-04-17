import React, { useState } from "react";
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

export const ReserverMetadataSetForm = ({
  reservationUnit,
}: Props): JSX.Element => {
  // TODO can this be moved to the form data? since that's where it's needed
  // use watcher and context instead of state
  // we need the value here because we need to switc the fields
  // well maybe we can drop this component completely by moving the ApplicationFields into ReserverMetaFields
  // if we need we can prop drill options (loading issues maybe)
  const [reserveeType, setReserveeType] = useState<
    ReservationsReservationReserveeTypeChoices | undefined
  >(undefined);
  const { t } = useReservationTranslation();

  const options = useOptions();

  // TODO naming: applicationFields = reserverFields (Varaajan tiedot)
  const reservationApplicationFields = useApplicatioonFields(
    reservationUnit,
    reserveeType
  );

  return (
    <ReserverMetaFields
      reserveeType={reserveeType}
      setReserveeType={setReserveeType}
      fields={reservationApplicationFields}
      reservationUnit={reservationUnit}
      options={options}
      t={t}
    />
  );
};
