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

const mapFilterParamsOverride = (params: FilterArguments) => ({
  ...mapFilterParams(params),
  // Using same reducer but queries have String instead of [String] as state
  // TODO problem with this is that it does not allow the use of buckets
  // TODO this also doesn't allow us to filter out the Cancelled, Draft, Expired states
  // undefined returns all events
  applicationStatus: params.applicationStatus.find(() => true)?.value,
});

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

  const { fetchMore, loading, data } = useQuery<
    Query,
    QueryApplicationEventsArgs
  >(APPLICATIONS_EVENTS_QUERY, {
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
  });

  if (loading) {
    return <Loader />;
  }

  const applicationEvents = (data?.applicationEvents?.edges || [])
    .map((x) => x?.node)
    .filter((x): x is ApplicationEventType => x != null)
    .map((x) => appEventMapper(applicationRound, x));

  return (
    <>
      <ApplicationEventsTable
        applicationEvents={applicationEvents}
        sort={sort}
        sortChanged={onSortChanged}
      />
      <More
        key={applicationEvents.length}
        totalCount={data?.applicationEvents?.totalCount || 0}
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
