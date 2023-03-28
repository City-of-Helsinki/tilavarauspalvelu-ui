import React from "react";
import styled from "styled-components";
import {
  QueryTermsOfUseArgs,
  TermsOfUseType,
  Query,
  TermsOfUseTermsOfUseTermsTypeChoices,
  ReservationUnitType,
} from "common/types/gql-types";
import { gql, useQuery } from "@apollo/client";

// NOTE This is partial duplicate from ui/application/Preview.tsx
// see if we can combine them (and other Terms later with parameters)
// TODO max height? is it 135px or 158px or perhaps a reasonable rem measure?
const Terms = styled.div`
  border-top: 8px solid var(--color-bus);
  margin-top: var(--spacing-m);
  margin-bottom: var(--spacing-m);
  white-space: break-spaces;
  max-height: 10em;
  overflow-y: scroll;
  background-color: var(--color-silver-light);
  padding: var(--spacing-m);

  & > h3 {
    margin-top: 0rem;
  }
`;

// TODO I'm assuming this doesn't use html or markdown (only plain text) is this correct?
// use <Sanitize> component if we need it
const TOSElement = ({ title, text }: { title: string; text: string }) => (
  <Terms>
    <h3>{title}</h3>
    <p>{text}</p>
  </Terms>
);

const TERMS_OF_USE = gql`
  query TermsOfUse($termsType: TermsOfUseTermsOfUseTermsTypeChoices) {
    termsOfUse(termsType: $termsType) {
      edges {
        node {
          pk
          nameFi
          nameEn
          nameSv
          textFi
          textEn
          textSv
          termsType
        }
      }
    }
  }
`;

const useGenericTerms = () => {
  const { data } = useQuery<Query, QueryTermsOfUseArgs>(TERMS_OF_USE, {
    variables: {
      termsType: TermsOfUseTermsOfUseTermsTypeChoices.GenericTerms,
    },
  });

  const genericTerms = data?.termsOfUse?.edges
    ?.map((n) => n?.node)
    ?.filter((n): n is TermsOfUseType => n != null)
    .find((n) => n.pk != null && ["generic1"].includes(n.pk));

  return genericTerms;
};

const ShowTOS = ({
  reservationUnit,
}: {
  reservationUnit: ReservationUnitType;
}) => {
  const serviceTerms = reservationUnit.serviceSpecificTerms;
  const payTerms = reservationUnit.paymentTerms;
  const priceTerms = reservationUnit.pricingTerms;
  const cancelTerms = reservationUnit.cancellationTerms;

  const genericTerms = useGenericTerms();

  return (
    <div>
      {(payTerms?.nameFi || payTerms?.textFi) && (
        <TOSElement
          title={payTerms?.nameFi ?? ""}
          text={payTerms?.textFi ?? ""}
        />
      )}
      {(priceTerms?.nameFi || priceTerms?.textFi) && (
        <TOSElement
          title={priceTerms?.nameFi ?? ""}
          text={priceTerms?.textFi ?? ""}
        />
      )}
      {(cancelTerms?.nameFi || cancelTerms?.textFi) && (
        <TOSElement
          title={cancelTerms?.nameFi ?? ""}
          text={cancelTerms?.textFi ?? ""}
        />
      )}
      {(serviceTerms?.nameFi || serviceTerms?.textFi) && (
        <TOSElement
          title={serviceTerms?.nameFi ?? ""}
          text={serviceTerms?.textFi ?? ""}
        />
      )}
      <TOSElement
        title={genericTerms?.nameFi ?? ""}
        text={genericTerms?.textFi ?? ""}
      />
    </div>
  );
};

export default ShowTOS;
