import React from "react";
import { H1 } from "common/src/common/typography";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { LoadingSpinner } from "hds-react";
import { breakpoints } from "common/src/common/style";
import { publicUrl } from "../../common/const";
import { parseAddress } from "../../common/util";
import { Container } from "../../styles/layout";
import BreadcrumbWrapper from "../BreadcrumbWrapper";
import withMainMenu from "../withMainMenu";
import ReservationUnitCalendarView from "./ReservationUnitCalendarView";
import UnitReservationsView from "./UnitReservationsView";
import { TabHeader, TabPanel, Tabs } from "../Tabs";
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

  return (
    <>
      <BreadcrumbWrapper
        route={[`${publicUrl}/my-units`, "unit"]}
        aliases={[{ slug: "unit", title: unit.nameFi ?? "unnamed unit" }]}
      />
      <ContainerHack>
        <div>
          <H1 $legacy>{unit?.nameFi}</H1>
          {unit.location && (
            <LocationOnlyOnDesktop>
              {parseAddress(unit.location)}
            </LocationOnlyOnDesktop>
          )}
        </div>
        <Tabs headers={TabHeaders}>
          <TabPanel key="unit-reservations">
            <UnitReservationsView />
          </TabPanel>
          <TabPanel key="reservation-unit">
            <ReservationUnitCalendarView />
          </TabPanel>
        </Tabs>
      </ContainerHack>
    </>
  );
};

export default withMainMenu(MyUnitView);
