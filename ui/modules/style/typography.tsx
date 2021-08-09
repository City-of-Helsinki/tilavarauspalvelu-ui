import styled from "styled-components";
import { breakpoint } from "../style";

export const SubHeading = styled.div`
  margin-top: var(--spacing-xs);
  font-size: var(--fontsize-heading-l);
  font-family: var(--font-bold);

  @media (max-width: ${breakpoint.s}) {
    font-size: var(--fontsize-heading-m);
  }
`;

export const Strong = styled.span`
  font-family: var(--font-bold);
`;

export const Reqular = styled.span`
  font-family: var(--font-bold);
`;

export const H2 = styled.h2`
  font-size: var(--fontsize-heading-m);
  font-family: var(--font-bold);
  font-weight: 700;
  margin-bottom: var(--spacing-m);
`;
