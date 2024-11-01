import { breakpoints } from "common/src/common/style";
import styled from "styled-components";

export const Paragraph = styled.p`
  white-space: pre-line;

  & > span {
    display: block;
  }
`;

export const ActionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  margin-top: var(--spacing-layout-m);
  margin-bottom: var(--spacing-layout-m);

  button {
    margin-bottom: var(--spacing-m);
  }

  @media (min-width: ${breakpoints.s}) {
    & > button:first-of-type {
      order: 1;
      {/* set min-width so the buttons retains their placements even when isLoading is triggered */}
      min-width: 130px;
    }

    display: flex;
    gap: var(--spacing-m);
    justify-content: flex-end;
  }
`;

// TODO rework this (way too much css for the purpose)
export const PinkBox = styled.div`
  margin: var(--spacing-m) 0;
  padding: 1px var(--spacing-m) var(--spacing-m);
  background-color: var(--color-suomenlinna-light);
  line-height: var(--lineheight-l);

  p {
    &:last-of-type {
      margin-bottom: 0;
    }

    margin-bottom: var(--spacing-s);
  }
`;
