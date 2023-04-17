import { gql } from "@apollo/client";
import {
  RESERVATION_META_FRAGMENT,
  RESERVATION_UNIT_FRAGMENT,
} from "./fragments";

export const RESERVATION_COMMON_FRAGMENT = gql`
  fragment ReservationCommon on ReservationType {
    pk
    createdAt
    state
    begin
    end
    orderStatus
  }
`;

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

// this partial copy from requested/queries with reservationUnits and less data
// TODO fragment this: primary data, form data (metadata), reservationUnit data
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
