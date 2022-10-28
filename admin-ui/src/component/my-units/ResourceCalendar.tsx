import { CalendarEvent } from "common/src/calendar/Calendar";
import { differenceInMinutes } from "date-fns";
import React, { Fragment } from "react";
import styled from "styled-components";
import { ReservationType } from "../../common/gql-types";
import { reservationUrl } from "../../common/urls";
import resourceEventStyleGetter from "./resourceEventStyleGetter";

export type Resource = {
  title: string;
  pk: number;
  url: string;
  events: CalendarEvent<ReservationType>[];
};

type EventStyleGetter = ({ event }: CalendarEvent<ReservationType>) => {
  style: React.CSSProperties;
  className?: string;
};

type Props = {
  resources: Resource[];
};

const CELL_BORDER = "1px solid var(--color-black-20)";

const FlexContainer = styled.div<{ $numCols: number }>`
  display: flex;
  flex-direction: column;
  min-width: calc(150px + ${({ $numCols }) => $numCols} * 35px);
  grid-gap: 0;
  border-bottom: ${CELL_BORDER};
`;

const ResourceNameContainer = styled.div`
  display: flex;
  align-items: center;
  border-top: ${CELL_BORDER};
  font-size: var(--fontsize-body-s);
`;

const HeadingRow = styled.div`
  height: 44px;
  display: grid;
  grid-template-columns: 150px 1fr;
  border-right: 1px solid transparent;
`;

const Time = styled.div`
  display: flex;
  align-items: center;
  border-left: ${CELL_BORDER};
  padding-left: 4px;
  font-size: var(--fontsize-body-s);
`;

const Row = styled(HeadingRow)`
  border-right: ${CELL_BORDER};
`;

const CellContent = styled.div<{ $numCols: number }>`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(${({ $numCols }) => $numCols}, 1fr);
  border-right: ${CELL_BORDER};
`;

const Cell = styled.div`
  height: 100%;
  width: 100%;
  border-left: ${CELL_BORDER};
  border-top: ${CELL_BORDER};
`;

const RowCalendarArea = styled.div`
  width: 100%;
  position: relative;
`;

const Cells = ({ cols }: { cols: number }) => (
  <CellContent $numCols={cols}>
    {Array.from(Array(cols).keys()).map((i) => (
      <Cell key={i} />
    ))}
  </CellContent>
);

const Events = ({
  firstHour,
  events,
  eventStyleGetter,
  numHours,
}: {
  firstHour: number;
  events: CalendarEvent<ReservationType>[];
  eventStyleGetter: EventStyleGetter;
  numHours: number;
}) => (
  <div
    style={{
      position: "absolute",
      width: "100%",
      top: 0,
      left: 0,
    }}
  >
    {events.map((e) => {
      const openReservation = () =>
        window.open(reservationUrl(e.event?.pk as number), "_blank");

      const startDate = new Date(e.start);
      const endDate = new Date(e.end);
      const dayStartDate = new Date(e.start);
      dayStartDate.setHours(firstHour);
      dayStartDate.setMinutes(0);
      dayStartDate.setSeconds(0);

      const startMinutes = differenceInMinutes(startDate, dayStartDate);

      const hourPercent = 100 / numHours;
      const hours = startMinutes / 60;
      const left = `${hourPercent * hours}%`;

      const durationMinutes = differenceInMinutes(endDate, startDate);

      return (
        <div
          style={{
            zIndex: "1000",
            height: "41px",
            position: "absolute",
            left,
            width: `calc(${durationMinutes / 60} * ${100 / numHours}% + 1px)`,
          }}
        >
          <div
            style={{
              height: "100%",
              width: "100%",
              ...eventStyleGetter(e).style,
            }}
            title={e.title || "no title"}
            onClick={openReservation}
            onKeyPress={openReservation}
            role="button"
            tabIndex={0}
          />
        </div>
      );
    })}
  </div>
);

const ResourceCalendar = ({ resources }: Props): JSX.Element => {
  // todo find out min and max opening hour of every reservationunit
  const [beginHour, endHour] = [8, 24];
  const numHours = endHour - beginHour;

  return (
    <>
      <FlexContainer $numCols={numHours * 2}>
        <HeadingRow>
          <div />
          <CellContent $numCols={numHours}>
            {Array.from(Array(numHours).keys()).map((i, index) => (
              <Time>{beginHour + index}</Time>
            ))}
          </CellContent>
        </HeadingRow>
        {resources.map((row) => (
          <Fragment key={row.url}>
            <Row>
              <ResourceNameContainer title={row.title}>
                <div
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {row.title}
                </div>
              </ResourceNameContainer>
              <RowCalendarArea>
                <Cells cols={numHours * 2} />
                <Events
                  firstHour={beginHour}
                  numHours={numHours}
                  events={row.events}
                  eventStyleGetter={resourceEventStyleGetter(row.pk)}
                />
              </RowCalendarArea>
            </Row>
          </Fragment>
        ))}
      </FlexContainer>
    </>
  );
};

export default ResourceCalendar;
