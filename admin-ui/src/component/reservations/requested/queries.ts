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

export const RESERVATION_QUERY = gql`
  query reservationByPk($pk: Int!) {
    reservationByPk(pk: $pk) {
      pk
      createdAt
      workingMemo
      reservationUnits {
        pk
        nameFi
        unit {
          nameFi
        }
        priceUnit
        highestPrice
      }
      taxPercentageValue
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
      numPersons
      reserveeType
      reserveeIsUnregisteredAssociation
      name
      price
      unitPrice
      description
      reserveeFirstName
      reserveeLastName
      reserveePhone
      begin
      end
      calendarUrl
      user
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
    ) {
      edges {
        node {
          name
          reserveeFirstName
          reserveeLastName
          reserveeOrganisationName
          pk
          begin
          end
          state
          user
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;
