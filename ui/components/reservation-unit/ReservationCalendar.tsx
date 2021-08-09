import React from "react";
import styled from "styled-components";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import fi from "date-fns/locale/fi";
import { useTranslation } from "react-i18next";
import { addHours, endOfMonth, format, getDay } from "date-fns";
import { Reservation, ReservationUnit } from "../../modules/types";
import { CalendarEvent, eventStyleGetter } from "../calendar/Calendar";
import { localizedValue, parseDate, startOfWeek } from "../../modules/util";

const locales = { fi };

type Props = {
  reservations: Reservation[];
  begin: Date;
  reservationUnit: ReservationUnit;
};

const Wrapper = styled.div`
  margin-bottom: var(--spacing-m);
`;

const ReservationCalendar = ({
  reservations,
  begin,
  reservationUnit,
}: Props): JSX.Element => {
  const localizer = dateFnsLocalizer({
    format,
    parse: parseDate,
    startOfWeek,
    getDay,
    locales,
  });

  const { i18n, t } = useTranslation();

  return (
    <Wrapper>
      <Calendar
        culture={i18n.language}
        formats={{ dayFormat: "EEEEEE d.M.yyyy" }}
        eventPropGetter={eventStyleGetter}
        events={reservations?.map((r) => {
          const event = {
            title: `${
              r.state === "cancelled"
                ? `${t("reservationCalendar:prefixForCancelled")}: `
                : ""
            } ${localizedValue(reservationUnit.name, i18n.language)}`,
            start: parseDate(r.begin),
            end: parseDate(r.end),
            allDay: false,
            event: r,
          };

          return event as CalendarEvent;
        })}
        date={begin}
        onNavigate={() => {}}
        view="week"
        onView={() => {}}
        min={addHours(begin, 7)}
        max={endOfMonth(begin)}
        localizer={localizer}
        toolbar={false}
      />
    </Wrapper>
  );
};

export default ReservationCalendar;
