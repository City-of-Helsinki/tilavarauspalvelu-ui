import { gql } from "@apollo/client";

export const CURRENT_USER = gql`
  query currentUser {
    currentUser {
      username
      firstName
      lastName
      isSuperuser
      unitRoles {
        pk

        role {
          code
        }
        units {
          pk
        }
      }
      serviceSectorRoles {
        pk
        role {
          code
        }
        serviceSector {
          pk
        }
      }
      generalRoles {
        pk
        role {
          code
        }
        pk
      }
    }
  }
`;
