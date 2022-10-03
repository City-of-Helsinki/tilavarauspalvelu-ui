import React, { useState } from "react";
import CommonCalendar, { CalendarEvent } from "common/src/calendar/Calendar";
import { useQuery } from "@apollo/client";
import { get } from "lodash";
import { endOfISOWeek, startOfISOWeek } from "date-fns";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  Query,
  QueryReservationsArgs,
  ReservationType,
} from "../../../common/gql-types";
import eventStyleGetter from "./eventStyleGetter";
import { RESERVATIONS_BY_RESERVATIONUNIT } from "./queries";
import { useNotification } from "../../../context/NotificationContext";
import Legend from "./Legend";
import { reservationUrl } from "../../../common/urls";

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

const Calendar = ({
  begin,
  reservationUnitPk,
  reservation,
}: Props): JSX.Element => {
  const [events, setEvents] = useState([] as CalendarEvent<ReservationType>[]);
  const { notifyError } = useNotification();

  const { t } = useTranslation();

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
            title: `${
              r?.node?.reserveeOrganisationName ||
              `${r?.node?.reserveeFirstName || ""} ${
                r?.node?.reserveeLastName || ""
              }`
            }`,
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
    <Container>
      <CommonCalendar
        events={events}
        begin={startOfISOWeek(new Date(begin))}
        eventStyleGetter={eventStyleGetter(reservation)}
        onSelectEvent={(e) => {
          if (e.event?.pk !== reservation.pk) {
            window.open(reservationUrl(e.event?.pk as number), "_blank");
          }
        }}
      />
      <Legends>
        <Legend
          label={t("Calendar.legend.currentRequiresHandling")}
          color="var(  --tilavaraus-event-current-requires_handling-background)"
          border="2px dashed var(--tilavaraus-event-current-requires_handling-border-color)"
        />
        <Legend
          label={t("Calendar.legend.currentConfirmed")}
          color="var(--tilavaraus-event-current-confirmed-background)"
          border="2px dashed var(--tilavaraus-event-current-confirmed-border-color)"
        />
        <Legend
          label={t("Calendar.legend.currentDenied")}
          color="var(--tilavaraus-event-current-denied-background)"
          border="2px dashed var(--tilavaraus-event-current-denied-border-color)"
        />
        <Legend
          label={t("Calendar.legend.otherRequiedHandling")}
          color="var(--tilavaraus-event-other-requires_handling-background)"
          border="2px solid var(--tilavaraus-event-other-requires_handling-border-color)"
        />
        <Legend
          label={t("Calendar.legend.rest")}
          color="var(--tilavaraus-event-rest-background)"
          border="2px solid var(--tilavaraus-event-rest-border-color)"
        />
      </Legends>
    </Container>
  );
};

export default Calendar;
