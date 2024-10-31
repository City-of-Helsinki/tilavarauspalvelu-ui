import React from "react";
import styled from "styled-components";
import { fontMedium, H2 } from "common/src/common/typography";
import BreadcrumbWrapper from "../common/BreadcrumbWrapper";

type HeadProps = {
  heading: string;
  children?: React.ReactNode;
  noKoros?: boolean;
};

const Heading = styled(H2).attrs({ as: "h1" })``;

const Content = styled.div`
  ${fontMedium}
`;

export function Head({ children, heading }: HeadProps): JSX.Element {
  return (
    <>
      <BreadcrumbWrapper route={["/applications", "application"]} />
      <Content>
        <Heading>{heading}</Heading>
        {children || null}
      </Content>
    </>
  );
}
