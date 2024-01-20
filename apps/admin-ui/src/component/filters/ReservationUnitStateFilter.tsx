import React from "react";
import { useTranslation } from "react-i18next";
import { ReservationUnitState } from "common/types/gql-types";
import { OptionType } from "@/common/types";
import { SortedSelect } from "@/component/SortedSelect";

type Props = {
  onChange: (units: OptionType[]) => void;
  value: OptionType[];
};

/// @deprecated : not the worst, but SortedSelect and OptionType are bad
export function ReservationUnitStateFilter({
  onChange,
  value,
}: Props): JSX.Element {
  const { t } = useTranslation();

  const opts: OptionType[] = Object.values(ReservationUnitState).map((s) => ({
    value: s,
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
}
