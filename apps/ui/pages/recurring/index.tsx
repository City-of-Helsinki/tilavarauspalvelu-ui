import React from "react";
import styled from "styled-components";
import type { GetServerSidePropsContext } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { H2, H3 } from "common/src/common/typography";
import { breakpoints } from "common/src/common/style";
import {
  ApplicationRoundOrderingChoices,
  ApplicationRoundStatusChoice,
  ApplicationRoundsUiDocument,
  type ApplicationRoundsUiQuery,
  type ApplicationRoundsUiQueryVariables,
} from "@gql/gql-types";
import { filterNonNullable } from "common/src/helpers";
import { HeroSubheading } from "@/modules/style/typography";
import ApplicationRoundCard from "@/components/recurring/ApplicationRoundCard";
import { createApolloClient } from "@/modules/apolloClient";
import { getCommonServerSideProps } from "@/modules/serverUtils";

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"];

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const now = new Date();
  const { locale } = ctx;
  const commonProps = getCommonServerSideProps();
  const apolloClient = createApolloClient(commonProps.apiBaseUrl, ctx);

  const { data } = await apolloClient.query<
    ApplicationRoundsUiQuery,
    ApplicationRoundsUiQueryVariables
  >({
    query: ApplicationRoundsUiDocument,
    fetchPolicy: "no-cache",
    variables: {
      orderBy: [ApplicationRoundOrderingChoices.PkAsc],
    },
  });
  const applicationRounds = filterNonNullable(
    data?.applicationRounds?.edges.map((n) => n?.node)
  );

  const filteredApplicationRounds = applicationRounds.filter(
    (applicationRound) =>
      applicationRound?.publicDisplayBegin &&
      applicationRound?.publicDisplayEnd &&
      new Date(applicationRound.publicDisplayBegin) <= now &&
      new Date(applicationRound.publicDisplayEnd) >= now
  );

  return {
    props: {
      ...commonProps,
      applicationRounds: filteredApplicationRounds,
      ...(await serverSideTranslations(locale ?? "fi")),
    },
  };
};

const Head = styled.div`
  padding: var(--spacing-m) var(--spacing-m) var(--spacing-xl);

  @media (min-width: ${breakpoints.m}) {
    max-width: var(--container-width-xl);
    padding: var(--spacing-m);
    margin: 0 auto;
    padding-bottom: var(--spacing-layout-l);
  }
`;

const Content = styled.div`
  padding: 0 var(--spacing-m) var(--spacing-xl);
  background-color: var(--color-white);

  @media (min-width: ${breakpoints.m}) {
    max-width: var(--container-width-xl);
    margin: 0 auto;
    padding-bottom: var(--spacing-layout-xl);
  }
`;

const RoundList = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: var(--spacing-m);
  margin-bottom: var(--spacing-layout-l);
`;

const RoundHeading = styled(H3).attrs({ as: "h2" })`
  margin-top: 0;
  margin-bottom: var(--spacing-m);
`;

const RecurringLander = ({ applicationRounds }: Props): JSX.Element => {
  const { t } = useTranslation();

  const activeApplicationRounds = applicationRounds.filter(
    (ar) => ar.status === ApplicationRoundStatusChoice.Open
  );

  const pendingApplicationRounds = applicationRounds.filter(
    (ar) => ar.status === ApplicationRoundStatusChoice.Upcoming
  );

  const pastApplicationRounds = applicationRounds.filter(
    (ar) =>
      ar.status !== ApplicationRoundStatusChoice.Open &&
      ar.status !== ApplicationRoundStatusChoice.Upcoming
  );

  return (
    <>
      <Head>
        <H2 as="h1">{t("recurringLander:heading")}</H2>
        <HeroSubheading>{t("recurringLander:subHeading")}</HeroSubheading>
      </Head>
      <Content>
        {activeApplicationRounds.length > 0 ? (
          <RoundList data-testid="recurring-lander__application-round-container--active">
            <RoundHeading>
              {t("recurringLander:roundHeadings.active")}
            </RoundHeading>
            {activeApplicationRounds.map((applicationRound) => (
              <ApplicationRoundCard
                key={applicationRound.pk}
                applicationRound={applicationRound}
              />
            ))}
          </RoundList>
        ) : (
          <RoundList data-testid="recurring-lander__application-round-container--active-empty">
            <RoundHeading>
              {t("recurringLander:roundHeadings.active")}
            </RoundHeading>
            {t("recurringLander:noRounds")}
          </RoundList>
        )}
        {pendingApplicationRounds.length > 0 && (
          <RoundList data-testid="recurring-lander__application-round-container--pending">
            <RoundHeading>
              {t("recurringLander:roundHeadings.pending")}
            </RoundHeading>
            {pendingApplicationRounds.map((applicationRound) => (
              <ApplicationRoundCard
                key={applicationRound.pk}
                applicationRound={applicationRound}
              />
            ))}
          </RoundList>
        )}
        {pastApplicationRounds.length > 0 && (
          <RoundList data-testid="recurring-lander__application-round-container--past">
            <RoundHeading>
              {t("recurringLander:roundHeadings.past")}
            </RoundHeading>
            {pastApplicationRounds.map((applicationRound) => (
              <ApplicationRoundCard
                key={applicationRound.pk}
                applicationRound={applicationRound}
              />
            ))}
          </RoundList>
        )}
      </Content>
    </>
  );
};

export default RecurringLander;
