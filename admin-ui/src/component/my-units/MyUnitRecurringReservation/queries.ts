import { gql } from "@apollo/client";

export const CREATE_RECURRING_RESERVATION = gql`
  mutation createRecurringReservation(
    $input: ReservationRecurringCreateMutationInput!
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
