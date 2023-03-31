import React, { useState } from "react";
import CommonCalendar from "common/src/calendar/Calendar";
import { Toolbar } from "common/src/calendar/Toolbar";
import { useQuery } from "@apollo/client";
import { add, startOfISOWeek } from "date-fns";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  Query,
  QueryReservationsArgs,
  ReservationsReservationStateChoices,
  ReservationType,
} from "common/types/gql-types";
import eventStyleGetter, { legend } from "./eventStyleGetter";
import { RESERVATIONS_BY_RESERVATIONUNIT } from "./queries";
import { useNotification } from "../../../context/NotificationContext";
import Legend from "./Legend";

type Props = {
  begin: string;
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

// TODO this should be combined to the other version of it used when making a reservation
// TODO there might be an improved performance if we query minimum of 7 days always
const useReservationData = (
  begin: Date,
  end: Date,
  reservationUnitPk: string,
  reservationPk: number
) => {
  const { notifyError } = useNotification();

  const { data } = useQuery<Query, QueryReservationsArgs>(
    RESERVATIONS_BY_RESERVATIONUNIT,
    {
      variables: {
        reservationUnit: [reservationUnitPk],
        begin: begin.toISOString(),
        end: end.toISOString(),
      },
      onError: () => {
        notifyError("Varauksia ei voitu hakea");
      },
    }
  );

  const events =
    data?.reservations?.edges
      .map((e) => e?.node)
      .filter((r): r is ReservationType => r != null)
      .filter(
        (r) =>
          [
            ReservationsReservationStateChoices.Confirmed,
            ReservationsReservationStateChoices.RequiresHandling,
          ].includes(r.state) || r.pk === reservationPk
      )
      .map((r) => ({
        title: `${
          r.reserveeOrganisationName ||
          `${r.reserveeFirstName || ""} ${r.reserveeLastName || ""}`
        }`,
        event: r,
        // TODO use zod for datetime conversions
        start: new Date(r.begin),
        end: new Date(r.end),
      })) ?? [];

  return { events };
};

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
// TODO this is a dupe of ReservationUnitCalendar
// TODO there is an use example for CommonCalendar in ui/.../reservation-unit/[id]
const Calendar = ({
  begin,
  reservationUnitPk,
  reservation,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [focusDate, setFocusDate] = useState(startOfISOWeek(new Date(begin)));
  // TODO narrow the type to WeekOptions
  const [calendarViewType, setCalendarViewType] = useState<WeekOptions>("week");

  const { events } = useReservationData(
    focusDate,
    add(focusDate, { days: viewToDays(calendarViewType) }),
    reservationUnitPk,
    reservation.pk ?? 0
  );

  // TODO today button in the reservation calendar? should it instead be this reservation?
  // TODO check that the reservation / series is displayed properly (based on UI spect)
  //  currently seems that it's using default display rules
  return (
    <Container>
      <CommonCalendar
        events={events}
        toolbarComponent={Toolbar}
        showToolbar
        begin={focusDate}
        eventStyleGetter={eventStyleGetter(reservation)}
        /* TODO if we want to onSelect use router or use a Popup / Modal to show it
        onSelectEvent={(e) => {
          // TODO this is bad, use react-router for links
          if (e.event?.pk != null && e.event.pk !== reservation.pk) {
            window.open(reservationUrl(e.event.pk), "_blank");
          }
        }}
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
