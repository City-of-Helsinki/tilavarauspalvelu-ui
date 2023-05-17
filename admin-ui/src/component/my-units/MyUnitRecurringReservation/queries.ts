import { gql } from "@apollo/client";

export const CREATE_RECURRING_RESERVATION = gql`
  mutation createRecurringReservation(
    $input: RecurringReservationCreateMutationInput!
  ) {
    createRecurringReservation(input: $input) {
      pk
      errors {
        field
        messages
      }
    }
  }
`;

// FIXME states (need others that are blocking)
export const GET_RESERVATIONS_IN_INTERVAL = gql`
  query ReservationTimesInReservationUnit($pk: Int, $from: Date, $to: Date) {
    reservationUnitByPk(pk: $pk) {
      reservations(
        from: $from
        to: $to
        includeWithSameComponents: true
        state: "CONFIRMED"
      ) {
        begin
        end
      }
    }
  }
`;
