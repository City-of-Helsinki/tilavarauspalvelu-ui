import styled, { css } from "styled-components";
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
  font-size: 700;
`;

export const Regular = styled.span`
  font-family: var(--font-regular);
  font-size: 400;
`;

export const H1 = styled.h1`
  font-size: 1.75rem;
  font-family: var(--font-bold);
  font-weight: 700;
  margin-bottom: var(--spacing-m);
`;

export const H2 = styled.h2`
  font-size: var(--fontsize-heading-m);
  font-family: var(--font-bold);
  font-weight: 700;
  margin-bottom: var(--spacing-m);
`;

export const fontRegular = css`
  font-family: var(--font-regular);
  font-weight: 400;
`;

export const fontMedium = css`
  font-family: var(--font-medium);
  font-weight: 500;
`;

export const fontBold = css`
  font-family: var(--font-bold);
  font-weight: 700;
`;

export const KebabHeading = styled.h2`
  &:before,
  &:after {
    background-color: var(--color-black-90);
    content: "";
    display: flex;
    align-self: center;
    height: 1px;
    position: relative;
    width: 50%;
  }

  &:before {
    right: var(--spacing-layout-l);
    margin-left: -50%;
  }

  &:after {
    left: var(--spacing-layout-l);
    margin-right: -50%;
  }

  display: flex;
  overflow: hidden;
  text-align: center;
  justify-content: center;
`;
