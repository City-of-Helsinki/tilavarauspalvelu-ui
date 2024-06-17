import React from "react";
import Error from "next/error";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { getTranslation } from "common/src/common/util";
import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { BlackButton } from "@/styles/util";
import { ApplicationPageWrapper } from "@/components/application/ApplicationPage";
import { createApolloClient } from "@/modules/apolloClient";
import { ViewInner } from "@/components/application/ViewInner";
import { ButtonContainer, CenterSpinner } from "@/components/common/common";
import {
  getCommonServerSideProps,
  getGenericTerms,
} from "@/modules/serverUtils";
import { base64encode } from "common/src/helpers";
import {
  CurrentUserDocument,
  type CurrentUserQuery,
  useApplicationQuery,
} from "@/gql/gql-types";
import { ApplicationDocument } from "common/gql/gql-types";

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"];
type PropsNarrowed = Exclude<Props, { notFound: boolean }>;

const View = ({ id: pk, tos }: PropsNarrowed): JSX.Element => {
  const { t } = useTranslation();

  const router = useRouter();

  const id = base64encode(`ApplicationNode:${pk}`);
  const {
    data,
    error,
    loading: isLoading,
  } = useApplicationQuery({
    variables: { id },
    skip: !pk,
  });
  const { application } = data ?? {};

  if (id == null) {
    return <Error statusCode={404} />;
  }
  if (error) {
    // eslint-disable-next-line no-console -- TODO use logger (sentry)
    console.error("application query error: ", error);
    return <Error statusCode={500} />;
  }
  if (isLoading) {
    return <CenterSpinner />;
  }
  if (!application) {
    return <Error statusCode={404} />;
  }

  const round = application.applicationRound;
  const applicationRoundName =
    round != null ? getTranslation(round, "name") : "-";

  return (
    <ApplicationPageWrapper
      translationKeyPrefix="application:view"
      headContent={applicationRoundName}
      application={application}
    >
      <ViewInner application={application} tos={tos} />
      <ButtonContainer>
        <BlackButton variant="secondary" onClick={() => router.back()}>
          {t("common:prev")}
        </BlackButton>
      </ButtonContainer>
    </ApplicationPageWrapper>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { locale } = ctx;
  const commonProps = getCommonServerSideProps();
  const apolloClient = createApolloClient(commonProps.apiBaseUrl, ctx);

  const tos = await getGenericTerms(apolloClient);

  // TODO should fetch on SSR but we need authentication for it
  const { query } = ctx;
  const { id } = query;
  const pkstring = Array.isArray(id) ? id[0] : id;
  const pk = Number.isNaN(Number(pkstring)) ? undefined : Number(pkstring);

  const { data: applicationData, error } = await apolloClient.query({
    query: ApplicationDocument,
    variables: { id: base64encode(`ApplicationNode:${pk}`) },
    fetchPolicy: "no-cache",
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Error while fetching application", error);
  }

  const { data: userData } = await apolloClient.query<CurrentUserQuery>({
    query: CurrentUserDocument,
    fetchPolicy: "no-cache",
  });

  const { currentUser: user } = userData ?? {};
  const { application } = applicationData ?? {};

  if (application != null && user != null && application.user?.pk === user.pk) {
    return {
      props: {
        ...commonProps,
        key: locale ?? "fi",
        id: pk ?? null,
        tos,
        ...(await serverSideTranslations(locale ?? "fi")),
      },
    };
  }

  return {
    notFound: true,
    props: {
      // have to double up notFound inside the props to get TS types dynamically
      notFound: true,
      ...commonProps,
      ...(await serverSideTranslations(locale ?? "fi")),
    },
  };
};

export default View;
