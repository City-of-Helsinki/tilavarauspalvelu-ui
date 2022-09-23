import { CalendarEvent } from "common/src/calendar/Calendar";
import {
  ReservationsReservationStateChoices,
  ReservationType,
} from "../../../common/gql-types";

const eventStyleGetter =
  (currentReservation: ReservationType) =>
  ({
    event,
  }: CalendarEvent<ReservationType>): {
    style: React.CSSProperties;
    className?: string;
  } => {
    const style = {
      borderRadius: "0px",
      opacity: "0.8",
      color: "var(--color-white)",
      display: "block",
      borderColor: "transparent",
      padding: "2px",
    } as Record<string, string>;

    const state = event?.state.toLowerCase() as string;

    if (currentReservation.pk === event?.pk) {
      // reservees reservation
      style.backgroundColor = `var(--tilavaraus-event-own-${state}-background)`;
      style.color = `var(--tilavaraus-event-own-${state}-color)`;
      style.border = `2px dashed var(--tilavaraus-event-own-${state}-border-color)`;
    } else {
      // other reservations
      style.borderStyle = `2px solid`;
      if (event?.state === ReservationsReservationStateChoices.Confirmed) {
        style.background = `var(--tilavaraus-event-other-confirmed-background)`;
        style.color = `var(--tilavaraus-event-other-confirmed-${event?.state.toLowerCase()}-color)`;
        style.borderColor = `(--tilavaraus-event-other-confirmed-borderColor)`;
      } else {
        style.background = `var(--tilavaraus-event-other-background)`;
        style.color = `var(--tilavaraus-event-other-${event?.state.toLowerCase()}-color)`;
        style.borderColor = `(--tilavaraus-event-other-borderColor)`;
      }
    }

    return {
      style,
    };
  };

export default eventStyleGetter;
