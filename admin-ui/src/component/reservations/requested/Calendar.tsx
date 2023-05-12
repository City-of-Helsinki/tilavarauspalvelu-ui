import React, { useEffect, useState } from "react";
import CommonCalendar, { CalendarEvent } from "common/src/calendar/Calendar";
import { SLOTS_EVERY_HOUR } from "common/src/calendar/util";
import { Toolbar } from "common/src/calendar/Toolbar";
import {
  add,
  addMilliseconds,
  differenceInMilliseconds,
  startOfISOWeek,
} from "date-fns";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { type ReservationType } from "common/types/gql-types";
import eventStyleGetter, { legend } from "./eventStyleGetter";
import Legend from "./Legend";
import { useReservationData, convertReservationToCalendarEvent } from "./hooks";

type Props = {
  reservationUnitPk: string;
  reservation: ReservationType;
  selected?: ReservationType;
  focusDate: Date;
  bottomContent?: React.ReactNode;
  allowEditing?: boolean;
  onChange?: (begin: Date, end: Date) => void;
  forceUpdate?: unknown;
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
  bottomContent,
  allowEditing,
  selected,
  focusDate: initialFocusDate,
  onChange,
  forceUpdate,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [focusDate, setFocusDate] = useState(initialFocusDate);
  const [calendarViewType, setCalendarViewType] = useState<WeekOptions>("week");

  // No month view so always query the whole week even if a single day is selected
  // to avoid spamming queries and having to deal with start of day - end of day.
  // focus day can be in the middle of the week.
  const { events: eventsAll, refetch } = useReservationData(
    startOfISOWeek(focusDate),
    add(startOfISOWeek(focusDate), { days: 7 }),
    reservationUnitPk,
    reservation?.pk ?? undefined
  );

  useEffect(() => {
    refetch();
  }, [forceUpdate, refetch]);

  // Because the calendar is fixed to 6 - 24 interval anything outside it causes rendering
  // artefacts and is not usable. Filter them and note it in console for now.
  // TODO this is common problem in the UI
  // can be removed if and when scroll is added to the Calendar
  const isInsideCalendarRange = (x: { start: Date; end: Date }) =>
    x.start.getHours() >= 6 && x.end.getHours() >= 6;
  const events = eventsAll
    .filter(isInsideCalendarRange)
    // TODO add this because we need to change the current reservation time without backend
    // filter out the current even for edit mode
    .filter((x) => x.event.pk !== reservation.pk);
  const notIncludedEvents = eventsAll.filter((x) => !isInsideCalendarRange(x));
  if (notIncludedEvents.length > 0) {
    // eslint-disable-next-line no-console
    console.log("Events not shown in the calendar: ", notIncludedEvents);
  }

  // FIXME onChange mutation (requires backend changes)

  // outside control of the calendar navigation

  // switch date when the selected reservation changes
  useEffect(() => {
    if (initialFocusDate) {
      setFocusDate(initialFocusDate);
    }
  }, [initialFocusDate]);

  // Move the event on resize and drag-n-drop
  const handleEventChange = (e: CalendarEvent<ReservationType>) => {
    // TODO do an interval check (ReservationUnit specific 15, 30, 45, 90 minutes)
    // the backend mutation is impossible without it
    // real solution would be to snap the time to nearest interval?
    /* Overlapping needs a more complex check not including the reservation itself
    if (isOverlapping(e, events)) {
      // eslint-disable-next-line no-console
      console.error("can't move event because it overlaps");
    } else {
    */
    // eslint-disable-next-line no-console
    if (onChange) {
      onChange(e.start, e.end);
    }
  };

  // Move the event on click
  const handleEventClick = ({
    start,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    action,
  }: {
    start: Date;
    action: "click" | "doubleClick" | "select";
  }) => {
    const diff = differenceInMilliseconds(
      new Date(reservation.end),
      new Date(reservation.begin)
    );
    const end = addMilliseconds(start, diff);
    if (onChange) {
      onChange(start, end);
    }
  };

  const isThisReservation = (event?: ReservationType) =>
    event?.pk != null && event.pk === reservation.pk;

  const extraProps = allowEditing
    ? {
        onEventDrop: handleEventChange,
        onEventResize: handleEventChange,
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

  const eventsToDisplay = [
    ...events,
    convertReservationToCalendarEvent(reservation),
  ];

  return (
    <Container>
      <CommonCalendar<ReservationType>
        events={eventsToDisplay}
        toolbarComponent={Toolbar}
        showToolbar
        begin={focusDate}
        eventStyleGetter={eventStyleGetter(reservation, selected)}
        reservable
        resizable
        onSelectSlot={(e) => {
          handleEventClick(e);
        }}
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
      {bottomContent}
      <Legends>
        {legend.map((l) => (
          <Legend key={l.label} style={l.style} label={t(l.label)} />
        ))}
      </Legends>{" "}
    </Container>
  );
};

export default Calendar;
