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

// TODO this can be futher divided (for example form data, tos, base)
export const RESERVATION_UNIT_FRAGMENT = gql`
  fragment ReservationUnit on ReservationUnitType {
    nameFi
    maxPersons
    pk
    bufferTimeBefore
    bufferTimeAfter
    reservationStartInterval
    metadataSet {
      name
      supportedFields
      requiredFields
    }
    cancellationTerms {
      textFi
      nameFi
    }
    paymentTerms {
      textFi
      nameFi
    }
    pricingTerms {
      textFi
      nameFi
    }
    termsOfUseFi
    serviceSpecificTerms {
      textFi
      nameFi
    }
  }
`;
