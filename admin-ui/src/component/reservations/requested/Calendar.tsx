import React, { useEffect, useState } from "react";
import CommonCalendar from "common/src/calendar/Calendar";
import { Toolbar } from "common/src/calendar/Toolbar";
import { add, startOfISOWeek } from "date-fns";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { type ReservationType } from "common/types/gql-types";
import eventStyleGetter, { legend } from "./eventStyleGetter";
import Legend from "./Legend";
import { useReservationData } from "./hooks";

type Props = {
  reservationUnitPk: string;
  reservation: ReservationType;
};

const Legends = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xl);
  padding: var(--spacing-m) 0;
`;

const Container = styled.div`
  .rbc-event-label {
    font-weight: 700;
  }
`;

type WeekOptions = "day" | "week" | "month";

const viewToDays = (view: string) => {
  if (view === "day") {
    return 1;
  }
  if (view === "month") {
    return 31;
  }
  if (view === "week") {
    return 7;
  }
  return 7;
};

const Calendar = ({ reservationUnitPk, reservation }: Props): JSX.Element => {
  const { t } = useTranslation();
  const [focusDate, setFocusDate] = useState(
    startOfISOWeek(
      reservation?.begin ? new Date(reservation?.begin) : new Date()
    )
  );
  const [calendarViewType, setCalendarViewType] = useState<WeekOptions>("week");

  const { events } = useReservationData(
    focusDate,
    add(focusDate, { days: viewToDays(calendarViewType) }),
    reservationUnitPk,
    reservation.pk ?? undefined
  );

  // switch date when the selected reservation changes
  useEffect(() => {
    if (reservation) {
      setFocusDate(new Date(reservation.begin));
    }
  }, [reservation]);

  // TODO the calendar is from 6am - 11pm (so anything outside that gets rendered at the edges)
  // either do something to the event data (filter) or allow for a larger calendar
  return (
    <Container>
      <CommonCalendar
        events={events}
        toolbarComponent={Toolbar}
        showToolbar
        begin={focusDate}
        eventStyleGetter={eventStyleGetter(reservation)}
        /* TODO if we want to onSelect use router or use a Popup / Modal to show it
        onSelectEvent={(e) => {}}}
        */
        onNavigate={(d: Date) => {
          setFocusDate(d);
        }}
        viewType={calendarViewType}
        onView={(n: string) => {
          if (["day", "week", "month"].includes(n)) {
            setCalendarViewType(n as "day" | "week" | "month");
          }
        }}
      />
      <Legends>
        {legend.map((l) => (
          <Legend key={l.label} style={l.style} label={t(l.label)} />
        ))}
      </Legends>{" "}
    </Container>
  );
};

export default Calendar;
