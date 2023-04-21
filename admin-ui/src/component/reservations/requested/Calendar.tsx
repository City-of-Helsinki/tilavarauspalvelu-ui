import React, { useEffect, useState } from "react";
import CommonCalendar, { CalendarEvent } from "common/src/calendar/Calendar";
import { SLOTS_EVERY_HOUR } from "common/src/calendar/util";
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
  selected?: ReservationType;
  focusDate: Date;
  allowEditing?: boolean;
};

const Legends = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xl);
  padding: var(--spacing-m) 0;
`;

const Container = styled.div`
  .rbc-calendar {
    display: grid;
  }
  .rbc-event-label {
    font-weight: 700;
  }
`;

type WeekOptions = "day" | "week" | "month";

const isDateBetween = (d: Date, min: Date, max: Date) =>
  d.getTime() > min.getTime() && d.getTime() < max.getTime();

// Works just fine but events at 1:45 - 2:45 am which aren't really part of the calendar
// aren't considered so it seems to be broken.
const isOverlapping = (
  e: CalendarEvent<ReservationType>,
  events: CalendarEvent<ReservationType>[]
) => {
  const eventsAlreadyThere = events.filter(
    (x) =>
      isDateBetween(e.start, x.start, x.end) ||
      isDateBetween(e.end, x.start, x.end)
  );
  return eventsAlreadyThere.length > 0;
};

/// @param reservation the current reservation to show in calendar
/// @param selected (for recurring only) different styling
/// @param focusDate date to show in the calendar
const Calendar = ({
  reservationUnitPk,
  reservation,
  allowEditing,
  selected,
  focusDate: initialFocusDate,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [focusDate, setFocusDate] = useState(initialFocusDate);
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
  // TODO filter events that are outside the Calendar range because they are rendered incorrectly
  // e.g. 0 - 2 am and make a console warning for them
  // because they cause graphical artefacts and confusion when testing

  // FIXME onChange mutation (requires backend changes)

  // outside control of the calendar navigation
  useEffect(() => {
    if (initialFocusDate) {
      setFocusDate(initialFocusDate);
    }
  }, [initialFocusDate]);

  const handleEventChange = (e: CalendarEvent<ReservationType>) => {
    // TODO how to show this to the user?
    // TODO do an interval check (ReservationUnit specific 15, 30, 45, 90 minutes)
    // the backend mutation is impossible without it
    // real solution would be to snap the time to nearest interval?
    if (isOverlapping(e, events)) {
      // eslint-disable-next-line no-console
      console.error("can't move event because it overlaps");
    } else {
      // eslint-disable-next-line no-console
      console.warn("NOT implemented backend mutation: Should change time");
    }
  };

  const isThisReservation = (event?: ReservationType) =>
    event?.pk != null && event.pk === reservation.pk;

  const extraProps = allowEditing
    ? {
        // onSelectEvent: handleSelect,
        onEventDrop: handleEventChange,
        onEventResize: handleEventChange,
        // onSelectSlot: handleSlotClick,
        resizable: true,
        draggable: true,
        // both need to return true for us to be able to resize
        draggableAccessor: ({ event }: CalendarEvent<ReservationType>) =>
          isThisReservation(event),
        resizableAccessor: ({ event }: CalendarEvent<ReservationType>) =>
          isThisReservation(event),
        step: 30,
        timeslots: SLOTS_EVERY_HOUR,
        longPressThreshold: 100,
      }
    : {};

  // TODO the calendar is from 6am - 11pm (so anything outside that gets rendered at the edges)
  // either do something to the event data (filter) or allow for a larger calendar
  return (
    <Container>
      <CommonCalendar<ReservationType>
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
        {...extraProps}
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
