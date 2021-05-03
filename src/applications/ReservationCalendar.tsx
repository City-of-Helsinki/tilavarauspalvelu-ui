import { endOfMonth, format, getDay } from 'date-fns';
import { startOfMonth } from 'date-fns/esm';
import fi from 'date-fns/locale/fi';
import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ApplicationEvent, Reservation } from '../common/types';
import { localizedValue, parseDate, startOfWeek } from '../common/util';

const locales = {
  fi,
};

type Props = {
  reservations?: Reservation[];
  begin: Date;
  applicationEvent: ApplicationEvent;
};

const Container = styled.div`
  margin-top: var(--spacing-m);
`;

const eventStyleGetter = (event: { reservation: Reservation }) => {
  const style = {
    borderRadius: '0px',
    opacity: 0.8,
    color: 'black',
    display: 'block',
  } as React.CSSProperties;

  const colors = ['var(--color-copper)', 'var(--color-tram)'];
  const { reservation } = event;
  style.backgroundColor =
    colors[reservation.reservationUnit?.[0].id % colors.length];
  if (reservation.state === 'cancelled') {
    style.textDecoration = 'line-through';
  }

  return {
    style,
  };
};

const ReservationCalendar = ({
  begin,
  reservations,
  applicationEvent,
}: Props): JSX.Element | null => {
  const localizer = dateFnsLocalizer({
    format,
    parse: parseDate,
    startOfWeek,
    getDay,
    locales,
  });
  const { i18n } = useTranslation();

  return (
    <Container>
      <Calendar
        culture="fi"
        formats={{}}
        eventPropGetter={eventStyleGetter}
        events={reservations?.map((r) => {
          const event = {
            title: `${applicationEvent.name}: ${localizedValue(
              r.reservationUnit?.[0].name,
              i18n.language
            )}`,
            start: parseDate(r.begin),
            end: parseDate(r.end),
            allDay: false,
            reservation: r,
          };

          return event;
        })}
        date={begin}
        view="week"
        min={startOfMonth(begin)}
        max={endOfMonth(begin)}
        localizer={localizer}
        toolbar={false}
      />
    </Container>
  );
};

export default ReservationCalendar;
