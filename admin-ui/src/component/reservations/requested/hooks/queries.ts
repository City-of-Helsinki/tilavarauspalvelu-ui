import { gql } from "@apollo/client";
import { ReservationsReservationStateChoices } from "common/types/gql-types";

export const RESERVATIONS_BY_RESERVATIONUNIT = gql`
  query reservationsByReservationUnit(
    $reservationUnit: [ID]
    $offset: Int
    $first: Int
    $begin: DateTime
    $end: DateTime
  ) {
    reservations(
      begin: $begin
      end: $end
      first: $first
      offset: $offset
      reservationUnit: $reservationUnit
      state: ["DENIED", "CONFIRMED", "REQUIRES_HANDLING"]
    ) {
      edges {
        node {
          user {
            email
          }
          name
          reserveeFirstName
          reserveeLastName
          reserveeOrganisationName
          pk
          begin
          end
          state
          type
          recurringReservation {
            pk
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

export const RECURRING_RESERVATION_QUERY = gql`
  query recurringReservation($pk: ID!, $offset: Int, $count: Int) {
    reservations(
      offset: $offset
      recurringReservation: $pk
      state: ["${ReservationsReservationStateChoices.Confirmed}", "${ReservationsReservationStateChoices.Denied}"]
      first: $count
    ) {
      edges {
        node {
          pk
          begin
          end
          state
          recurringReservation {
            pk
          }
        }
      }
      totalCount
    }
  }
`;
