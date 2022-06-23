import { gql } from "@apollo/client";

export const APPLICATIONS_QUERY = gql`
  query getApplications(
    $offset: Int
    $first: Int
    $applicationRound: ID
    $unit: [ID]
  ) {
    applications(
      first: $first
      offset: $offset
      unit: $unit
      applicationRound: $applicationRound
      status: "in_review"
    ) {
      edges {
        node {
          pk
          status
          applicantType
          aggregatedData {
            appliedMinDurationTotal
            appliedReservationsTotal
          }
          contactPerson {
            firstName
            lastName
          }
          organisation {
            name
            organisationType
          }
          applicationEvents {
            name
            eventReservationUnits {
              priority
              reservationUnit {
                unit {
                  pk
                  nameFi
                }
              }
            }
          }
        }
      }
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
