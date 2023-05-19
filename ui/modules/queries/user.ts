import { gql } from "@apollo/client";

export const CURRENT_USER = gql`
  query getCurrentUser {
    currentUser {
      pk
      firstName
      lastName
    }
  }
`;

export const CURRENT_USER_GLOBAL = gql`
  query getCurrentUserGlobal($referrer: String) {
    currentUser(referrer: $referrer) {
      pk
      firstName
      lastName
    }
  }
`;
