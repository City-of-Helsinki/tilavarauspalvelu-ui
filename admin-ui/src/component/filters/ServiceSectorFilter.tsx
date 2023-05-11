import React from "react";
import { gql, useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { Query, ServiceSectorType } from "common/types/gql-types";
import { OptionType } from "../../common/types";
import SortedSelect from "../ReservationUnits/ReservationUnitEditor/SortedSelect";

const SERVICE_SECTORS_QUERY = gql`
  query serviceSector {
    serviceSectors {
      edges {
        node {
          nameFi
          pk
        }
      }
    }
  }
`;

type Props = {
  onChange: (serviceSectors: OptionType) => void;
  value?: OptionType;
};

const ServiceSectorFilter = ({ onChange, value }: Props): JSX.Element => {
  const { t } = useTranslation();
  // FIXME autoload 2000 elements by default (sam as in ReservationUnitFilter)
  const { data, loading } = useQuery<Query>(SERVICE_SECTORS_QUERY);

  if (loading) {
    return <>{t("Units.filters.serviceSector")}</>;
  }

  const options: OptionType[] = (data?.serviceSectors?.edges || [])
    .map((e) => e?.node)
    .filter((e): e is ServiceSectorType => e != null)
    .map((serviceSector) => ({
      label: serviceSector?.nameFi ?? "",
      value: serviceSector?.pk ?? 0,
    }));

  return (
    <SortedSelect
      sort
      label={t("Units.filters.serviceSector")}
      placeholder={t("common.filter")}
      options={options}
      value={value}
      onChange={onChange}
      id="service-sector-combobox"
    />
  );
};

export default ServiceSectorFilter;
