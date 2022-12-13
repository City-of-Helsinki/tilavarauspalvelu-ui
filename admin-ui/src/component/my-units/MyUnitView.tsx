import React from "react";
import { useQuery } from "@apollo/client";
import { H1 } from "common/src/common/typography";
import { Tabs } from "hds-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { LocationType, Query, QueryUnitsArgs } from "common/types/gql-types";
import { publicUrl } from "../../common/const";
import { parseAddress } from "../../common/util";
import { useNotification } from "../../context/NotificationContext";
import { Container } from "../../styles/layout";
import BreadcrumbWrapper from "../BreadcrumbWrapper";
import withMainMenu from "../withMainMenu";
import { UNIT_QUERY } from "./queries";
import ReservationUnitCalendarView from "./ReservationUnitCalendarView";
import UnitReservationsView from "./UnitReservationsView";

type Params = {
  unitId: string;
  reservationUnitId: string;
};

const TabPanel = styled(Tabs.TabPanel)`
  margin-top: var(--spacing-s);
  padding-block: var(--spacing-m);
`;

const ExistingTabs = ["#unit-reservations", "#reservation-unit"];

const MyUnitView = () => {
  const { notifyError } = useNotification();
  const { unitId } = useParams<Params>();
  const history = useHistory();
  const { hash } = useLocation();
  const { t } = useTranslation();
  const initialSelectedTab = ExistingTabs.includes(hash)
    ? ExistingTabs.indexOf(hash)
    : undefined;

  const { loading, data: unitData } = useQuery<Query, QueryUnitsArgs>(
    UNIT_QUERY,
    {
      variables: {
        pk: [unitId],
        offset: 0,
      },
      onError: (err) => {
        notifyError(err.message);
      },
    }
  );

  const unit = unitData?.units?.edges[0];

  const onTabClick = (tabName: string) => {
    history.push(`#${tabName}`);
  };

  if (loading) return null;

  return (
    <>
      <BreadcrumbWrapper
        route={[`${publicUrl}/my-units`, "unit"]}
        aliases={[{ slug: "unit", title: unit?.node?.nameFi as string }]}
      />
      <Container>
        <div>
          <H1>{unit?.node?.nameFi}</H1>
          <p>{parseAddress(unit?.node?.location as LocationType)}</p>
        </div>
        <Tabs initiallyActiveTab={initialSelectedTab}>
          <Tabs.TabList>
            <Tabs.Tab onClick={() => onTabClick("unit-reservations")}>
              {t("MyUnits.UnitCalendar.tab")}
            </Tabs.Tab>
            <Tabs.Tab onClick={() => onTabClick("reservation-unit")}>
              {t("MyUnits.Calendar.tab")}
            </Tabs.Tab>
          </Tabs.TabList>
          <TabPanel>
            <UnitReservationsView />
          </TabPanel>
          <TabPanel>
            <ReservationUnitCalendarView />
          </TabPanel>
        </Tabs>
      </Container>
    </>
  );
};

export default withMainMenu(MyUnitView);
