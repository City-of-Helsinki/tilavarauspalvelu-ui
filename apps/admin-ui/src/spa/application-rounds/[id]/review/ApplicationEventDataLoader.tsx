import React from "react";
import { type ApolloError } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import {
  ApplicationSectionOrderingChoices,
  useApplicationSectionsQuery,
} from "@gql/gql-types";
import { useTranslation } from "next-i18next";
import { filterNonNullable } from "common/src/helpers";
import {
  LIST_PAGE_SIZE,
  VALID_ALLOCATION_APPLICATION_STATUSES,
} from "@/common/const";
import { errorToast } from "common/src/common/toast";
import { More } from "@/component/More";
import { useSort } from "@/hooks/useSort";
import { ApplicationEventsTable, SORT_KEYS } from "./ApplicationEventsTable";
import {
  transformApplicantType,
  transformApplicationSectionStatus,
} from "./utils";
import { CenterSpinner } from "common/styles/util";

type Props = {
  applicationRoundPk: number;
};

// TODO rename the component (section)
export function ApplicationEventDataLoader({
  applicationRoundPk,
}: Props): JSX.Element {
  const [orderBy, handleSortChanged] = useSort(SORT_KEYS);
  const [searchParams] = useSearchParams();
  const unitFilter = searchParams.getAll("unit");
  const applicantFilter = searchParams.getAll("applicant");
  const nameFilter = searchParams.get("search");
  const eventStatusFilter = searchParams.getAll("eventStatus");

  // TODO rename the query (section)
  const query = useApplicationSectionsQuery({
    skip: !applicationRoundPk,
    variables: {
      first: LIST_PAGE_SIZE,
      unit: unitFilter.map(Number).filter(Number.isFinite),
      applicationRound: applicationRoundPk,
      applicationStatus: VALID_ALLOCATION_APPLICATION_STATUSES,
      status: transformApplicationSectionStatus(eventStatusFilter),
      applicantType: transformApplicantType(applicantFilter),
      textSearch: nameFilter,
      orderBy: transformOrderBy(orderBy),
    },
    onError: (err: ApolloError) => {
      errorToast({ text: err.message });
    },
    fetchPolicy: "cache-and-network",
    // TODO enable or no?
    nextFetchPolicy: "cache-first",
  });

  const { fetchMore, previousData, loading, data } = query;

  const { t } = useTranslation();

  const dataToUse = data ?? previousData;
  if (loading && !dataToUse) {
    return <CenterSpinner />;
  }

  const applicationSections = filterNonNullable(
    dataToUse?.applicationSections?.edges.map((edge) => edge?.node)
  );
  const totalCount = dataToUse?.applicationSections?.totalCount ?? 0;

  return (
    <>
      <span>
        <b>
          {totalCount} {t("ApplicationRound.applicationEventCount")}
        </b>
      </span>
      <ApplicationEventsTable
        applicationSections={applicationSections}
        sort={orderBy}
        sortChanged={handleSortChanged}
        isLoading={loading}
      />
      <More
        totalCount={totalCount}
        count={applicationSections.length}
        pageInfo={dataToUse?.applicationSections?.pageInfo}
        fetchMore={(after) => fetchMore({ variables: { after } })}
      />
    </>
  );
}

function transformOrderBy(
  orderBy: string | null
): ApplicationSectionOrderingChoices[] {
  if (orderBy == null) {
    return [];
  }
  const desc = orderBy.startsWith("-");
  const rest = desc ? orderBy.slice(1) : orderBy;
  switch (rest) {
    case "nameFi":
      return desc
        ? [ApplicationSectionOrderingChoices.NameDesc]
        : [ApplicationSectionOrderingChoices.NameAsc];
    case "preferredUnitNameFi":
      return desc
        ? [ApplicationSectionOrderingChoices.PreferredUnitNameFiDesc]
        : [ApplicationSectionOrderingChoices.PreferredUnitNameFiAsc];
    case "status":
      return desc
        ? [ApplicationSectionOrderingChoices.StatusDesc]
        : [ApplicationSectionOrderingChoices.StatusAsc];
    case "applicant":
      return desc
        ? [ApplicationSectionOrderingChoices.ApplicantDesc]
        : [ApplicationSectionOrderingChoices.ApplicantAsc];
    case "application_id,pk":
    case "application_id,-pk":
      return desc
        ? [
            ApplicationSectionOrderingChoices.ApplicationPkDesc,
            ApplicationSectionOrderingChoices.PkDesc,
          ]
        : [
            ApplicationSectionOrderingChoices.ApplicationPkAsc,
            ApplicationSectionOrderingChoices.PkAsc,
          ];
    default:
      return [];
  }
}
