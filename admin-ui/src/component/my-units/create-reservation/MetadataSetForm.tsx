import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  ReservationsReservationReserveeTypeChoices,
  ReservationUnitType,
} from "common/types/gql-types";
import MetaFields from "common/src/reservation-form/MetaFields";
import { Reservation } from "common/src/reservation-form/types";
import {
  useApplicatioonFields,
  useGeneralFields,
  useOptions,
  useReservationTranslation,
} from "./hooks";

type Props = {
  reservationUnit: ReservationUnitType;
};

const MetadataSetForm = ({ reservationUnit }: Props): JSX.Element => {
  const [reserveeType, setReserveeType] = useState<
    ReservationsReservationReserveeTypeChoices | undefined
  >(undefined);
  const { getValues } = useFormContext<Reservation>();

  const { t } = useReservationTranslation();

  const options = useOptions();

  const generalFields = useGeneralFields(reservationUnit);
  const reservationApplicationFields = useApplicatioonFields(
    reservationUnit,
    reserveeType
  );

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
