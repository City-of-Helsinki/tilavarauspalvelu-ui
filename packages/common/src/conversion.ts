import {
  ReservationStateChoice,
  ReservationTypeChoice,
  State,
  Type,
  Weekday,
} from "../gql/gql-types";

export type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export function transformWeekday(d: Day): Weekday {
  switch (d) {
    case 0:
      return Weekday.Monday;
    case 1:
      return Weekday.Tuesday;
    case 2:
      return Weekday.Wednesday;
    case 3:
      return Weekday.Thursday;
    case 4:
      return Weekday.Friday;
    case 5:
      return Weekday.Saturday;
    case 6:
      return Weekday.Sunday;
  }
}

export function convertWeekday(d: Weekday): Day {
  switch (d) {
    case Weekday.Monday:
      return 0;
    case Weekday.Tuesday:
      return 1;
    case Weekday.Wednesday:
      return 2;
    case Weekday.Thursday:
      return 3;
    case Weekday.Friday:
      return 4;
    case Weekday.Saturday:
      return 5;
    case Weekday.Sunday:
      return 6;
  }
}

export function convertToType(t: string): Type | undefined {
  switch (t) {
    case "BEHALF":
      return Type.Behalf;
    case "BLOCKED":
      return Type.Blocked;
    case "NORMAL":
      return Type.Normal;
    case "SEASONAL":
      return Type.Seasonal;
    case "STAFF":
      return Type.Staff;
  }
}

export function convertToReservationTypeChoice(
  t: Type | string
): ReservationTypeChoice | undefined {
  switch (t) {
    case Type.Behalf:
    case "BEHALF":
      return ReservationTypeChoice.Behalf;
    case Type.Blocked:
    case "BLOCKED":
      return ReservationTypeChoice.Blocked;
    case Type.Normal:
    case "NORMAL":
      return ReservationTypeChoice.Normal;
    case Type.Seasonal:
    case "SEASONAL":
      return ReservationTypeChoice.Seasonal;
    case Type.Staff:
    case "STAFF":
      return ReservationTypeChoice.Staff;
    default:
  }
}

export function convertToReservationStateChoice(
  s: State
): ReservationStateChoice {
  switch (s) {
    case State.Confirmed:
      return ReservationStateChoice.Confirmed;
    case State.Cancelled:
      return ReservationStateChoice.Cancelled;
    case State.Denied:
      return ReservationStateChoice.Denied;
    case State.Created:
      return ReservationStateChoice.Created;
    case State.RequiresHandling:
      return ReservationStateChoice.RequiresHandling;
    case State.WaitingForPayment:
      return ReservationStateChoice.WaitingForPayment;
  }
}
