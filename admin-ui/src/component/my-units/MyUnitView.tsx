import React from "react";
import { H1 } from "common/src/common/typography";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Button, LoadingSpinner, Tabs as HDSTabs } from "hds-react";
import { breakpoints } from "common/src/common/style";
import { publicUrl } from "../../common/const";
import { parseAddress } from "../../common/util";
import { Container } from "../../styles/layout";
import BreadcrumbWrapper from "../BreadcrumbWrapper";
import withMainMenu from "../withMainMenu";
import { myUnitUrl } from "../../common/urls";
import { BasicLink } from "../../styles/util";
import ReservationUnitCalendarView from "./ReservationUnitCalendarView";
import UnitReservationsView from "./UnitReservationsView";
import { TabHeader, Tabs } from "../Tabs";
import { useUnitQuery } from "./hooks";

type Params = {
  unitId: string;
  reservationUnitId: string;
};

// HDS tabs aren't responsive inside a grid container
// flex and block cause problems on other pages (tables overflowing).
const ContainerHack = styled(Container)`
  display: block;
`;

const LocationOnlyOnDesktop = styled.p`
  @media (max-width: ${breakpoints.s}) {
    display: none;
  }
`;

const ContainerWithSpacing = styled.div`
  margin: var(--spacing-s) 0;
  @media (min-width: ${breakpoints.m}) {
    margin: var(--spacing-m) 0;
  }
`;

// NOTE overflow-x if the 1st isn't grid and 2nd block
const TabPanel = styled(HDSTabs.TabPanel)`
  padding-block: var(--spacing-m);
`;
const TabPanel1 = styled(TabPanel)`
  & > div {
    display: grid;
  }
`;

const MyUnitView = () => {
  const { unitId } = useParams<Params>();
  const { t } = useTranslation();

  const TabHeaders: TabHeader[] = [
    {
      key: "unit-reservations",
      label: `${t("MyUnits.Calendar.Tabs.byReservationUnit")}`,
    },
    {
      key: "reservation-unit",
      label: `${t("MyUnits.Calendar.Tabs.byUnit")}`,
    },
  ];

  const { loading, data: unitData } = useUnitQuery(unitId);

  const unit = unitData?.units?.edges.find(() => true)?.node ?? undefined;

  if (loading || !unit) {
    return <LoadingSpinner />;
  }

  // NOTE This should never happen but the code should be restructured so it can't happen
  const recurringReservationUrl =
    unitId != null
      ? `${myUnitUrl(parseInt(unitId, 10))}/recurring-reservation`
      : null;

  return (
    <>
      <BreadcrumbWrapper
        route={[`${publicUrl}/my-units`, "unit"]}
        aliases={[{ slug: "unit", title: unit.nameFi ?? "unnamed unit" }]}
      />
      <ContainerHack>
        <ContainerWithSpacing>
          <H1 $legacy>{unit?.nameFi}</H1>
          {unit.location && (
            <LocationOnlyOnDesktop>
              {parseAddress(unit.location)}
            </LocationOnlyOnDesktop>
          )}
        </ContainerWithSpacing>
        <ContainerWithSpacing>
          <BasicLink to={recurringReservationUrl ?? ""}>
            <Button
              disabled={!recurringReservationUrl}
              variant="secondary"
              theme="black"
              size="small"
            >
              {t("MyUnits.Calendar.header.recurringReservation")}
            </Button>
          </BasicLink>
        </ContainerWithSpacing>
        <Tabs headers={TabHeaders}>
          <TabPanel1 key="unit-reservations">
            <UnitReservationsView />
          </TabPanel1>
          <TabPanel key="reservation-unit">
            <ReservationUnitCalendarView />
          </TabPanel>
        </Tabs>
      </ContainerHack>
    </>
  );
};

export default withMainMenu(MyUnitView);
