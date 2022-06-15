import { gql } from "@apollo/client";

export const APPLICATIONS_BY_APPLICATION_ROUND_QUERY = gql`
  query getApplicationsByPk($applicationRound: ID) {
    applications(applicationRound: $applicationRound) {
      edges {
        node {
          pk
          status
          applicantName
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
            pk
            eventsPerWeek
            minDuration
            maxDuration
            eventsPerWeek
            name
            status
            declinedReservationUnits {
              pk
            }
            ageGroup {
              minimum
              maximum
            }
            eventReservationUnits {
              priority
              reservationUnit {
                pk
                nameFi
                unit {
                  pk
                  nameFi
                }
              }
            }
            applicationEventSchedules {
              pk
              priority
              day
              begin
              end
            }
          }
        }
      }
    }
  }
`;
