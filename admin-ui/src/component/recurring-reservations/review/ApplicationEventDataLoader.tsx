import React from "react";
import { ApolloError, useQuery } from "@apollo/client";
import {
  type ApplicationEventType,
  type ApplicationRoundType,
  type Query,
  type QueryApplicationEventsArgs,
} from "common/types/gql-types";
import { APPLICATIONS_EVENTS_QUERY } from "./queries";
import { FilterArguments, mapFilterParams } from "./Filters";
import { useNotification } from "../../../context/NotificationContext";
import Loader from "../../Loader";
import { More } from "../../lists/More";
import { LIST_PAGE_SIZE } from "../../../common/const";
import { combineResults } from "../../../common/util";
import ApplicationEventsTable from "./ApplicationEventsTable";
import { appEventMapper } from "../util";

export type Sort = {
  field: string;
  sort: boolean;
};

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

  return combineResults(previousResult, fetchMoreResult, "applicationEvents");
};

const ApplicationEventDataLoader = ({
  applicationRound,
  filters,
  sort,
  sortChanged: onSortChanged,
}: Props): JSX.Element => {
  const { notifyError } = useNotification();

  let sortString;
  if (sort) {
    sortString = (sort?.sort ? "" : "-") + sort.field;
  }

  const { applicationStatus, ...queryFilters } = mapFilterParams(filters);

  const { fetchMore, loading, data } = useQuery<
    Query,
    QueryApplicationEventsArgs
  >(APPLICATIONS_EVENTS_QUERY, {
    skip: !applicationRound.pk,
    variables: {
      ...queryFilters,
      applicationRound: String(applicationRound.pk),
      offset: 0,
      first: LIST_PAGE_SIZE,
      orderBy: sortString,
    },
    onError: (err: ApolloError) => {
      notifyError(err.message);
    },
    fetchPolicy: "cache-and-network",
  });

  if (loading) {
    return <Loader />;
  }

  const applicationEvents = (data?.applicationEvents?.edges || [])
    .map((x) => x?.node)
    .filter((x): x is ApplicationEventType => x != null)
    .filter((x) =>
      applicationStatus.length > 0 && x.application?.status
        ? applicationStatus.find((a) => a === x.application?.status)
        : x.application?.status != null
    )
    .map((x) => appEventMapper(applicationRound, x));

  const totalCount = data?.applicationEvents?.totalCount ?? 0;
  const queryResultCount = data?.applicationEvents?.edges?.length ?? 0;
  const frontEndFilteredCount = Math.max(
    0,
    queryResultCount - applicationEvents.length
  );
  return (
    <>
      <ApplicationEventsTable
        applicationEvents={applicationEvents}
        sort={sort}
        sortChanged={onSortChanged}
      />
      <More
        key={applicationEvents.length}
        totalCount={Math.max(0, totalCount - frontEndFilteredCount)}
        count={applicationEvents.length}
        fetchMore={() =>
          fetchMore({
            variables: {
              offset: data?.applicationEvents?.edges.length,
            },
            updateQuery,
          })
        }
      />
    </>
  );
};

export default ApplicationEventDataLoader;
