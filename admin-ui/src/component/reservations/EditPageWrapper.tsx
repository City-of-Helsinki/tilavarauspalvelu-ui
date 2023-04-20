import React from "react";
import { useTranslation } from "react-i18next";
import { ReservationType } from "common/types/gql-types";
import styled from "styled-components";
import LinkPrev from "../LinkPrev";
import { Container } from "../../styles/layout";
import ReservationTitleSection from "./requested/ReservationTitleSection";
import { createTagString } from "./requested/util";

const PreviousLinkWrapper = styled.div`
  padding: var(--spacing-s);
`;

// TODO the container and title section is common with RequestedReservation and EditTime
const EditPageWrapper = ({
  children,
  reservation,
}: {
  children: React.ReactNode;
  reservation?: ReservationType;
}) => {
  const { t } = useTranslation();
  const tagline = reservation ? createTagString(reservation, t) : "";

  console.log("tag string: ", tagline);
  return (
    <>
      <PreviousLinkWrapper>
        <LinkPrev />
      </PreviousLinkWrapper>
      <Container>
        {reservation && (
          <ReservationTitleSection
            reservation={reservation}
            tagline={tagline}
          />
        )}
        {children}
      </Container>
    </>
  );
};

export default EditPageWrapper;
