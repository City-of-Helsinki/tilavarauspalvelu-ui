import { gql } from "@apollo/client";

export const UPDATE_WORKING_MEMO = gql`
  mutation updateWorkingMemo($input: ReservationWorkingMemoMutationInput!) {
    updateReservationWorkingMemo(input: $input) {
      workingMemo
      errors {
        field
        messages
      }
    }
  }
`;

export const APPROVE_RESERVATION = gql`
  mutation approveReservation($input: ReservationApproveMutationInput!) {
    approveReservation(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export const DENY_RESERVATION = gql`
  mutation denyReservation($input: ReservationDenyMutationInput!) {
    denyReservation(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export const REQUIRE_HANDLING_RESERVATION = gql`
  mutation requireHandling($input: ReservationRequiresHandlingMutationInput!) {
    requireHandlingForReservation(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export const RESERVATION_DENY_REASONS = gql`
  query reservationDenyReasons {
    reservationDenyReasons {
      edges {
        node {
          pk
          reasonFi
        }
      }
    }
  }
`;

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
export const SINGLE_RESERVATION_QUERY = gql`
  query reservationByPk($pk: Int!) {
    reservationByPk(pk: $pk) {
      pk
      createdAt
      type
      workingMemo
      orderStatus
      ageGroup {
        minimum
        maximum
      }
      purpose {
        nameFi
      }
      homeCity {
        nameFi
      }
      price
      taxPercentageValue
      numPersons
      reserveeType
      reserveeIsUnregisteredAssociation
      name
      description
      reserveeFirstName
      reserveeLastName
      reserveePhone
      begin
      end
      calendarUrl
      user {
        firstName
        lastName
        email
        pk
      }
      state
      reserveeOrganisationName
      reserveeEmail
      reserveeId
      reserveeIsUnregisteredAssociation
      reserveeAddressStreet
      reserveeAddressCity
      reserveeAddressZip
      billingFirstName
      billingLastName
      billingPhone
      billingEmail
      billingAddressStreet
      billingAddressCity
      billingAddressZip
      freeOfChargeReason
      applyingForFreeOfCharge
    }
  }
`;
