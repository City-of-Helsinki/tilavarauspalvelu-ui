import { gql } from "@apollo/client";

export const RESERVATION_META_FRAGMENT = gql`
  fragment ReservationMetaFields on ReservationType {
    ageGroup {
      minimum
      maximum
    }
    purpose {
      nameFi
    }
    homeCity {
      nameFi
    }
    numPersons
    reserveeType
    reserveeIsUnregisteredAssociation
    name
    description
    reserveeFirstName
    reserveeLastName
    reserveePhone
    reserveeOrganisationName
    reserveeEmail
    reserveeId
    reserveeIsUnregisteredAssociation
    reserveeAddressStreet
    reserveeAddressCity
    reserveeAddressZip
    billingFirstName
    billingLastName
    billingPhone
    billingEmail
    billingAddressStreet
    billingAddressCity
    billingAddressZip
    freeOfChargeReason
    applyingForFreeOfCharge
  }
`;
