import { Button, Tabs } from "hds-react";
import { debounce } from "lodash";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { H2 } from "common/src/common/typography";
import { ApplicationRoundType } from "common/types/gql-types";
import { applicationRoundUrl } from "../../../common/urls";
import { Container } from "../../../styles/layout";
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
  display: grid;
  gap: var(--spacing-m);
  margin-top: var(--spacing-s);
  line-height: 1;
  & table {
    width: 100%;
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

  const units =
    applicationRound.reservationUnits
      ?.map((x) => x?.unit)
      ?.map((x) =>
        x?.pk && x?.nameFi ? { pk: x.pk, name: x.nameFi } : undefined
      )
      ?.filter((x): x is { pk: number; name: string } => x != null) ?? [];

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
              <Filters onSearch={debouncedSearch} units={units} />
              <ApplicationDataLoader
                applicationRound={applicationRound}
                filters={search}
                sort={sort}
                sortChanged={onSortChanged}
              />
            </TabContent>
          </Tabs.TabPanel>
          <Tabs.TabPanel>
            <TabContent>
              <Filters onSearch={debouncedSearch} units={units} />
              <ApplicationEventDataLoader
                applicationRound={applicationRound}
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

export default withMainMenu(Review);
