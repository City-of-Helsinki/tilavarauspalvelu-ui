import styled from "styled-components";
import { Accordion, Button } from "hds-react";
import { Grid, Span4 as DefaultSpan4 } from "../../../../styles/layout";

export const EditorGrid = styled(Grid)`
  margin-top: var(--spacing-s);
  padding-bottom: var(--spacing-m);
`;

export const Span4 = styled(DefaultSpan4)`
  label {
    white-space: nowrap;
  }
`;

export const Wrapper = styled.div`
  padding-bottom: 6em;
`;

export const Editor = styled.div`
  margin: 0 var(--spacing-layout-xs);
  max-width: var(--container-width-l);
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: var(--spacing-m);
`;

export const ArchiveButton = styled(Button)`
  margin-top: var(--spacing-m);
`;

export const ExpandLink = styled(Accordion)`
  border-bottom: none !important;

  > div:nth-of-type(1) > div {
    display: flex;
    flex-direction: row;
    > div {
      font-size: var(--fontsize-heading-xxs);
      font-family: var(--tilavaraus-admin-font-medium);
      font-weight: normal;
      color: var(--color-bus);
      line-height: 1.5;
    }
    svg {
      margin: 0;
      color: var(--color-bus);
    }
  }
`;

export const Preview = styled.a<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-items: center;
  border-color: var(--color-white) !important;
  border: 2px solid;
  background-color: var(--color-bus-dark);
  text-decoration: none;
  &:hover {
    background-color: var(--color-bus-dark);
  }
  ${({ disabled }) =>
    disabled
      ? `
    cursor: not-allowed;
    color: var(--color-white);
    &:hover {
      background-color: var(--color-bus-dark);
      }  `
      : `
      color: var(--color-white);
    cursor: pointer;
    &:hover {
      background-color: var(--color-white);
      color: var(--color-black);
      }

  `}
  > span {
    margin: 0 var(--spacing-m);
  }
`;

export const Error = styled.div`
  margin-top: var(--spacing-3-xs);
  color: var(--color-error);
  display: flex;
  gap: var(--spacing-2-xs);
  svg {
    flex-shrink: 0;
  }
  white-space: nowrap;
`;
