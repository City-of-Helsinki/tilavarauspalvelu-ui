import React from "react";
import styled from "styled-components";
import { ReservationUnitType } from "common/types/gql-types";

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
const TOSElement = ({ title, text }: { title: string; text: string }) => (
  <Terms>
    <h3>{title}</h3>
    <p>{text}</p>
  </Terms>
);

const ShowTOS = ({
  reservationUnit,
}: {
  reservationUnit: ReservationUnitType;
}) => {
  const payTerms = reservationUnit.paymentTerms;
  const priceTerms = reservationUnit.pricingTerms;
  const cancelTerms = reservationUnit.cancellationTerms;
  return (
    <div>
      <TOSElement
        title="Palveluehdot"
        text={reservationUnit.termsOfUseFi ?? ""}
      />
      {(payTerms?.nameFi || payTerms?.textFi) && (
        <TOSElement
          title={payTerms?.nameFi ?? "Payment terms title missing"}
          text={payTerms?.textFi ?? ""}
        />
      )}
      {(priceTerms?.nameFi || priceTerms?.textFi) && (
        <TOSElement
          title={priceTerms?.nameFi ?? "Price terms title missing"}
          text={priceTerms?.textFi ?? ""}
        />
      )}
      {(cancelTerms?.nameFi || cancelTerms?.textFi) && (
        <TOSElement
          title={cancelTerms?.nameFi ?? "Cancellation terms missing"}
          text={cancelTerms?.textFi ?? ""}
        />
      )}
    </div>
  );
};

export default ShowTOS;
