import React from "react";
import { ApolloError, useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import {
  type ApplicationRoundType,
  type ApplicationType,
  type Query,
  type QueryApplicationsArgs,
} from "common/types/gql-types";
import { APPLICATIONS_QUERY } from "./queries";
import { FilterArguments, STATUS_BUCKETS, mapFilterParams } from "./Filters";
import { useNotification } from "../../../context/NotificationContext";
import Loader from "../../Loader";
import ApplicationsTable from "./ApplicationsTable";
import { More } from "../../lists/More";
import { LIST_PAGE_SIZE } from "../../../common/const";
import { combineResults } from "../../../common/util";
import { appMapper } from "../util";

export type Sort = {
  field: string;
  sort: boolean;
};

const mapFilterParamsOverride = (params: FilterArguments) => ({
  ...mapFilterParams(params),
  // Override default states only if something is selected, use a bucket to query multiple states
  ...(params.applicationStatus && params.applicationStatus.length > 0
    ? {
        applicationStatus: params.applicationStatus
          .map(({ value }) => STATUS_BUCKETS[value])
          .reduce((agv, x) => [...agv, ...x], []),
      }
    : {}),
});

type Props = {
  applicationRound: ApplicationRoundType;
  filters: FilterArguments;
  sort?: Sort;
  sortChanged: (field: string) => void;
};

const updateQuery = (
  previousResult: Query,
  { fetchMoreResult }: { fetchMoreResult: Query }
): Query => {
  if (!fetchMoreResult) {
    return previousResult;
  }

  return combineResults(previousResult, fetchMoreResult, "applications");
};

const ApplicationDataLoader = ({
  applicationRound,
  filters,
  sort,
  sortChanged: onSortChanged,
}: Props): JSX.Element => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();

  let sortString;
  if (sort) {
    sortString = (sort?.sort ? "" : "-") + sort.field;
  }

  const { fetchMore, loading, data } = useQuery<Query, QueryApplicationsArgs>(
    APPLICATIONS_QUERY,
    {
      skip: !applicationRound.pk,
      variables: {
        ...mapFilterParamsOverride(filters),
        applicationRound: String(applicationRound.pk),
        offset: 0,
        first: LIST_PAGE_SIZE,
        orderBy: sortString,
      },
      onError: (err: ApolloError) => {
        notifyError(err.message);
      },
      fetchPolicy: "cache-and-network",
    }
  );

  if (loading) {
    return <Loader />;
  }

  const applications = (data?.applications?.edges || [])
    .map((x) => x?.node)
    .filter((x): x is ApplicationType => x != null)
    .map((x) => appMapper(applicationRound, x, t));

  return (
    <>
      <ApplicationsTable
        applications={applications}
        sort={sort}
        sortChanged={onSortChanged}
      />
      <More
        key={applications.length}
        totalCount={data?.applications?.totalCount || 0}
        count={applications.length}
        fetchMore={() =>
          fetchMore({
            variables: {
              offset: data?.applications?.edges.length,
            },
            updateQuery,
          })
        }
      />
    </>
  );
};

export default ApplicationDataLoader;
