import React from "react";
import styled from "styled-components";
import { H1 } from "common/src/common/typography";
import withMainMenu from "../withMainMenu";
import { Container } from "../../styles/layout";
import LinkPrev from "../LinkPrev";

const PreviousLinkWrapper = styled.div`
  padding: var(--spacing-s);
`;

const EditPage = () => {
  return (
    <>
      <PreviousLinkWrapper>
        <LinkPrev />
      </PreviousLinkWrapper>
      <Container>
        <H1 $legacy>Muokkaa varauksen tietoja</H1>
        <div>
          TODO copy the header section (with Title) from RequestedReservation
          refactor it into a component first though
        </div>
        <div>TODO render ReservationForm</div>
      </Container>
    </>
  );
};

export default withMainMenu(EditPage);
