import { gql } from "@apollo/client";

export const OPTIONS_QUERY = gql`
  query options {
    reservationPurposes {
      edges {
        node {
          pk
          nameFi
        }
      }
    }
    ageGroups {
      edges {
        node {
          pk
          minimum
          maximum
        }
      }
    }
    cities {
      edges {
        node {
          nameFi
          pk
        }
      }
    }
  }
`;

export const UNIT_QUERY = gql`
  query units($pk: [ID]) {
    units(pk: $pk) {
      edges {
        node {
          location {
            addressStreetFi
            addressZip
            addressCityFi
          }
          nameFi
          pk
          serviceSectors {
            nameFi
          }
          reservationUnits {
            pk
            spaces {
              pk
            }
          }
        }
      }
    }
  }
`;

export const RESERVATION_UNITS_BY_UNIT = gql`
  query reservationUnitsByUnit(
    $unit: [ID]
    $from: Date
    $to: Date
    $includeWithSameComponents: Boolean
  ) {
    reservationUnits(unit: $unit, orderBy: "nameFi") {
      edges {
        node {
          pk
          nameFi
          spaces {
            pk
          }
          reservationUnitType {
            pk
          }
          isDraft
          reservations(
            from: $from
            to: $to
            includeWithSameComponents: $includeWithSameComponents
          ) {
            pk
            name
            priority
            begin
            end
            state
            numPersons
            calendarUrl
            bufferTimeBefore
            bufferTimeAfter
            workingMemo
            reserveeFirstName
            reserveeLastName
            reserveeOrganisationName
            reservationUnits {
              pk
              nameFi
              bufferTimeBefore
              bufferTimeAfter
            }
            user {
              firstName
              lastName
              email
            }
          }
        }
      }
    }
  }
`;
