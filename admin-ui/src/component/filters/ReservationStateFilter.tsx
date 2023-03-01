import React from "react";
import { useTranslation } from "react-i18next";
import { ReservationsReservationStateChoices } from "common/types/gql-types";

import { OptionType } from "../../common/types";
import SortedSelect from "../ReservationUnits/ReservationUnitEditor/SortedSelect";

type Props = {
  onChange: (units: OptionType[]) => void;
  value: OptionType[];
};

/*
const ReservationStates = [
  ReservationsReservationStateChoices.Created,
  ReservationsReservationStateChoices.Confirmed,
  ReservationsReservationStateChoices.RequiresHandling,
  ReservationsReservationStateChoices.Denied,
  ReservationsReservationStateChoices.Cancelled,
  ReservationsReservationStateChoices.WaitingForPayment,
];
*/

const ReservationStateFilter = ({ onChange, value }: Props): JSX.Element => {
  const { t } = useTranslation();

  const opts: OptionType[] = Object.keys(
    ReservationsReservationStateChoices
  ).map((s) => ({
    value: s,
    // FIXME translations since we switched from custom type to enum
    label: t(`RequestedReservation.state.${s}`),
  }));

  return (
    <SortedSelect
      label={t("ReservationStateFilter.label")}
      multiselect
      placeholder={t("common.filter")}
      options={opts}
      value={value || []}
      onChange={onChange}
      id="reservation-state"
    />
  );
};

export default ReservationStateFilter;
