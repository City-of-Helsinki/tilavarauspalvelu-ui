import React, { useState } from "react";
import { IconSearch } from "hds-react";
import { TFunction } from "i18next";
import { memoize, truncate, uniq } from "lodash";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useQuery, ApolloError } from "@apollo/client";

import { DataFilterConfig, LocalizationLanguages } from "../../common/types";
import { IngressContainer } from "../../styles/layout";
import { H1 } from "../../styles/typography";
import withMainMenu from "../withMainMenu";
import Loader from "../Loader";
import { localizedPropValue } from "../../common/util";
import { BasicLink } from "../../styles/util";
import { RESERVATION_UNITS_QUERY } from "../../common/queries";
import {
  Query,
  QueryReservationUnitArgs,
  ReservationUnitType,
} from "../../common/gql-types";
import { prefixes, reservationUnitUrl } from "../../common/urls";
import { CustomTable, DataOrMessage, TableLink } from "./components";
import { useNotification } from "../../context/NotificationContext";

const Wrapper = styled.div`
  padding: var(--spacing-layout-2-xl) 0 0 var(--spacing-xl);
  max-width: var(--container-width-l);
`;

const SearchContainer = styled.div`
  margin: var(--spacing-layout-l) 0;
`;

const ReservationUnitCount = styled.div`
  font-family: var(--tilavaraus-admin-font-bold);
  font-weight: 700;
  font-size: var(--fontsize-heading-s);
  margin-bottom: var(--spacing-m);
`;

const getColConfig = (t: TFunction, language: LocalizationLanguages) => [
  {
    headerName: t("ReservationUnits.headings.name"),
    key: "nameFi",
    transform: ({ nameFi, pk }: ReservationUnitType) => (
      <TableLink to={reservationUnitUrl(pk as number)}>
        {truncate(nameFi as string, {
          length: 22,
          omission: "...",
        })}
      </TableLink>
    ),
    isSortable: true,
  },
  {
    headerName: t("ReservationUnits.headings.unitName"),
    key: "unit.nameFi",
    isSortable: true,
    transform: (resUnit: ReservationUnitType) =>
      localizedPropValue(resUnit, "unit.name", language),
  },
  {
    headerName: t("ReservationUnits.headings.reservationUnitType"),
    key: "reservationUnitType.name",
    transform: ({ reservationUnitType }: ReservationUnitType) => (
      <span>{localizedPropValue(reservationUnitType, "name", language)}</span>
    ),
  },
  {
    headerName: t("ReservationUnits.headings.maxPersons"),
    key: "maxPersons",
    transform: ({ maxPersons }: ReservationUnitType) => (
      <span>{maxPersons || "-"}</span>
    ),
  },
  {
    headerName: t("ReservationUnits.headings.surfaceArea"),
    key: "surfaceArea",
    transform: ({ surfaceArea }: ReservationUnitType) =>
      surfaceArea !== null ? (
        <span>
          {Number(surfaceArea).toLocaleString("fi") || "-"}
          {t("common.areaUnitSquareMeter")}
        </span>
      ) : (
        "-"
      ),
  },
];

const getFilterConfig = (
  reservationUnits: ReservationUnitType[],
  t: TFunction
): DataFilterConfig[] => {
  const types = uniq(
    reservationUnits.map(
      (reservationUnit) => reservationUnit.reservationUnitType?.nameFi
    )
  ).filter((n) => Boolean(n));

  return [
    {
      title: t("ReservationUnits.headings.reservationUnitType"),
      filters:
        types &&
        types.map((type) => ({
          title: type || "?",
          key: "reservationUnitType.name",
          value: type || "",
        })),
    },
  ];
};

const ReservationUnitsList = (): JSX.Element => {
  const { t, i18n } = useTranslation();

  const [reservationUnits, setReservationUnits] = useState<
    ReservationUnitType[]
  >([]);
  const [filterConfig, setFilterConfig] = useState<DataFilterConfig[] | null>(
    null
  );
  const { notifyError } = useNotification();

  const cols = memoize(() =>
    getColConfig(t, i18n.language as LocalizationLanguages)
  )();

  const { loading } = useQuery<Query, QueryReservationUnitArgs>(
    RESERVATION_UNITS_QUERY,
    {
      onCompleted: (data) => {
        const result = data?.reservationUnits?.edges?.map(
          (ru) => ru?.node as ReservationUnitType
        );
        if (result) {
          setReservationUnits(result);
          setFilterConfig(getFilterConfig(result, t));
        }
      },
      onError: (err: ApolloError) => {
        notifyError(err.message);
      },
    }
  );

  if (loading || !reservationUnits || !filterConfig) {
    return <Loader />;
  }

  return (
    <Wrapper>
      <IngressContainer>
        <H1>{t("ReservationUnits.reservationUnitListHeading")}</H1>
        <p>{t("ReservationUnits.reservationUnitListDescription")}</p>
        <SearchContainer>
          <BasicLink to={`${prefixes.reservationUnits}/search`}>
            <IconSearch />
            {t("ReservationUnits.switchToSearch")}
          </BasicLink>
        </SearchContainer>
        <ReservationUnitCount>
          {reservationUnits.length} {t("common.volumeUnit")}
        </ReservationUnitCount>
      </IngressContainer>
      <DataOrMessage
        data={reservationUnits}
        filteredData={reservationUnits}
        noData="Ei varausyksikköjä"
        noFilteredData="Ei varausyksikköjä"
      >
        <CustomTable
          setSort={(v) => console.log(v)}
          indexKey="id"
          rows={reservationUnits}
          cols={cols}
        />
      </DataOrMessage>
    </Wrapper>
  );
};

export default withMainMenu(ReservationUnitsList);
