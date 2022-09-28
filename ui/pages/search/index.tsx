import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { GetServerSideProps } from "next";
import queryString from "query-string";
import { useLocalStorage } from "react-use";
import { Notification } from "hds-react";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { omit, pick, sortBy } from "lodash";
import { NetworkStatus, useLazyQuery } from "@apollo/client";
import { OptionType } from "common/types/common";
import Container from "../../components/common/Container";
import SearchForm from "../../components/search/SearchForm";
import {
  applicationRoundState,
  capitalize,
  omitEmptyKeys,
} from "../../modules/util";
import { H1, HeroSubheading } from "../../modules/style/typography";
import KorosDefault from "../../components/common/KorosDefault";
import {
  ApplicationRoundType,
  PageInfo,
  Query,
  QueryApplicationRoundsArgs,
  QueryReservationUnitsArgs,
  ReservationUnitsReservationUnitReservationKindChoices,
  ReservationUnitType,
} from "../../modules/gql-types";
import { RESERVATION_UNITS } from "../../modules/queries/reservationUnit";
import Sorting from "../../components/form/Sorting";
import { breakpoint } from "../../modules/style";
import apolloClient from "../../modules/apolloClient";
import { APPLICATION_ROUNDS } from "../../modules/queries/applicationRound";
import BreadcrumbWrapper from "../../components/common/BreadcrumbWrapper";
import ReservationUnitCard from "../../components/search/ReservationUnitCard";
import useReservationUnitsList from "../../hooks/useReservationUnitList";
import ListWithPagination from "../../components/common/ListWithPagination";
import StartApplicationBar from "../../components/common/StartApplicationBar";

type Props = {
  applicationRounds: ApplicationRoundType[];
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const now = new Date();

  const { data } = await apolloClient.query<Query, QueryApplicationRoundsArgs>({
    query: APPLICATION_ROUNDS,
  });
  const applicationRounds = data.applicationRounds?.edges?.map((n) => n.node);

  const activeApplicationRounds = sortBy(
    applicationRounds.filter(
      (applicationRound) =>
        new Date(applicationRound.publicDisplayBegin) <= now &&
        new Date(applicationRound.publicDisplayEnd) >= now &&
        applicationRoundState(
          applicationRound.applicationPeriodBegin,
          applicationRound.applicationPeriodEnd
        ) === "active"
    ),
    ["pk"]
  );

  return {
    props: {
      overrideBackgroundColor: "var(--tilavaraus-gray)",
      applicationRounds: activeApplicationRounds,
      ...(await serverSideTranslations(locale)),
    },
  };
};

const pagingLimit = 36;

const Wrapper = styled.div`
  margin-bottom: var(--spacing-layout-l);
  background-color: var(--tilavaraus-gray);
`;

const HeadContainer = styled.div`
  background-color: white;

  @media (min-width: ${breakpoint.m}) {
    padding-top: 0;
  }
`;

const Title = styled(H1)`
  margin-top: var(--spacing-xl);
`;

const Ingress = styled(HeroSubheading)`
  margin-bottom: var(--spacing-xs);
`;

const StyledSorting = styled(Sorting)`
  display: block;

  @media (min-width: 420px) {
    display: flex;
  }
`;

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
      "applicationRound",
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
    ...(values.applicationRound && {
      applicationRound: values.applicationRound.split(","),
    }),
    first: pagingLimit,
    orderBy: values.order === "desc" ? `-${sortCriteria}` : sortCriteria,
    isDraft: false,
    isVisible: true,
    reservationKind:
      ReservationUnitsReservationUnitReservationKindChoices.Season,
  };
};

const Search = ({ applicationRounds }: Props): JSX.Element => {
  const router = useRouter();

  const {
    reservationUnits: selectedReservationUnits,
    selectReservationUnit,
    removeReservationUnit,
    containsReservationUnit,
    clearSelections,
  } = useReservationUnitsList();

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

  const setStoredValues = useLocalStorage("reservationUnit-search", null)[1];

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
        <BreadcrumbWrapper route={["/recurring", "search"]} />
        <Container>
          <Title>{t("search:recurring.heading")}</Title>
          <Ingress>{t("search:recurring.text")}</Ingress>
          <SearchForm
            key={JSON.stringify(values)}
            applicationRounds={applicationRounds}
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
          <ReservationUnitCard
            selectReservationUnit={selectReservationUnit}
            containsReservationUnit={containsReservationUnit}
            removeReservationUnit={removeReservationUnit}
            reservationUnit={ru}
            key={ru.id}
          />
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
              router.replace({ query: params });
            }}
            isOrderingAsc={isOrderingAsc}
            setIsOrderingAsc={(isAsc: boolean) => {
              const params = {
                ...values,
                order: isAsc ? "asc" : "desc",
              };
              router.replace({ query: params });
            }}
          />
        }
      />
      <StartApplicationBar
        count={selectedReservationUnits.length}
        clearSelections={clearSelections}
      />
    </Wrapper>
  );
};

export default Search;
