import React, { useEffect } from "react";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import getConfig from "next/config";
import { Container } from "common";
import { signOut } from "../../modules/auth";
import Header from "../../components/index/Header";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
};

const { publicRuntimeConfig: env } = getConfig();

const BodyContent = styled.p`
  margin: var(--spacing-layout-m) 0;
`;

// Manual logout page (similar to admin)
// Federated logout is too buggy
// - sometimes it logs out from Tunnistamo but not from the app
// - sometimes it redirects, sometimes not
// - sometimes it has a return url and sometimes not
const LogoutPage = () => {
  const { t } = useTranslation(["logout", "common"]);
  const logoutUrl = env.tunnistamoUrl
    ? `${env.tunnistamoUrl}/logout`
    : undefined;

  // User should not be here unless they have already been logged out
  // another option would be to show logout from Varaamo if they are logged in
  // and logout from Helsinki if they are not.
  const { data: session } = useSession();
  useEffect(() => {
    if (session) {
      signOut({ session });
    }
  }, [session]);

  if (!logoutUrl) {
    // eslint-disable-next-line no-console
    console.warn("Logout url not configured");
  }

  return (
    <Container>
      <Header heading={t("logout:heading")} text={t("logout:text")} />
      <BodyContent>
        {logoutUrl && (
          <a href={logoutUrl} target="_blank" rel="noreferrer">
            {t("logout:signOutFromOtherServices")}
          </a>
        )}
      </BodyContent>
    </Container>
  );
};

export default LogoutPage;
