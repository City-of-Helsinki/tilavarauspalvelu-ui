import styled from "styled-components";
import { Grid, Span4 as DefaultSpan4 } from "../../../../styles/layout";
import { breakpoints } from "../../../../styles/util";

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

export const EditorContainer = styled.div`
  @media (min-width: ${breakpoints.l}) {
    margin: 0 var(--spacing-layout-m);
  }
`;

export const Editor = styled.div`
  @media (min-width: ${breakpoints.m}) {
    margin: 0 var(--spacing-layout-m);
  }
  max-width: 52rem;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: var(--spacing-m);
`;

export const PublishingTime = styled.div`
  flex-grow: 1;
  color: var(--color-white);
  display: flex;
  justify-content: right;
  align-items: center;
  flex-direction: row;
  padding-right: var(--spacing-m);
  text-align: end;
  line-height: 1.3;
`;

export const Preview = styled.a<{ $disabled: boolean }>`
  margin-left: auto;
  padding: var(--spacing-m);
  border-color: var(--color-white) !important;
  border: 2px solid;
  background-color: var(--color-bus-dark);
  text-decoration: none;
  &:hover {
    background-color: var(--color-bus-dark);
  }
  ${({ $disabled }) =>
    $disabled
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
