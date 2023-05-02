import { Button, Tabs } from "hds-react";
import { debounce } from "lodash";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { gql, useQuery } from "@apollo/client";
import { H2 } from "common/src/common/typography";
import { ApplicationRoundType, Query } from "common/types/gql-types";
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
  applicationRound: ApplicationRoundType;
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

const APPLICATION_RESERVATION_UNITS_QUERY = gql`
  query reservationUnits($pks: [ID]) {
    reservationUnits(onlyWithPermission: true, pk: $pks) {
      edges {
        node {
          unit {
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

  // TODO this query is needless if we can include it in the original applicationRound query
  const { data } = useQuery<Query>(APPLICATION_RESERVATION_UNITS_QUERY, {
    skip: !applicationRound.reservationUnits?.length,
    variables: {
      pks: applicationRound.reservationUnits?.map((x) => x?.pk),
    },
  });

  const unitPks =
    data?.reservationUnits?.edges
      ?.map((x) => x?.node?.unit?.pk)
      ?.filter((x): x is number => x != null) ?? [];

  // TODO translation
  const roundName = applicationRound.nameFi ?? "Ei nimeä";

  return (
    <>
      <BreadcrumbWrapper
        route={[
          "recurring-reservations",
          "/recurring-reservations/application-rounds",
          "application-round",
        ]}
        aliases={[{ slug: "application-round", title: roundName }]}
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
            <ApplicationRoundStatusTag applicationRound={applicationRound} />
            <div>
              <NaviItem
                to={`${applicationRoundUrl(applicationRound.pk ?? 0)}/criteria`}
              >
                {t("ApplicationRound.roundCriteria")}
              </NaviItem>
            </div>
          </div>

          <StyledH2>{applicationRound.nameFi}</StyledH2>
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
                reservationPeriodEnd={applicationRound.reservationPeriodEnd}
                name={roundName}
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
