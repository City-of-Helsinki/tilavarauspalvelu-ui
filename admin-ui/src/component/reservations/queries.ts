import { gql } from "@apollo/client";
import { RESERVATION_COMMON_FRAGMENT } from "./fragments";

export const RESERVATIONS_QUERY = gql`
  ${RESERVATION_COMMON_FRAGMENT}
  query reservations(
    $after: String
    $unit: [ID]
    $reservationUnitType: [ID]
    $orderBy: String
    $offset: Int
    $first: Int
    $state: [String]
    $textSearch: String
    $priceGte: Decimal
    $priceLte: Decimal
    $begin: DateTime
    $end: DateTime
    $reservationUnit: [ID]
    $orderStatus: [String]
  ) {
    reservations(
      first: $first
      offset: $offset
      orderBy: $orderBy
      after: $after
      unit: $unit
      reservationUnit: $reservationUnit
      reservationUnitType: $reservationUnitType
      state: $state
      orderStatus: $orderStatus
      textSearch: $textSearch
      priceLte: $priceLte
      priceGte: $priceGte
      begin: $begin
      end: $end
      onlyWithPermission: true
    ) {
      edges {
        node {
          ...ReservationCommon
          reservationUnits {
            nameFi
            unit {
              nameFi
            }
          }
          reserveeFirstName
          reserveeLastName
          name
        }
      }
      pageInfo {
        hasNextPage
        endCursor
        hasNextPage
      }
      totalCount
    }
  }
`;

export const UPDATE_STAFF_RESERVATION = gql`
  mutation staffReservationModify(
    $input: ReservationStaffModifyMutationInput!
    $workingMemo: ReservationWorkingMemoMutationInput!
  ) {
    staffReservationModify(input: $input) {
      pk
      errors {
        field
        messages
      }
    }
    updateReservationWorkingMemo(input: $workingMemo) {
      workingMemo
      errors {
        field
        messages
      }
    }
  }
`;

export const UPDATE_STAFF_RECURRING_RESERVATION = gql`
  mutation updateRecurringReservation(
    $input: RecurringReservationUpdateMutationInput!
  ) {
    updateRecurringReservation(input: $input) {
      pk
      errors {
        field
        messages
      }
    }
  }
`;
