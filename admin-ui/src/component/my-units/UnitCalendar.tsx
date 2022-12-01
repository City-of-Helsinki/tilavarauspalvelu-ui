import { CalendarEvent } from "common/src/calendar/Calendar";
import { breakpoints } from "common/src/common/style";
import {
  addMinutes,
  differenceInMinutes,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from "date-fns";
import React, { CSSProperties, Fragment } from "react";
import Popup from "reactjs-popup";
import styled from "styled-components";
import { ReservationType } from "common/types/gql-types";
import { TFunction, useTranslation } from "react-i18next";
import { CELL_BORDER } from "./const";
import ReservationPopupContent from "./ReservationPopupContent";
import resourceEventStyleGetter, {
  POST_PAUSE,
  PRE_PAUSE,
} from "./resourceEventStyleGetter";
import { useModal } from "../../context/ModalContext";
import CreateReservationModal from "./create-reservation/CreateReservationModal";

export type Resource = {
  title: string;
  pk: number;
  url: string;
  events: CalendarEvent<ReservationType>[];
};

const zIndex = "101";

const TemplateProps: CSSProperties = {
  zIndex,
  height: "41px",
  position: "absolute",
};

type EventStyleGetter = ({ event }: CalendarEvent<ReservationType>) => {
  style: React.CSSProperties;
  className?: string;
};

type Props = {
  resources: Resource[];
  date: Date;
};

const FlexContainer = styled.div<{ $numCols: number }>`
  display: flex;
  flex-direction: column;
  @media (min-width: ${breakpoints.m}) {
    min-width: calc(150px + ${({ $numCols }) => $numCols} * 35px);
  }
  min-width: calc(150px + ${({ $numCols }) => $numCols} * 40px);
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

const Cells = ({
  cols,
  reservationUnitId,
  date,
  setModalContent,
}: {
  cols: number;
  reservationUnitId: number;
  date: Date;
  setModalContent: (content: JSX.Element | null, isHds?: boolean) => void;
}) => (
  <CellContent $numCols={cols}>
    {Array.from(Array(cols).keys()).map((i) => (
      <Cell
        key={i}
        onClick={(e) => {
          e.preventDefault();
          setModalContent(
            <CreateReservationModal
              reservationUnitId={reservationUnitId}
              start={addMinutes(new Date(date), i * 30)}
              onClose={() => setModalContent(null)}
            />,
            true
          );
        }}
      />
    ))}
  </CellContent>
);

const getPreBuffer = (
  event: CalendarEvent<ReservationType>,
  hourPercent: number,
  left: string,
  t: TFunction
): JSX.Element | null => {
  const buffer = event.event?.reservationUnits?.[0]?.bufferTimeBefore;

  if (buffer) {
    const width = `${(hourPercent * buffer) / 3600}%`;
    return (
      <div
        style={{
          ...PRE_PAUSE.style,
          ...TemplateProps,
          left: `calc(${left} - ${width})`,
          width,
        }}
        title={t("MyUnits.UnitCalendar.legend.pause")}
      />
    );
  }
  return null;
};

const getPostBuffer = (
  event: CalendarEvent<ReservationType>,
  hourPercent: number,
  right: string,
  t: TFunction
): JSX.Element | null => {
  const buffer = event.event?.reservationUnits?.[0]?.bufferTimeAfter;

  if (buffer) {
    const width = `calc(${(hourPercent * buffer) / 3600}% - 1px)`;
    return (
      <div
        style={{
          ...POST_PAUSE.style,
          ...TemplateProps,
          left: right,
          width,
        }}
        title={t("MyUnits.UnitCalendar.legend.pause")}
      />
    );
  }
  return null;
};

const Events = ({
  currentReservationUnit,
  firstHour,
  events,
  eventStyleGetter,
  numHours,
  t,
}: {
  currentReservationUnit: number;
  firstHour: number;
  events: CalendarEvent<ReservationType>[];
  eventStyleGetter: EventStyleGetter;
  numHours: number;
  t: TFunction;
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

      let preBuffer = null;
      let postBuffer = null;
      if (currentReservationUnit === e.event?.reservationUnits?.[0]?.pk) {
        preBuffer = getPreBuffer(e, hourPercent, left, t);

        const right = `calc(${left} + ${durationMinutes / 60} * ${
          100 / numHours
        }% + 1px)`;
        postBuffer = getPostBuffer(e, hourPercent, right, t);
      }

      return [
        preBuffer,
        <div
          key={String(e.event?.pk)}
          style={{
            left,
            ...TemplateProps,
            width: `calc(${durationMinutes / 60} * ${100 / numHours}% + 1px)`,
          }}
        >
          <div
            style={{
              height: "100%",
              width: "100%",
              ...eventStyleGetter(e).style,
            }}
            title={e.title}
          >
            <Popup
              position={["right center", "left center"]}
              trigger={() => (
                <button
                  type="button"
                  style={{
                    background: "transparent",
                    cursor: "pointer",
                    border: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />
              )}
            >
              <ReservationPopupContent
                reservation={e.event as ReservationType}
              />
            </Popup>
          </div>
        </div>,
        postBuffer,
      ];
    })}
  </div>
);

const ResourceCalendar = ({ resources, date }: Props): JSX.Element => {
  const { t } = useTranslation();
  // todo find out min and max opening hour of every reservationunit
  const [beginHour, endHour] = [8, 24];
  const numHours = endHour - beginHour;

  const { setModalContent } = useModal();

  return (
    <>
      <FlexContainer $numCols={numHours * 2}>
        <HeadingRow>
          <div />
          <CellContent $numCols={numHours} key="header">
            {Array.from(Array(numHours).keys()).map((i, index) => (
              <Time key={i}>{beginHour + index}</Time>
            ))}
          </CellContent>
        </HeadingRow>
        {resources.map((row) => (
          <Row key={row.url}>
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
              <Cells
                cols={numHours * 2}
                reservationUnitId={row.pk}
                date={setMilliseconds(
                  setSeconds(setMinutes(setHours(date, beginHour), 0), 0),
                  0
                )}
                setModalContent={setModalContent}
              />
              <Events
                currentReservationUnit={row.pk}
                firstHour={beginHour}
                numHours={numHours}
                events={row.events}
                eventStyleGetter={resourceEventStyleGetter(row.pk)}
                t={t}
              />
            </RowCalendarArea>
          </Row>
        ))}
      </FlexContainer>
    </>
  );
};

export default ResourceCalendar;
