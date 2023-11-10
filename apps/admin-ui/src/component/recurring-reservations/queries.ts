import { gql } from "@apollo/client";
import { ApplicationStatusChoice } from "common/types/gql-types";

export const APPLICATION_ROUNDS_QUERY = gql`
  query applicationRounds {
    applicationRounds {
      edges {
        node {
          serviceSector {
            pk
            nameFi
          }
          pk
          nameFi
          applicationPeriodBegin
          applicationPeriodEnd
          reservationPeriodBegin
          reservationPeriodEnd
          status
          applicationsCount
          reservationUnitCount
          statusTimestamp
        }
      }
    }
  }
`;

// TODO combine with APPLICATION_ROUNDS_QUERY
export const APPLICATION_ROUD_QUERY = gql`
  query ApplicationRoundCriteria($pk: [Int]!) {
    applicationRounds(pk: $pk) {
      edges {
        node {
          pk
          nameFi
          status
          applicationPeriodBegin
          applicationPeriodEnd
          reservationUnits {
            pk
          }
        }
      }
    }
  }
`;

export const APPLICATIONS_QUERY = gql`
  query getApplications {
    applications(status: ${ApplicationStatusChoice.Received}) {
      edges {
        node {
          pk
          status
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
              preferredOrder
              reservationUnit {
                unit {
                  nameFi
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const APPLICATIONS_BY_APPLICATION_ROUND_QUERY = gql`
  query getApplicationsByPk(
    $applicationRound: Int
    $status: [ApplicationStatusChoice]
  ) {
    applications(applicationRound: $applicationRound, status: $status) {
      edges {
        node {
          pk
          status
          applicant {
            name
          }
          applicantType
          contactPerson {
            firstName
            lastName
          }
          organisation {
            name
            organisationType
          }
          applicationRound {
            nameFi
          }
          applicationEvents {
            pk
            eventsPerWeek
            minDuration
            maxDuration
            eventsPerWeek
            name
            status
            ageGroup {
              minimum
              maximum
            }
            applicationEventSchedules {
              pk
              priority
              day
              begin
              end
              allocatedReservationUnit {
                pk
              }
              allocatedDay
              allocatedBegin
              allocatedEnd
            }
            eventReservationUnits {
              preferredOrder
              reservationUnit {
                pk
                nameFi
                unit {
                  pk
                  nameFi
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const DECLINE_APPLICATION_EVENT_SCHEDULE = gql`
  mutation ($input: ApplicationEventDeclineMutationInput!) {
    declineApplicationEventSchedule(input: $input) {
      pk
      errors {
        field
        messages
      }
    }
  }
`;

export const APPROVE_APPLICATION_EVENT_SCHEDULE = gql`
  mutation ($input: ApplicationEventScheduleApproveMutationInput!) {
    approveApplicationEventSchedule(input: $input) {
      pk
      allocatedReservationUnit
      allocatedDay
      allocatedBegin
      allocatedEnd
      errors {
        field
        messages
      }
    }
  }
`;
