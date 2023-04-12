import { Button, Tabs } from "hds-react";
import { debounce } from "lodash";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { gql, useQuery } from "@apollo/client";
import { H2 } from "common/src/common/typography";
import { ApplicationRoundType, Query } from "common/types/gql-types";
import { ApplicationRound as RestApplicationRoundType } from "../../../common/types";
import { applicationRoundUrl } from "../../../common/urls";
import { Container, VerticalFlex } from "../../../styles/layout";
import StatusRecommendation from "../../applications/StatusRecommendation";
import BreadcrumbWrapper from "../../BreadcrumbWrapper";
import withMainMenu from "../../withMainMenu";
import { NaviItem } from "../ApplicationRoundNavi";
import ApplicationRoundStatusTag from "../ApplicationRoundStatusTag";
import TimeframeStatus from "../TimeframeStatus";
import ApplicationDataLoader from "./ApplicationDataLoader";
import { Sort } from "./ApplicationsTable";
import Filters, { emptyFilterState, FilterArguments } from "./Filters";
import ApplicationEventDataLoader from "./ApplicationEventDataLoader";

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
  display: flex;
  flex-direction: column;
  gap: var(--spacing-m);
  margin-top: var(--spacing-s);
  line-height: 1;
`;

// TODO this and the Filter query can be simplified into a single query here
// (pass the nameFi + pk to Filter)
// we need to use this query here because we know the reservationUnit not the unit
// but the filter is for unit selector
const APPLICATION_RESERVATION_UNITS_QUERY = gql`
  query reservationUnits($pks: [ID]) {
    reservationUnits(onlyWithPermission: true, pk: $pks) {
      edges {
        node {
          unit {
            nameFi
            pk
          }
        }
      }
    }
  }
`;

function Review({ applicationRound }: IProps): JSX.Element | null {
  const [search, setSearch] = useState<FilterArguments>(emptyFilterState);
  const [sort, setSort] = useState<Sort>();
  const debouncedSearch = debounce((value) => setSearch(value), 300);

  const onSortChanged = (sortField: string) => {
    setSort({
      field: sortField,
      sort: sort?.field === sortField ? !sort?.sort : true,
    });
  };

  const { t } = useTranslation();

  const { data } = useQuery<Query>(APPLICATION_RESERVATION_UNITS_QUERY, {
    variables: {
      pks: applicationRound.reservationUnitIds,
    },
  });

  const unitPks =
    data?.reservationUnits?.edges
      ?.map((x) => x?.node?.unit?.pk)
      ?.filter((x): x is number => x != null) ?? [];

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
              applicationRound={
                applicationRound as unknown as ApplicationRoundType
              }
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
                status="in_review"
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
              <VerticalFlex>
                <Filters onSearch={debouncedSearch} unitPks={unitPks} />
                <ApplicationDataLoader
                  applicationRound={applicationRound}
                  key={JSON.stringify({ ...search, ...sort })}
                  filters={search}
                  sort={sort}
                  sortChanged={onSortChanged}
                />
              </VerticalFlex>
            </TabContent>
          </Tabs.TabPanel>
          <Tabs.TabPanel>
            <TabContent>
              <VerticalFlex>
                <Filters onSearch={debouncedSearch} unitPks={unitPks} />
                <ApplicationEventDataLoader
                  applicationRound={applicationRound}
                  key={JSON.stringify({ ...search, ...sort })}
                  filters={search}
                  sort={sort}
                  sortChanged={onSortChanged}
                />
              </VerticalFlex>
            </TabContent>
          </Tabs.TabPanel>
        </Tabs>
      </Container>
    </>
  );
}

export default withMainMenu(Review);
