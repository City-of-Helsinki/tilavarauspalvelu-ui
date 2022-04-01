import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { breakpoint } from "../../modules/style";
import Container from "../common/Container";
import Head from "./Head";

type Props = {
  breadCrumbText: string;
};

const Paragraph = styled.p`
  white-space: pre-wrap;

  @media (min-width: ${breakpoint.m}) {
    max-width: 60%;
  }
`;

const Sent = ({ breadCrumbText }: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <Head
        heading={t("application:sent.heading")}
        breadCrumbText={breadCrumbText}
      >
        <p>{t("application:sent.subHeading")}</p>
      </Head>
      <Container main>
        <Paragraph>{t("application:sent.body")}</Paragraph>
      </Container>
    </>
  );
};

export default Sent;
