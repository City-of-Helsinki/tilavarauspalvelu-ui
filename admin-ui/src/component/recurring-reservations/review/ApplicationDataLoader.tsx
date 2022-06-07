import React from "react";
import { ApolloError, useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { APPLICATIONS_QUERY } from "./queries";
import { FilterArguments } from "./Filters";
import { useNotification } from "../../../context/NotificationContext";
import Loader from "../../Loader";
import ApplicationsTable from "./ApplicationsTable";
import { More } from "../../reservation-units/More";
import { LIST_PAGE_SIZE } from "../../../common/const";
import {
  ApplicationType,
  ApplicationTypeConnection,
  ApplicationTypeEdge,
  Query,
  QueryApplicationsArgs,
} from "../../../common/gql-types";

import { appMapper } from "../util";
import { ApplicationRound } from "../../../common/types";

export type Sort = {
  field: string;
  sort: boolean;
};

type Props = {
  applicationRound: ApplicationRound;
  filters: FilterArguments;
  sort?: Sort;
  sortChanged: (field: string) => void;
};

const numberOrUndefined = (input?: string) =>
  input ? Number(input) : undefined;

const mapFilterParams = (params: FilterArguments) => ({
  ...params,
  maxPersonsLte: numberOrUndefined(params.maxPersonsLte),
  maxPersonsGte: numberOrUndefined(params.maxPersonsGte),
  surfaceAreaLte: numberOrUndefined(params.surfaceAreaLte),
  surfaceAreaGte: numberOrUndefined(params.surfaceAreaGte),
  unit: params.unit.map((u) => u.value as string),
  reservationUnitType: params.reservationUnitType.map((u) => u.value as string),
});

const updateQuery = (
  previousResult: Query,
  { fetchMoreResult }: { fetchMoreResult: Query }
): Query => {
  if (!fetchMoreResult) {
    return previousResult;
  }

  const prevApplications =
    previousResult.applications as ApplicationTypeConnection;

  return {
    ...previousResult,
    applications: {
      ...prevApplications,
      edges: (prevApplications.edges as ApplicationTypeEdge[]).concat(
        (fetchMoreResult.applications?.edges || []) as ApplicationTypeEdge[]
      ),
    },
  };
};

const ApplicationDataLoader = ({
  applicationRound,
  filters,
  sort,
  sortChanged: onSortChanged,
}: Props): JSX.Element => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();

  console.log("filters", mapFilterParams(filters));

  let sortString;
  if (sort) {
    sortString = (sort?.sort ? "" : "-") + sort.field;
  }

  console.log("sortString", sortString);

  const { fetchMore, loading, data } = useQuery<Query, QueryApplicationsArgs>(
    APPLICATIONS_QUERY,
    {
      variables: {
        applicationRound: String(applicationRound.id),
        offset: 0,
        first: LIST_PAGE_SIZE,
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

  const applications = (data?.applications?.edges || []).map((edge) =>
    appMapper(applicationRound, edge?.node as ApplicationType, t)
  );

  return (
    <>
      <ApplicationsTable
        applications={applications}
        sort={sort}
        sortChanged={onSortChanged}
      />
      <More
        key={applications.length}
        totalCount={data?.reservationUnits?.totalCount || 0}
        count={applications.length}
        fetchMore={() =>
          fetchMore({
            variables: {
              offset: data?.reservationUnits?.edges.length,
            },
            updateQuery,
          })
        }
      />
    </>
  );
};

export default ApplicationDataLoader;
