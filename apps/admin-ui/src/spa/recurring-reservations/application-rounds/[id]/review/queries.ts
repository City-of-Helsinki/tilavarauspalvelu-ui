import { gql } from "@apollo/client";

const APPLICANT_NAME_FRAGMENT = gql`
  fragment ApplicationNameFragment on ApplicationNode {
    applicantType
    contactPerson {
      lastName
      firstName
    }
    organisation {
      name
      organisationType
    }
  }
`;

export const APPLICATIONS_QUERY = gql`
  ${APPLICANT_NAME_FRAGMENT}
  query getApplications(
    $offset: Int
    $first: Int
    $applicationRound: Int!
    $unit: [Int]
    $applicantType: [ApplicantTypeChoice]
    $status: [ApplicationStatusChoice]!
    $textSearch: String
    $orderBy: String
  ) {
    applications(
      first: $first
      offset: $offset
      applicationRound: $applicationRound
      unit: $unit
      applicantType: $applicantType
      status: $status
      textSearch: $textSearch
      orderBy: $orderBy
    ) {
      edges {
        node {
          pk
          status
          ...ApplicationNameFragment
          applicationEvents {
            name
            pk
            eventReservationUnits {
              preferredOrder
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

export const APPLICATIONS_EVENTS_QUERY = gql`
  ${APPLICANT_NAME_FRAGMENT}
  query getApplicationEvents(
    $offset: Int
    $first: Int
    $applicationRound: Int!
    $applicationStatus: [ApplicationStatusChoice]!
    $status: [ApplicationEventStatusChoice]
    $unit: [Int]
    $applicantType: [ApplicantTypeChoice]
    $textSearch: String
    $orderBy: String
  ) {
    applicationEvents(
      first: $first
      offset: $offset
      unit: $unit
      applicationRound: $applicationRound
      applicationStatus: $applicationStatus
      status: $status
      applicantType: $applicantType
      textSearch: $textSearch
      orderBy: $orderBy
    ) {
      edges {
        node {
          pk
          name
          status
          begin
          end
          biweekly
          eventsPerWeek
          minDuration
          application {
            pk
            status
            ...ApplicationNameFragment
          }
          eventReservationUnits {
            preferredOrder
            reservationUnit {
              unit {
                pk
                nameFi
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

export const APPLICATIONS_EVENTS_SCHEDULE_QUERY = gql`
  ${APPLICANT_NAME_FRAGMENT}
  query getApplicationEventsSchedule(
    $offset: Int
    $first: Int
    $applicationRound: Int!
    $allocatedUnit: [Int]
    $applicantType: [ApplicantTypeChoice]
    $applicationEventStatus: [ApplicationEventStatusChoice]
    $allocatedReservationUnit: [Int]
    $allocatedDay: [Int]
    $accepted: Boolean
    $declined: Boolean
    $unallocated: Boolean
    $textSearch: String
    $orderBy: String
  ) {
    applicationEventSchedules(
      first: $first
      offset: $offset
      applicationRound: $applicationRound
      allocatedUnit: $allocatedUnit
      applicantType: $applicantType
      applicationEventStatus: $applicationEventStatus
      allocatedReservationUnit: $allocatedReservationUnit
      allocatedDay: $allocatedDay
      accepted: $accepted
      declined: $declined
      unallocated: $unallocated
      textSearch: $textSearch
      orderBy: $orderBy
    ) {
      edges {
        node {
          pk
          declined
          allocatedDay
          allocatedBegin
          allocatedEnd
          allocatedReservationUnit {
            nameFi
            unit {
              nameFi
              pk
            }
          }
          applicationEvent {
            name
            pk
            application {
              pk
              ...ApplicationNameFragment
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
