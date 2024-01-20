import React from "react";
import { IconLinkExternal } from "hds-react";
import styled from "styled-components";

type Props = {
  href: string;
  children: string | null;
};

const Container = styled.div`
  display: inline-flex;
  align-items: center;

  & svg {
    margin-left: var(--spacing-2-xs);
  }
`;

const Name = styled.span`
  display: flex;
  flex-direction: rows;
`;

export function ExternalLink({ children, href }: Props): JSX.Element {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Container>
        <Name>{children}</Name>
        <IconLinkExternal aria-hidden />
      </Container>
    </a>
  );
}
