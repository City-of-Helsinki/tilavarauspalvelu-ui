import { gql } from "@apollo/client";
import { RESERVATION_META_FRAGMENT } from "./fragments";

export const RESERVATIONS_QUERY = gql`
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
          pk
          state
          reservationUnits {
            nameFi
            unit {
              nameFi
            }
          }
          begin
          end
          reserveeFirstName
          reserveeLastName
          name
          orderStatus
          createdAt
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

// TODO this is copy from requested/queries
// we want to simplify it to only needed attributes
// but it should be fragmented so we can reuse parts
// TODO add the same fragment as in create-reservation/queries.ts: RESERVATION_UNIT_QUERY
// to reservationUnits to remove the extra hook
// TODO fragment this: primary data, form data (metadata), reservationUnit data
// TODO what is name? name of the reservation or something else?
export const SINGLE_RESERVATION_QUERY = gql`
  ${RESERVATION_META_FRAGMENT}
  query reservationByPk($pk: Int!) {
    reservationByPk(pk: $pk) {
      pk
      createdAt
      type
      state
      workingMemo
      orderStatus
      reservationUnits {
        pk
      }
      begin
      end
      calendarUrl
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
