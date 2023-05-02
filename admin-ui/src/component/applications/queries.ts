import { gql } from "@apollo/client";

export const GET_BIRTHDATE_BY_APPLICATION_PK = gql`
  query applicationUserBirthDate($pk: [ID]) {
    applications(pk: $pk) {
      edges {
        node {
          applicantUser {
            dateOfBirth
          }
        }
      }
    }
  }
`;

export const GET_APPLICATION_BY_PK = gql`
  query GetApplicationByPk($pk: [ID]) {
    applications(pk: $pk) {
      edges {
        node {
          pk
          applicantName
          lastModifiedDate
          applicantType
          applicantEmail
          status
          organisation {
            identifier
            name
            coreBusiness
            address {
              city
              streetAddress
              postCode
            }
            email
          }
          contactPerson {
            firstName
            lastName
            email
            phoneNumber
          }
          billingAddress {
            streetAddress
            postCode
            city
          }
          additionalInformation
          homeCity {
            pk
            name
          }
          aggregatedData {
            appliedMinDurationTotal
            appliedReservationsTotal
          }
          applicationEvents {
            pk
            name
            numPersons
            ageGroup {
              minimum
              maximum
            }
            numPersons
            eventsPerWeek
            minDuration
            maxDuration
            begin
            end
            status
            purpose {
              nameFi
              pk
            }
            eventReservationUnits {
              pk
              reservationUnit {
                pk
                nameFi
                unit {
                  nameFi
                }
              }
            }
            applicationEventSchedules {
              begin
              end
              priority
              day
            }
          }
          applicationRound {
            pk
            nameFi
            criteriaFi
            applicationsCount
            reservationUnitCount
            reservationUnits {
              pk
              nameFi
            }
          }
        }
      }
    }
  }
`;
