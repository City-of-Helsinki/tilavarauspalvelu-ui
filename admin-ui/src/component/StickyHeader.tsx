import { ButtonContainer } from "app/styles/layout";
import { breakpoints } from "common/src/common/style";
import React from "react";
import styled from "styled-components";

const Sticky = styled.div`
  z-index: var(--tilavaraus-admin-stack-sticky-reservation-header);
  position: sticky;
  top: 0px;
  width: 100%;
  background-color: white;
  height: 0;
`;

const StickyContent = styled.div`
  color: var(--color-white);
  background: var(--color-bus-dark);
  border-width: 0px;
  border-style: solid;
  border-color: var(--color-black-20);
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: var(--spacing-s);
  line-height: 1.5;
  && button,
  && a {
    border-color: var(--color-white);
    color: var(--color-white);
    &:hover,
    &:focus-within {
      background-color: unset;
      color: var(--color-black-10);
      border-color: var(--color-black-10);
    }
  }
  @media (max-width: ${breakpoints.l}) {
    flex-direction: column;
  }
`;

const Name = styled.div`
  font-size: var(--fontsize-body-xl);
`;
const Tagline = styled.div`
  font-size: var(--fontsize-body-l);
`;

const StyledButtonContainer = styled(ButtonContainer)`
  margin: 0;
  flex-shrink: 1;
  align-items: center;
  justify-content: flex-end;
  @media (max-width: ${breakpoints.s}) {
    justify-content: space-between;
  }
`;

type Props = {
  name: string;
  tagline: string;
  buttons?: React.ReactNode;
};

const StickyHeader = ({ name, tagline, buttons }: Props): JSX.Element => (
  <Sticky>
    <StickyContent>
      <div style={{ flexShrink: 1 }}>
        <Name>{name}</Name>
        <Tagline>{tagline}</Tagline>
      </div>
      <StyledButtonContainer>{buttons}</StyledButtonContainer>
    </StickyContent>
  </Sticky>
);

export default StickyHeader;
