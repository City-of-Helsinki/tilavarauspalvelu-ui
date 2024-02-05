import { gql } from "@apollo/client";
import { TERMS_OF_USE_FRAGMENT } from "./fragments";

export const TERMS_OF_USE_QUERY = gql`
  ${TERMS_OF_USE_FRAGMENT}
  query TermsOfUse($termsType: TermsOfUseTermsOfUseTermsTypeChoices) {
    termsOfUse(termsType: $termsType) {
      edges {
        node {
          ...TermsOfUseFields
        }
      }
    }
  }
`;
