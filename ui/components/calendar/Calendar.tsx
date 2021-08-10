import React from "react";
import styled from "styled-components";
import {
  addHours,
  endOfMonth,
  format,
  startOfWeek,
  getDay,
  startOfDay,
} from "date-fns";
import fi from "date-fns/locale/fi";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { useTranslation } from "react-i18next";
import { localizedValue, parseDate } from "../../modules/util";
import {
  ApplicationEvent,
  Reservation,
  ReservationUnit,
  PendingReservation,
} from "../../modules/types";
import Toolbar from "./Toolbar";

// EventPropGetter<T> = (event: T, start: stringOrDate, end: stringOrDate, isSelected: boolean) => React.HTMLAttributes<HTMLDivElement>;
export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  event: Reservation;
};

type Props = {
  reservations?: Reservation[] | PendingReservation[];
  begin: Date;
  applicationEvent?: ApplicationEvent;
  reservationUnit: ReservationUnit;
  viewType?: string;
  onNavigate?: (n: Date) => void;
  onView?: (n: string) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelecting?: ({ start, end }: CalendarEvent) => void;
  showToolbar?: boolean;
  reservable?: boolean;
};

export const eventStyleGetter = ({
  event,
}: CalendarEvent): React.HTMLAttributes<HTMLDivElement> => {
  const style = {
    borderRadius: "0px",
    opacity: "0.8",
    color: "var(--color-white)",
    display: "block",
  } as Record<string, string>;

  style.backgroundColor =
    event.state === "cancelled"
      ? "var(--color-error-dark)"
      : "var(--color-success-dark)";

  if (event.state === "cancelled") {
    style.textDecoration = "line-through";
  }

  return {
    style,
  };
};

const StyledCalendar = styled(BigCalendar)`
  .rbc-time-header {
    .rbc-time-header-gutter {
      z-index: 5;
      position: sticky;
      left: 0;
      background-color: var(--color-white);
    }

    .rbc-timeslot-group {
      background-color: var(--color-white);
    }

    .rbc-header {
      font-family: var(--font-regular);
      font-weight: 400;
      font-size: var(--fontsize-body-m);
      text-transform: capitalize;
      border-bottom: 0;
      padding: var(--spacing-2-xs) 0;
    }

    .rbc-allday-cell {
      display: none;
    }
  }

  &.view-week,
  &.view-day {
    &:after {
      content: "";
      display: block;
      box-shadow: 5px 0px 13px 0px rgb(0 0 0 / 15%);
      width: 69px;
      height: 733px;
      position: absolute;
      z-index: 20;
      bottom: 0px;
      left: 0px;
    }
  }

  &.view-day {
    &:after {
      height: 698px;
    }
  }

  &.view-week,
  &.view-month {
    .rbc-time-header,
    .rbc-time-content,
    .rbc-month-header,
    .rbc-month-row {
      min-width: 800px;
      overflow: visible;
    }
  }

  position: relative;
  margin-bottom: var(--spacing-l);

  .rbc-time-view,
  .rbc-month-view {
    background-color: var(--color-white);

    position: relative;
    overflow-x: scroll;
    width: 100%;
  }

  .rbc-month-view {
    .rbc-header {
      font-family: var(--font-regular);
      font-weight: 400;
      font-size: var(--fontsize-body-m);
      text-transform: capitalize;
      padding: var(--spacing-2-xs) 0;
    }

    .rbc-allday-cell {
      display: none;
    }

    .rbc-month-row {
      flex-basis: 100px;
    }
  }

  .rbc-time-gutter {
    z-index: 4;
    position: sticky;
    left: 0;

    .rbc-timeslot-group {
      background-color: var(--color-white);
    }

    .rbc-label {
      padding: 0 var(--spacing-s) 0 var(--spacing-s);
      position: relative;
      top: 3px;
      font-family: var(--font-regular);
      font-weight: 400;
      font-size: var(--fontsize-body-s);
    }
  }
`;

const locales = {
  fi,
};

const localizer = dateFnsLocalizer({
  format,
  parse: parseDate,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = ({
  reservations,
  applicationEvent,
  begin,
  reservationUnit,
  viewType = "week",
  onSelecting,
  onNavigate = () => {},
  onView = () => {},
  onSelectEvent = () => {},
  showToolbar = false,
  reservable = false,
}: Props): JSX.Element => {
  const { i18n, t } = useTranslation();

  return (
    <StyledCalendar
      culture={i18n.language}
      formats={{
        dayFormat: "EEEEEE d.M.",
      }}
      eventPropGetter={eventStyleGetter}
      events={reservations?.map((r) => {
        const event = {
          title: `${
            r.state === "cancelled"
              ? `${t("reservationCalendar:prefixForCancelled")}: `
              : ""
          } ${r?.name ? `${r.name}: ` : ""}${
            applicationEvent?.name ? `${applicationEvent.name}: ` : ""
          }${localizedValue(reservationUnit.name, i18n.language)}`,
          start: parseDate(r.begin),
          end: parseDate(r.end),
          allDay: false,
          event: r,
        };

        return event as CalendarEvent;
      })}
      date={begin}
      onNavigate={onNavigate}
      view={viewType}
      onView={onView}
      min={addHours(startOfDay(begin), 7)}
      max={endOfMonth(begin)}
      localizer={localizer}
      toolbar={showToolbar}
      views={["day", "week", "month"]}
      className={`view-${viewType}`}
      components={{ toolbar: Toolbar }}
      onSelecting={(calendarEvent: CalendarEvent) => onSelecting(calendarEvent)}
      selectable={reservable}
      onSelectEvent={(event: CalendarEvent) => {
        onSelectEvent(event);
      }}
    />
  );
};

export default Calendar;
