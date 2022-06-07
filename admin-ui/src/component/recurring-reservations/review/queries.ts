import { gql } from "@apollo/client";

export const APPLICATIONS_QUERY = gql`
  query getApplications($offset: Int, $first: Int, $applicationRound: ID) {
    applications(
      status: "in_review"
      first: $first
      offset: $offset
      applicationRound: $applicationRound
    ) {
      edges {
        node {
          pk
          status
          applicantType
          contactPerson {
            firstName
            lastName
          }
          organisation {
            name
            organisationType
          }
          applicationEvents {
            eventsPerWeek
            minDuration
            name
            eventReservationUnits {
              priority
              reservationUnitDetails {
                unit {
                  nameFi
                }
              }
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
