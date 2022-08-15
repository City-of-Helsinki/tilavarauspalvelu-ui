import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "next-i18next";
import { NetworkStatus, useLazyQuery } from "@apollo/client";
import { GetServerSideProps } from "next";
import styled from "styled-components";
import queryString from "query-string";
import { useRouter } from "next/router";
import { Notification } from "hds-react";
import { useLocalStorage } from "react-use";
import { omit, pick } from "lodash";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Container from "../../components/common/Container";
import SearchForm from "../../components/single-search/SearchForm";
import { capitalize, omitEmptyKeys, singleSearchUrl } from "../../modules/util";
import {
  PageInfo,
  Query,
  QueryReservationUnitsArgs,
  ReservationUnitsReservationUnitReservationKindChoices,
  ReservationUnitType,
} from "../../modules/gql-types";
import { H1, HeroSubheading } from "../../modules/style/typography";
import { RESERVATION_UNITS } from "../../modules/queries/reservationUnit";
import Sorting from "../../components/form/Sorting";
import { OptionType } from "../../modules/types";
import KorosDefault from "../../components/common/KorosDefault";
import ListWithPagination from "../../components/common/ListWithPagination";
import ReservationUnitCard from "../../components/single-search/ReservationUnitCard";

const pagingLimit = 36;

const Wrapper = styled.div`
  margin-bottom: var(--spacing-layout-l);
  background-color: var(--tilavaraus-gray);
`;

const HeadContainer = styled.div`
  background-color: white;
  padding-top: var(--spacing-layout-xs);
`;

const Heading = styled(H1)``;

const Subheading = styled(HeroSubheading)`
  margin-bottom: var(--spacing-xs);
`;

const StyledSorting = styled(Sorting)`
  display: block;

  @media (min-width: 420px) {
    display: flex;
  }
`;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      overrideBackgroundColor: "var(--tilavaraus-gray)",
      ...(await serverSideTranslations(locale)),
    },
  };
};

type QueryArgs = {
  minPersons?: number;
  maxPersons?: number;
  purposes?: string[];
  unit?: string[];
  reservationUnitType?: string[];
  applicationRound?: string[];
  first?: number;
  orderBy?: string;
  isDraft?: false;
  isVisible?: true;
  reservationKind?: ReservationUnitsReservationUnitReservationKindChoices;
};

const processVariables = (
  values: Record<string, string>,
  language: string
): QueryArgs => {
  const sortCriteria = ["name", "unitName"].includes(values.sort)
    ? `${values.sort}${capitalize(language)}`
    : values.sort;

  return {
    ...omit(values, [
      "order",
      "sort",
      "minPersons",
      "maxPersons",
      "purposes",
      "unit",
      "reservationUnitType",
    ]),
    ...(values.minPersons && {
      minPersons: parseInt(values.minPersons, 10),
    }),
    ...(values.maxPersons && {
      maxPersons: parseInt(values.maxPersons, 10),
    }),
    ...(values.purposes && {
      purposes: values.purposes.split(","),
    }),
    ...(values.unit && {
      unit: values.unit.split(","),
    }),
    ...(values.reservationUnitType && {
      reservationUnitType: values.reservationUnitType.split(","),
    }),
    first: pagingLimit,
    orderBy: values.order === "desc" ? `-${sortCriteria}` : sortCriteria,
    isDraft: false,
    isVisible: true,
    reservationKind:
      ReservationUnitsReservationUnitReservationKindChoices.Direct,
  };
};

const SearchSingle = (): JSX.Element => {
  const router = useRouter();

  const { t, i18n } = useTranslation();

  const sortingOptions = useMemo(
    () => [
      {
        label: t("search:sorting.label.name"),
        value: "name",
      },
      {
        label: t("search:sorting.label.type"),
        value: "typeRank",
      },
      {
        label: t("search:sorting.label.unit"),
        value: "unitName",
      },
    ],
    [t]
  );

  const [values, setValues] = useState({} as Record<string, string>);
  const [reservationUnits, setReservationUnits] = useState<
    ReservationUnitType[] | null
  >(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pageInfo, setPageInfo] = useState<PageInfo>(null);
  const setStoredValues = useLocalStorage(
    "reservationUnit-search-single",
    null
  )[1];

  const [runQuery, { data, fetchMore, loading, error, networkStatus }] =
    useLazyQuery<Query, QueryReservationUnitsArgs>(RESERVATION_UNITS, {
      fetchPolicy: "network-only",
    });

  useEffect(() => {
    setReservationUnits(
      data?.reservationUnits?.edges?.map((edge) => edge.node)
    );
    setTotalCount(data?.reservationUnits?.totalCount);
    setPageInfo(data?.reservationUnits?.pageInfo);
  }, [data]);

  const handleRouteChange = useCallback(
    (url: string | null) => {
      const { query } = queryString.parseUrl(url);
      setStoredValues(query);
      const parsed = query;
      if (!parsed.sort) parsed.sort = "name";
      if (!parsed.order) parsed.order = "asc";

      const newValues = Object.keys(parsed).reduce((p, key) => {
        if (parsed[key]) {
          return { ...p, [key]: parsed[key]?.toString() } as Record<
            string,
            string
          >;
        }
        return p;
      }, {} as Record<string, string>);

      setValues(newValues);
      const processedVariables = processVariables(newValues, i18n.language);
      const vars = [
        "textSearch",
        "minPersons",
        "maxPersons",
        "purposes",
        "unit",
        "reservationUnitType",
        "applicationRound",
        "orderBy",
        "reservationKind",
      ].reduce((acc, cur) => {
        return Object.prototype.hasOwnProperty.call(processedVariables, cur)
          ? { ...acc, [cur]: processedVariables[cur] }
          : { ...acc, [cur]: undefined };
      }, processedVariables);
      runQuery({ variables: vars });
    },
    [setStoredValues, setValues, runQuery, i18n.language]
  );

  useEffect(() => {
    handleRouteChange(
      `${router.pathname}?${queryString.stringify(router.query)}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [
    router.events,
    router,
    i18n.language,
    setStoredValues,
    setValues,
    runQuery,
    reservationUnits,
    handleRouteChange,
  ]);

  const loadingMore = useMemo(
    () => networkStatus === NetworkStatus.fetchMore,
    [networkStatus]
  );

  const history = useRouter();

  const onSearch = async (criteria: QueryReservationUnitsArgs) => {
    const sortingCriteria = pick(router.query, ["sort", "order"]);
    const filteredCriteria = omitEmptyKeys(criteria);
    router.replace({ query: { ...filteredCriteria, ...sortingCriteria } });
  };

  const onRemove = (key?: string[], subItemKey?: string) => {
    let newValues = {};
    if (subItemKey) {
      newValues = {
        ...values,
        [subItemKey]: values[subItemKey]
          .split(",")
          .filter((n) => !key.includes(n))
          .join(","),
      };
    } else if (key) {
      newValues = omit(values, key);
    }

    const sortingCriteria = pick(router.query, ["sort", "order"]);
    const route = {
      query: {
        ...omitEmptyKeys(newValues),
        ...sortingCriteria,
        // a hacky way to bypass query cache
        textSearch:
          !key || key.includes("textSearch") ? "" : values.textSearch || "",
      },
    };
    router.replace(route);
  };

  const isOrderingAsc = values.order !== "desc";

  return (
    <Wrapper>
      {error ? (
        <Notification size="small" type="alert">
          {t("searchResultList:error")}
        </Notification>
      ) : null}
      <HeadContainer>
        <Container>
          <Heading>{t("search:single.heading")}</Heading>
          <Subheading>{t("search:single.text")}</Subheading>
          <SearchForm
            key={JSON.stringify(values)}
            onSearch={onSearch}
            formValues={omit(values, ["order", "sort"])}
            removeValue={onRemove}
          />
        </Container>
      </HeadContainer>
      <KorosDefault from="white" to="var(--tilavaraus-gray)" />
      <ListWithPagination
        id="searchResultList"
        items={reservationUnits?.map((ru) => (
          <ReservationUnitCard reservationUnit={ru} key={ru.id} />
        ))}
        loading={loading}
        loadingMore={loadingMore}
        pageInfo={pageInfo}
        totalCount={totalCount}
        fetchMore={(cursor) => {
          const variables = {
            ...values,
            after: cursor,
          };
          fetchMore({
            variables: processVariables(variables, i18n.language),
          });
        }}
        sortingComponent={
          <StyledSorting
            value={values.sort}
            sortingOptions={sortingOptions}
            setSorting={(val: OptionType) => {
              const params = {
                ...values,
                sort: String(val.value),
              };
              history.replace(singleSearchUrl(params));
            }}
            isOrderingAsc={isOrderingAsc}
            setIsOrderingAsc={(isAsc: boolean) => {
              const params = {
                ...values,
                order: isAsc ? "asc" : "desc",
              };
              history.replace(singleSearchUrl(params));
            }}
          />
        }
      />
    </Wrapper>
  );
};

export default SearchSingle;
