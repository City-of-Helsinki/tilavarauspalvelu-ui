import { useQuery } from "@apollo/client";
import React from "react";
import { useTranslation } from "react-i18next";
import { Query, QueryReservationUnitTypesArgs } from "../../common/gql-types";
import { OptionType } from "../../common/types";
import SortedSelect from "../ReservationUnits/ReservationUnitEditor/SortedSelect";
import { RESERVATION_UNIT_TYPES_QUERY } from "./queries";

type Props = {
  onChange: (reservationUnitType: OptionType[]) => void;
  value: OptionType[];
};

const ReservationUnitTypeFilter = ({ onChange, value }: Props): JSX.Element => {
  const { t } = useTranslation();
  const { data, loading } = useQuery<Query, QueryReservationUnitTypesArgs>(
    RESERVATION_UNIT_TYPES_QUERY,
    {}
  );

  if (loading) {
    return <>{t("ReservationUnitsSearch.typeLabel")}</>;
  }

  return (
    <SortedSelect
      sort
      label={t("ReservationUnitsSearch.typeLabel")}
      multiselect
      placeholder={t("ReservationUnitsSearch.typePlaceHolder")}
      options={(data?.reservationUnitTypes?.edges || [])
        .map((e) => e?.node)
        .map((type) => ({
          label: type?.nameFi as string,
          value: String(type?.pk),
        }))}
      onChange={(units) => onChange(units)}
      id="type-combobox"
      value={value}
    />
  );
};

export default ReservationUnitTypeFilter;
