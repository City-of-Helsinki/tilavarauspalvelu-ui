import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  ApplicationEventStatus,
  ApplicationEventType,
  ApplicationType,
  ReservationUnitType,
} from "../../../common/gql-types";
import { H5 } from "../../../styles/new-typography";
import Accordion from "../../Accordion";
import AllocationCalendar from "./AllocationCalendar";
import ApplicationRoundAllocationActions from "./ApplicationRoundAllocationActions";
import ApplicationRoundApplicationApplicationEventGroupList from "./ApplicationRoundApplicationApplicationEventGroupList";

type Props = {
  applications: ApplicationType[];
  applicationEvents: ApplicationEventType[];
  reservationUnit: ReservationUnitType;
};

const Wrapper = styled.div`
  font-size: var(--fontsize-body-s);
  line-height: var(--lineheight-xl);
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: var(--spacing-l);
`;

const ApplicationEventList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: var(--spacing-s);
`;

const Heading = styled.div``;

const StyledH5 = styled(H5)`
  font-size: var(--fontsize-heading-xs);
`;

const ApplicationEvents = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledAccordion = styled(Accordion)`
  > div {
    font-size: var(--fontsize-heading-xxs);
    padding: 0;
  }

  p {
    margin-bottom: var(--spacing-3-xs);
  }
`;

const ApplicationRoundAllocationApplicationEvents = ({
  applications,
  applicationEvents,
  reservationUnit,
}: Props): JSX.Element | null => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);
  const [selectedApplicationEvent, setSelectedApplicationEvent] = useState<
    ApplicationEventType | undefined
  >(undefined);
  const [paintedApplicationEvents, setPaintedApplicationEvents] = useState<
    ApplicationEventType[]
  >([]);

  useEffect(
    () => setSelectedApplicationEvent(applicationEvents[0]),
    [reservationUnit, applicationEvents]
  );

  useEffect(() => setSelection([]), [selectedApplicationEvent]);

  useEffect(() => setSelection([]), [reservationUnit]);

  const allocatedApplicationEvents = applicationEvents.filter(
    (applicationEvent) =>
      [ApplicationEventStatus.Approved].includes(
        applicationEvent.status as ApplicationEventStatus
      )
  );

  // explicitly declined application events and those that are blocked from current reservation unit
  const declinedApplicationEvents = applicationEvents.filter(
    (applicationEvent) =>
      [ApplicationEventStatus.Declined].includes(
        applicationEvent.status as ApplicationEventStatus
      ) ||
      applicationEvent?.declinedReservationUnits?.some(
        (declinedReservationUnit) =>
          declinedReservationUnit.pk === reservationUnit.pk
      )
  );

  // take certain states and omit colliding application events
  const unallocatedApplicationEvents = applicationEvents.filter(
    (applicationEvent) =>
      [
        ApplicationEventStatus.Approved,
        ApplicationEventStatus.Created,
      ].includes(applicationEvent.status as ApplicationEventStatus) &&
      !allocatedApplicationEvents.find((n) => n.pk === applicationEvent.pk) &&
      !declinedApplicationEvents.find((n) => n.pk === applicationEvent.pk)
  );

  const paintApplicationEvents = (appEvents: ApplicationEventType[]) => {
    setPaintedApplicationEvents(appEvents);
  };

  return (
    <Wrapper>
      <Content>
        <ApplicationEventList>
          <Heading>
            <StyledH5>Hakijat</StyledH5>
            <p>Valitse hakija nähdäksesi hakijan toivomat ajat kalenterissa.</p>
          </Heading>
          <ApplicationEvents>
            <ApplicationRoundApplicationApplicationEventGroupList
              applicationEvents={unallocatedApplicationEvents}
              selectedApplicationEvent={selectedApplicationEvent}
              setSelectedApplicationEvent={setSelectedApplicationEvent}
              applications={applications}
              reservationUnit={reservationUnit}
              type="unallocated"
            />
            <StyledAccordion heading="Muut hakijat">
              <p>Vuoron saaneet</p>
              <ApplicationRoundApplicationApplicationEventGroupList
                applicationEvents={allocatedApplicationEvents}
                selectedApplicationEvent={selectedApplicationEvent}
                setSelectedApplicationEvent={setSelectedApplicationEvent}
                applications={applications}
                reservationUnit={reservationUnit}
                type="allocated"
              />
              <p>Hylätyt</p>
              <ApplicationRoundApplicationApplicationEventGroupList
                applicationEvents={declinedApplicationEvents}
                selectedApplicationEvent={selectedApplicationEvent}
                setSelectedApplicationEvent={setSelectedApplicationEvent}
                applications={applications}
                reservationUnit={reservationUnit}
                type="declined"
              />
            </StyledAccordion>
          </ApplicationEvents>
        </ApplicationEventList>
        <AllocationCalendar
          applicationEvents={applicationEvents}
          selectedApplicationEvent={selectedApplicationEvent}
          paintApplicationEvents={paintApplicationEvents}
          selection={selection}
          setSelection={setSelection}
          isSelecting={isSelecting}
          setIsSelecting={setIsSelecting}
        />
        <ApplicationRoundAllocationActions
          applications={applications}
          applicationEvents={applicationEvents}
          paintedApplicationEvents={paintedApplicationEvents}
          paintApplicationEvents={paintApplicationEvents}
          selection={selection}
          setSelection={setSelection}
          isSelecting={isSelecting}
        />
      </Content>
    </Wrapper>
  );
};

export default ApplicationRoundAllocationApplicationEvents;
