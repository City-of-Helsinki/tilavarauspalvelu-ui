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
  reservation?: ReservationType;
  selected?: ReservationType;
  forceNavigation?: unknown;
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

/// @param reservation the current reservation to show in calendar
/// @param selected (for recurring only) focus day change and different styling
/// @param forceNavigation can be used to force a focus day change
/// without using forceUpdate the calendar will not navigate to a selection unless it's value differs
/// from the previous value.
const Calendar = ({
  reservationUnitPk,
  reservation,
  selected,
  forceNavigation,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  // TODO focus day rules (check Jira)
  // if selected => show that
  // else if reservation is in the future => show that
  // else if reservation.recurrance has an event in the future => show that
  // else show today
  const [focusDate, setFocusDate] = useState(
    selected?.begin ? new Date(selected.begin) : new Date()
  );
  const [calendarViewType, setCalendarViewType] = useState<WeekOptions>("week");

  // No month view so always query the whole week even if a single day is selected
  // to avoid spamming queries and having to deal with start of day - end of day.
  // focus day can be in the middle of the week.
  const { events } = useReservationData(
    startOfISOWeek(focusDate),
    add(startOfISOWeek(focusDate), { days: 7 }),
    reservationUnitPk,
    reservation?.pk ?? undefined
  );

  // switch date when the selected reservation changes or forced to reset navigation
  useEffect(() => {
    if (selected) {
      setFocusDate(new Date(selected.begin));
    }
  }, [selected, forceNavigation]);

  // TODO the calendar is from 6am - 11pm (so anything outside that gets rendered at the edges)
  // either do something to the event data (filter) or allow for a larger calendar
  return (
    <Container>
      <CommonCalendar
        events={events}
        toolbarComponent={Toolbar}
        showToolbar
        begin={focusDate}
        eventStyleGetter={eventStyleGetter(reservation, selected)}
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
