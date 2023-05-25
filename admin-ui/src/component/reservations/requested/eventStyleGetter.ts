import { CalendarEvent } from "common/src/calendar/Calendar";
import {
  ReservationsReservationStateChoices,
  ReservationType,
} from "common/types/gql-types";

const SELECTED = {
  style: {
    outline: "2px solid var(--color-bus)",
    outlineOffset: "3px",
  },
};

const STYLE_COMMON = {
  borderStyle: "solid",
  borderWidth: "0px 0px 0px 3px",
  color: "black",
};

const CONFIRMED = {
  style: {
    ...STYLE_COMMON,
    background: "var(--tilavaraus-event-booking-success)",
    borderColor: "var(--tilavaraus-event-booking-success-border)",
  },
};

const UNCONFIRMED = {
  style: {
    ...STYLE_COMMON,
    borderColor: "var(--tilavaraus-event-booking-wish-border)",
    backgroundColor: "var(--tilavaraus-event-booking-wish)",
  },
};
const REQUIRES_HANDLING = UNCONFIRMED;

const WAITING_PAYMENT = {
  style: {
    ...CONFIRMED.style,
    borderStyle: "dashed",
  },
};

const STAFF_RESERVATION = {
  style: {
    ...STYLE_COMMON,
    borderColor: "var(--tilavaraus-event-booking-internal-border)",
    background: "var(--tilavaraus-event-booking-internal)",
  },
};

const REST = {
  style: {
    background: `var(--tilavaraus-event-rest-background)`,
    color: `black`,
    borderColor: `var(--tilavaraus-event-rest-border-color)`,
    borderStyle: "solid",
    borderWidth: "0px 0px 0px 3px",
  },
};

export const legend = [
  {
    label: "Calendar.legend.confirmed",
    style: CONFIRMED.style,
  },
  {
    label: "MyUnits.Calendar.legend.waitingPayment",
    style: WAITING_PAYMENT.style,
  },
  {
    label: "Calendar.legend.unconfirmed",
    style: REQUIRES_HANDLING.style,
  },
  {
    label: "MyUnits.Calendar.legend.staffReservation",
    style: STAFF_RESERVATION.style,
  },
  {
    label: "Calendar.legend.rest",
    style: REST.style,
  },
];

const eventStyleGetter =
  (
    currentReservation?: ReservationType,
    selectedReservation?: ReservationType
  ) =>
  ({
    event,
  }: CalendarEvent<ReservationType>): {
    style: React.CSSProperties;
    className?: string;
  } => {
    const style = {
      cursor: "pointer",
      borderRadius: "0px",
      opacity: "0.8",
      color: "var(--color-white)",
      display: "block",
      borderColor: "transparent",
      padding: "3px 6px",
      fontSize: "var(--fontsize-body-s)",
    };

    const isPartOfRecurrance =
      currentReservation?.recurringReservation &&
      currentReservation.recurringReservation?.pk ===
        event?.recurringReservation?.pk;

    const isConfirmed =
      event?.state === ReservationsReservationStateChoices.Confirmed;
    const isWaitingForPayment =
      event?.state === ReservationsReservationStateChoices.WaitingForPayment;

    const isClosed = event?.type === "blocked";
    const isStaff = event?.type === "staff";

    if (isConfirmed && isStaff) {
      Object.assign(style, STAFF_RESERVATION.style);
    } else if (isWaitingForPayment) {
      Object.assign(style, WAITING_PAYMENT.style);
    } else if (isConfirmed && !isClosed) {
      Object.assign(style, CONFIRMED.style);
    } else {
      Object.assign(style, REST.style);
    }

    if (currentReservation?.pk === event?.pk || isPartOfRecurrance) {
      style.cursor = "default";
    }

    if (selectedReservation?.pk === event?.pk) {
      return {
        style: {
          ...style,
          ...SELECTED.style,
        },
      };
    }

    return {
      style,
    };
  };

export default eventStyleGetter;
