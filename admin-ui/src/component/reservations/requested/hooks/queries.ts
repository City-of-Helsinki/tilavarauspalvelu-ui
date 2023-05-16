import { gql } from "@apollo/client";

import {
  RESERVATION_COMMON_FRAGMENT,
  RESERVATION_META_FRAGMENT,
  RESERVATION_UNIT_FRAGMENT,
} from "../../fragments";

export const RESERVATIONS_BY_RESERVATIONUNIT = gql`
  query reservationUnitByPk($pk: Int, $from: Date, $to: Date) {
    reservationUnitByPk(pk: $pk) {
      reservations(
        from: $from
        to: $to
        state: [
          "DENIED"
          "CONFIRMED"
          "REQUIRES_HANDLING"
          "WAITING_FOR_PAYMENT"
        ]
        includeWithSameComponents: true
      ) {
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
  }
`;

// TODO do we need user / orderStatus?
export const SINGLE_RESERVATION_QUERY = gql`
  ${RESERVATION_META_FRAGMENT}
  ${RESERVATION_UNIT_FRAGMENT}
  ${RESERVATION_COMMON_FRAGMENT}
  query reservationByPk($pk: Int!) {
    reservationByPk(pk: $pk) {
      ...ReservationCommon
      type
      workingMemo
      reservationUnits {
        ...ReservationUnit
      }
      user {
        firstName
        lastName
        email
        pk
      }
      ...ReservationMetaFields
    }
  }
`;

export const RECURRING_RESERVATION_QUERY = gql`
  query recurringReservation(
    $pk: ID!
    $offset: Int
    $count: Int
    $state: [String]
  ) {
    reservations(
      offset: $offset
      recurringReservation: $pk
      state: $state
      first: $count
      orderBy: "begin"
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
