import React from "react";
import { useTranslation } from "react-i18next";
import { ReservationUnitState } from "common/types/gql-types";

import { OptionType } from "../../common/types";
import SortedSelect from "../ReservationUnits/ReservationUnitEditor/SortedSelect";

type Props = {
  onChange: (units: OptionType[]) => void;
  value: OptionType[];
};

/*
const ReservationUnitStates = [
  ReservationUnitState.Draft,
  ReservationUnitState.Published,
  ReservationUnitState.ScheduledPublishing,
  ReservationUnitState.ScheduledReservation,
];
*/

const ReservationUnitStateFilter = ({
  onChange,
  value,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  const opts: OptionType[] = Object.keys(ReservationUnitState).map((s) => ({
    value: s,
    // FIXME translations since a few of the states changed and we switched from custom type to enum
    label: t(`ReservationUnits.state.${s}`),
  }));

  return (
    <SortedSelect
      sort
      label={t("ReservationUnitsSearch.stateLabel")}
      multiselect
      placeholder={t("ReservationUnitsSearch.unitPlaceHolder")}
      options={opts}
      value={value || []}
      onChange={onChange}
      id="reservation-unit-combobox"
    />
  );
};

export default ReservationUnitStateFilter;
