import styled from "styled-components";
import { LoadingSpinner, Notification as HDSNotification } from "hds-react";
import { breakpoint } from "../../modules/style";
import { H5 } from "../../modules/style/typography";

export const TwoColumnContainer = styled.div`
  @media (max-width: ${breakpoint.m}) {
    grid-template-columns: 1fr;
  }

  margin-top: var(--spacing-m);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-m);
  align-items: baseline;
`;

export const SpanTwoColumns = styled.span`
  display: grid;
  gap: var(--spacing-m);
  grid-column-start: 1;
  grid-column-end: 3;

  @media (max-width: ${breakpoint.m}) {
    grid-column-start: 1;
    grid-column-end: 2;
  }
`;

export const FormSubHeading = styled(H5)`
  @media (min-width: ${breakpoint.m}) {
    grid-column-start: 1;
    grid-column-end: 3;
    margin-top: var(--spacing-m);
    margin-bottom: var(--spacing-2-xs);
  }
`;

export const Notification = styled(HDSNotification)`
  margin-top: var(--spacing-s);
  margin-bottom: var(--spacing-m);
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: var(--spacing-layout-l);
  justify-content: flex-end;

  button {
    margin-left: var(--spacing-layout-xs);
  }
`;

export const HorisontalRule = styled.div`
  border: 0;
  height: 1px;
  background-color: var(--color-black-60);
  margin-top: var(--spacing-layout-m);
`;

export const CenterSpinner = styled(LoadingSpinner).attrs({
  "data-testid": "loading-spinner",
})`
  margin: 0 auto var(--spacing-2-xl) auto;
`;

export const CheckboxWrapper = styled.div<{ $break?: boolean }>`
  ${({ $break }) => $break && "grid-column: 1 / -1"};
  margin-top: 2.5em;
  margin-bottom: auto;

  @media (max-width: ${breakpoint.m}) {
    margin-top: 0;
  }
`;
