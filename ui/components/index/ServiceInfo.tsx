import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { CenteredContainer } from "../common/Container";

const BottomContainer = styled.div`
  background-color: var(--color-black-5);
`;

const StyledCenteredContainer = styled(CenteredContainer)`
  padding: var(--spacing-s) var(--spacing-s) var(--spacing-3-xl);

  p {
    font-family: var(--font-regular);
    font-weight: 400;
    white-space: pre-line;
    line-height: var(--lineheight-xl);
    margin-bottom: var(--spacing-3-xl);
  }
`;

const ServiceInfo = (): JSX.Element => {
  const { t } = useTranslation("home");

  return (
    <BottomContainer>
      <StyledCenteredContainer>
        <h1>{t("footer.heading")}</h1>
        <p>{t("footer.body")}</p>
      </StyledCenteredContainer>
    </BottomContainer>
  );
};

export default ServiceInfo;
