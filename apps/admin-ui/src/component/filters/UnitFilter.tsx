import { useEffect } from "react";
import { gql } from "@apollo/client";
import { useUnitsFilterQuery } from "@gql/gql-types";
import { filterNonNullable } from "common/src/helpers";

// exporting so it doesn't get removed
// TODO combine with other options queries so we only make a single request for all of them
export const UNITS_QUERY = gql`
  query UnitsFilter($after: String) {
    units(onlyWithPermission: true, after: $after) {
      edges {
        node {
          id
          nameFi
          pk
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
      totalCount
    }
  }
`;

export function useUnitFilterOptions() {
  const { data, loading, fetchMore } = useUnitsFilterQuery();

  // auto fetch more (there is no limit, expect number of them would be a few hundred, but in theory this might cause problems)
  // NOTE have to useEffect, onComplete stops at 200 items
  useEffect(() => {
    const { pageInfo } = data?.units ?? {};
    if (pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: pageInfo.endCursor,
        },
      });
    }
  }, [data, fetchMore]);

  const units = filterNonNullable(data?.units?.edges.map((x) => x?.node));

  const options = units.map((unit) => ({
    label: unit?.nameFi ?? "",
    value: unit?.pk ?? 0,
  }));

  return { options, loading };
}
