import React, { useEffect, useState } from "react";
import CommonCalendar, { CalendarEvent } from "common/src/calendar/Calendar";
import { Toolbar } from "common/src/calendar/Toolbar";
import { useQuery } from "@apollo/client";
import { startOfISOWeek } from "date-fns";
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
import { reservationUrl } from "../../../common/urls";
import { combineResults } from "../../../common/util";

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

const updateQuery = (
  previousResult: Query,
  { fetchMoreResult }: { fetchMoreResult: Query }
): Query => {
  if (!fetchMoreResult) {
    return previousResult;
  }

  return combineResults(previousResult, fetchMoreResult, "reservations");
};

// TODO this hook is really scetchy
// reduce complexity by dropping the states, just make sure it't not called that much
// the query is sus
// why are we filtering on the frontend instead of doing double request inside a single query (two gql tables in one fetch)?
// we are we using fetchMore on a loop; why not fetch a full day / week / month in a single query
// TODO this should be combined to the other version of it used when making a reservation
const useReservationData = (
  begin: string,
  reservationUnitPk: string,
  reservationPk: number
) => {
  const [events, setEvents] = useState<CalendarEvent<ReservationType>[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const { notifyError } = useNotification();

  const { fetchMore } = useQuery<Query, QueryReservationsArgs>(
    RESERVATIONS_BY_RESERVATIONUNIT,
    {
      fetchPolicy: "network-only",
      variables: {
        offset: 0,
        first: 100,
        reservationUnit: [reservationUnitPk],
        begin,
        end: begin,
      },
      onCompleted: ({ reservations }) => {
        if (reservations) {
          const formattedReservations: CalendarEvent<ReservationType>[] =
            reservations?.edges
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
              }));

          setEvents(formattedReservations);

          if (reservations.pageInfo.hasNextPage) {
            setHasMore(true);
          }
        }
      },
      onError: () => {
        notifyError("Varauksia ei voitu hakea");
      },
    }
  );

  useEffect(() => {
    if (hasMore) {
      setHasMore(false);
      fetchMore({
        variables: {
          offset: events.length,
        },
        updateQuery,
      });
    }
  }, [events.length, fetchMore, hasMore, setHasMore]);

  return { fetchMore, events, hasMore };
};

// TODO this is a dupe of ReservationUnitCalendar
// TODO there is a common version in common/Calendar
// TODO there is an use example for CommonCalendar in ui/.../reservation-unit/[id]
// type WeekOptions = "day" | "week" | "month";
// TODO this also does a full rerender on day swtiches unlike NextJs version
const Calendar = ({
  begin,
  reservationUnitPk,
  reservation,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [focusDate, setFocusDate] = useState(startOfISOWeek(new Date(begin)));
  // TODO narrow the type to WeekOptions
  const [calendarViewType, setCalendarViewType] = useState<string>("week");

  const { events } = useReservationData(
    begin,
    reservationUnitPk,
    reservation.pk ?? 0
  );

  return (
    <Container>
      <CommonCalendar
        events={events}
        toolbarComponent={Toolbar}
        showToolbar
        begin={focusDate}
        eventStyleGetter={eventStyleGetter(reservation)}
        onSelectEvent={(e) => {
          // TODO this is bad, use react-router for links
          if (e.event?.pk != null && e.event.pk !== reservation.pk) {
            window.open(reservationUrl(e.event.pk), "_blank");
          }
        }}
        onNavigate={(d: Date) => {
          setFocusDate(d);
        }}
        viewType={calendarViewType}
        onView={(n: string) => {
          setCalendarViewType(n);
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
