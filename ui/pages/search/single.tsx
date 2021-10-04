import React, { useState, useEffect } from "react";
import { Koros } from "hds-react";
import { useTranslation } from "next-i18next";
import { gql, useQuery } from "@apollo/client";
import styled from "styled-components";
import queryString from "query-string";
import { useRouter } from "next/router";
import { useLocalStorage } from "react-use";
import { isEqual, omit } from "lodash";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Container from "../../components/common/Container";
import Breadcrumb from "../../components/common/Breadcrumb";
import SearchForm from "../../components/single-search/SearchForm";
import SearchResultList from "../../components/single-search/SearchResultList";
import { singleSearchUrl } from "../../modules/util";
import { isBrowser, searchPrefix } from "../../modules/const";
import { CenterSpinner } from "../../components/common/common";
import { Query, QueryReservationUnitsArgs } from "../../modules/gql-types";

const RESERVATION_UNITS = gql`
  query SearchReservationUnits(
    $search: String
    $minPersons: Float
    $maxPersons: Float
    $unit: ID
    $reservationUnitType: ID
    $limit: Int
    $cursor: String
  ) {
    reservationUnits(
      textSearch: $search
      maxPersonsGte: $minPersons
      maxPersonsLte: $maxPersons
      reservationUnitType: $reservationUnitType
      unit: $unit
      first: $limit
      after: $cursor
    ) {
      edges {
        node {
          id: pk
          name
          reservationUnitType {
            id: pk
            name
          }
          building: unit {
            id: pk
            name
          }
          maxPersons
          location {
            addressStreet
          }
          images {
            imageType
            mediumUrl
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const pagingLimit = 10;

const style = {
  fontSize: "var(--fontsize-heading-l)",
} as React.CSSProperties;

const HeadContainer = styled.div`
  background-color: white;
  padding-top: var(--spacing-layout-xs);
`;

const Heading = styled.h1`
  margin: var(--spacing-l) 0 var(--spacing-s);
`;

const StyledKoros = styled(Koros)`
  fill: white;
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
};

const Search = (): JSX.Element => {
  const { t } = useTranslation();

  const [values, setValues] = useState({} as Record<string, string>);
  const [storedValues, setStoredValues] = useLocalStorage(
    "reservationUnit-search",
    null
  );

  const { data, fetchMore, refetch, loading, error } = useQuery<
    Query,
    QueryReservationUnitsArgs
  >(RESERVATION_UNITS, {
    variables: { ...values, first: pagingLimit },
    fetchPolicy: "network-only",
  });

  const reservationUnits = data?.reservationUnits?.edges?.map(
    (edge) => edge.node
  );
  const pageInfo = data?.reservationUnits?.pageInfo;

  const searchParams = isBrowser ? window.location.search : "";

  useEffect(() => {
    if (searchParams) {
      const parsed = queryString.parse(searchParams);

      const newValues = Object.keys(parsed).reduce((p, key) => {
        if (parsed[key]) {
          return { ...p, [key]: parsed[key]?.toString() } as Record<
            string,
            string
          >;
        }
        return p;
      }, {} as Record<string, string>);

      if (!isEqual(values, newValues)) {
        setValues(newValues);
      }
      refetch(newValues);
    }
  }, [searchParams, values, refetch]);

  useEffect(() => {
    const params = queryString.parse(searchParams);
    if (!loading && !{}.propertyIsEnumerable.call(params, "restore")) {
      setStoredValues(params);
    }
  }, [loading, setStoredValues, searchParams]);

  useEffect(() => {
    const params = queryString.parse(searchParams);
    if ({}.propertyIsEnumerable.call(params, "restore")) {
      window.location.search = queryString.stringify(storedValues);
    }
  }, [searchParams, storedValues]);

  const history = useRouter();

  const onSearch = async (criteria: QueryReservationUnitsArgs) => {
    history.replace(singleSearchUrl(criteria));
  };

  const onRemove = (key: string[]) => {
    const newValues = key ? omit(values, key) : {};
    history.replace(
      singleSearchUrl({
        ...newValues,
        // a hacky way to bypass query cache
        textSearch: !key || key.includes("search") ? "" : values.search || "",
      })
    );
  };

  return (
    <>
      <HeadContainer>
        <Container>
          <Breadcrumb
            root={{ label: "singleReservations" }}
            current={{ label: "search", linkTo: searchPrefix }}
          />
          <Heading style={style}>{t("search:single.heading")}</Heading>
          <span className="text-lg">{t("search:single.text")}</span>
          <SearchForm
            onSearch={onSearch}
            formValues={values}
            removeValue={onRemove}
          />
        </Container>
      </HeadContainer>
      <StyledKoros type="wave" className="koros" flipHorizontal />
      {loading ? (
        <CenterSpinner style={{ marginTop: "var(--spacing-xl)" }} />
      ) : (
        <SearchResultList
          error={!!error}
          reservationUnits={reservationUnits}
          fetchMore={(cursor) => {
            const variables = {
              ...values,
              cursor,
            };
            fetchMore({
              variables,
            });
          }}
          pageInfo={pageInfo}
        />
      )}
    </>
  );
};

export default Search;
