import React from "react";
import styled from "styled-components";
import { ButtonContainer } from "common/styles/util";
import { H2 } from "common";
import { breakpoints } from "common/src/common/style";

const Sticky = styled.div`
  z-index: var(--tilavaraus-admin-stack-sticky-reservation-header);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
`;

const StickyContent = styled.div`
  color: var(--color-white);
  background: var(--color-bus-dark);
  padding: var(--spacing-s);
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
    &:hover {
      filter: brightness(0.8);
    }
  }

  display: grid;
  gap: var(--spacing-s);
  align-items: center;
  grid-template-columns: 1fr;
  @media (min-width: ${breakpoints.s}) {
    grid-template-columns: 1fr auto;
  }
`;

type Props = {
  name: string;
  tagline: string;
  buttons?: React.ReactNode;
};

export function StickyHeader({ name, tagline, buttons }: Props): JSX.Element {
  return (
    <Sticky>
      <StickyContent>
        <div>
          <H2 $marginTop="none" $marginBottom="2-xs">
            {name}
          </H2>
          <div>{tagline}</div>
        </div>
        <ButtonContainer>{buttons}</ButtonContainer>
      </StickyContent>
    </Sticky>
  );
}
