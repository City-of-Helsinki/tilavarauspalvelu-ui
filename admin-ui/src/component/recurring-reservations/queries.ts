import { gql } from "@apollo/client";

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
        }
      }
    }
  }
`;
