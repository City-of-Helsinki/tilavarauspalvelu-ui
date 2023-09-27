import { Button, Tabs } from "hds-react";
import { debounce, uniqBy } from "lodash";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { gql, useQuery } from "@apollo/client";
import { H2 } from "common/src/common/typography";
import { Query } from "common/types/gql-types";
import { applicationRoundStatusFromRestToGql } from "app/component/applications/util";
import { BasicLink } from "@/styles/util";
import { ApplicationRound as RestApplicationRoundType } from "../../../common/types";
import { applicationRoundUrl } from "../../../common/urls";
import { Container } from "../../../styles/layout";
import StatusRecommendation from "../../applications/StatusRecommendation";
import BreadcrumbWrapper from "../../BreadcrumbWrapper";
import ApplicationRoundStatusTag from "../ApplicationRoundStatusTag";
import TimeframeStatus from "../TimeframeStatus";
import ApplicationDataLoader from "./ApplicationDataLoader";
import { Sort } from "./ApplicationsTable";
import Filters, {
  emptyFilterState,
  FilterArguments,
  type UnitPkName,
} from "./Filters";
import ApplicationEventDataLoader from "./ApplicationEventDataLoader";
import { GQL_MAX_RESULTS_PER_QUERY } from "../../../common/const";

interface IProps {
  applicationRound: RestApplicationRoundType;
}

const Header = styled.div`
  margin-top: var(--spacing-l);
`;

const RecommendationValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: var(--spacing-layout-m);
  margin-bottom: var(--spacing-l);
`;

const StyledH2 = styled(H2).attrs({ $legacy: true })`
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1;
`;

const TabContent = styled.div`
  display: grid;
  gap: var(--spacing-m);
  margin-top: var(--spacing-s);
  line-height: 1;
`;

export const NaviItem = styled(BasicLink)`
  &:first-of-type {
    margin-left: 0;
  }

  margin-left: 2rem;
`;

const APPLICATION_RESERVATION_UNITS_QUERY = gql`
  query reservationUnits($offset: Int, $count: Int, $pks: [ID]) {
    reservationUnits(
      onlyWithPermission: true
      offset: $offset
      first: $count
      pk: $pks
    ) {
      edges {
        node {
          unit {
            pk
            nameFi
          }
        }
      }
      totalCount
    }
  }
`;

function Review({ applicationRound }: IProps): JSX.Element | null {
  const [search, setSearch] = useState<FilterArguments>(emptyFilterState);
  const [sort, setSort] = useState<Sort>();
  const debouncedSearch = debounce((value) => setSearch(value), 300);
  const [unitPks, setUnitPks] = useState<UnitPkName[]>([]);

  const onSortChanged = (sortField: string) => {
    setSort({
      field: sortField,
      sort: sort?.field === sortField ? !sort?.sort : true,
    });
  };

  const { t } = useTranslation();

  // Copy-paste from ReservationUnitFilter (same issues etc.)
  useQuery<Query>(APPLICATION_RESERVATION_UNITS_QUERY, {
    variables: {
      offset: unitPks.length,
      count: GQL_MAX_RESULTS_PER_QUERY,
      pks: applicationRound.reservationUnitIds,
    },
    onCompleted: (data) => {
      const qd = data?.reservationUnits;
      if (qd?.edges.length != null && qd?.totalCount && qd?.edges.length > 0) {
        const ds =
          data?.reservationUnits?.edges
            ?.map((x) => x?.node?.unit)
            ?.map((x) =>
              x?.pk != null && x.nameFi != null
                ? { pk: x.pk, nameFi: x.nameFi }
                : null
            )
            ?.filter((x): x is UnitPkName => x != null) ?? [];
        setUnitPks(uniqBy([...unitPks, ...ds], (unit) => unit.pk));
      }
    },
  });

  return (
    <>
      <BreadcrumbWrapper
        route={[
          "recurring-reservations",
          "/recurring-reservations/application-rounds",
          "application-round",
        ]}
        aliases={[{ slug: "application-round", title: applicationRound.name }]}
      />
      <Container>
        <Header>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingBottom: "var(--spacing-m)",
            }}
          >
            <ApplicationRoundStatusTag
              status={applicationRoundStatusFromRestToGql(
                applicationRound.status
              )}
              start={new Date(applicationRound.applicationPeriodBegin)}
              end={new Date(applicationRound.applicationPeriodEnd)}
            />
            <div>
              <NaviItem
                to={`${applicationRoundUrl(applicationRound.id)}/criteria`}
              >
                {t("ApplicationRound.roundCriteria")}
              </NaviItem>
            </div>
          </div>

          <StyledH2>{applicationRound.name}</StyledH2>
          <TimeframeStatus
            applicationPeriodBegin={applicationRound.applicationPeriodBegin}
            applicationPeriodEnd={applicationRound.applicationPeriodEnd}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
            }}
          >
            <RecommendationValue>
              <StatusRecommendation
                status={applicationRound.status}
                applicationRound={applicationRound}
              />
            </RecommendationValue>
            <Button
              onClick={() => window.open(`${window.location}/allocation`)}
              disabled
            >
              {t("ApplicationRound.allocate")}
            </Button>
          </div>
        </Header>
        <Tabs>
          <Tabs.TabList>
            <Tabs.Tab>{t("ApplicationRound.applications")}</Tabs.Tab>
            <Tabs.Tab>{t("ApplicationRound.appliedReservations")}</Tabs.Tab>
          </Tabs.TabList>
          <Tabs.TabPanel>
            <TabContent>
              <Filters onSearch={debouncedSearch} units={unitPks} />
              <ApplicationDataLoader
                applicationRound={applicationRound}
                key={JSON.stringify({ ...search, ...sort })}
                filters={search}
                sort={sort}
                sortChanged={onSortChanged}
              />
            </TabContent>
          </Tabs.TabPanel>
          <Tabs.TabPanel>
            <TabContent>
              <Filters onSearch={debouncedSearch} units={unitPks} />
              <ApplicationEventDataLoader
                applicationRound={applicationRound}
                key={JSON.stringify({ ...search, ...sort })}
                filters={search}
                sort={sort}
                sortChanged={onSortChanged}
              />
            </TabContent>
          </Tabs.TabPanel>
        </Tabs>
      </Container>
    </>
  );
}

export default Review;
