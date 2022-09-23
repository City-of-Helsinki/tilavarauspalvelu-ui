import React, { useState } from "react";
import CommonCalendar, { CalendarEvent } from "common/src/calendar/Calendar";
import { useQuery } from "@apollo/client";
import { get } from "lodash";
import { endOfISOWeek, startOfISOWeek } from "date-fns";
import {
  Query,
  QueryReservationsArgs,
  ReservationType,
} from "../../../common/gql-types";
import eventStyleGetter from "./eventStyleGetter";
import { RESERVATIONS_BY_RESERVATIONUNIT } from "./queries";
import { useNotification } from "../../../context/NotificationContext";

type Props = {
  begin: string;
  reservationUnitPk: string;
  reservation: ReservationType;
};
const Calendar = ({ begin, reservationUnitPk, reservation }: Props) => {
  const [events, setEvents] = useState([] as CalendarEvent<ReservationType>[]);
  const { notifyError } = useNotification();

  useQuery<Query, QueryReservationsArgs>(RESERVATIONS_BY_RESERVATIONUNIT, {
    fetchPolicy: "network-only",
    variables: {
      reservationUnit: [reservationUnitPk],
      begin: startOfISOWeek(new Date(begin)),
      end: endOfISOWeek(new Date(begin)),
    },
    onCompleted: ({ reservations }) => {
      if (reservations) {
        setEvents(
          (reservations?.edges || []).map((r) => ({
            title: `${r?.node?.pk}`,
            event: r?.node as ReservationType,
            start: new Date(get(r?.node, "begin")),
            end: new Date(get(r?.node, "end")),
          }))
        );
      }
    },
    onError: () => {
      notifyError("Varauksia ei voitu hakea");
    },
  });

  return (
    <CommonCalendar
      events={events}
      begin={startOfISOWeek(new Date(begin))}
      eventStyleGetter={eventStyleGetter(reservation)}
    />
  );
};

export default Calendar;
