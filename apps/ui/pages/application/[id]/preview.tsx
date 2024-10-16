import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import {
  useApplicationQuery,
  useSendApplicationMutation,
} from "@gql/gql-types";
import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Error from "next/error";
import { MediumButton } from "@/styles/util";
import { ButtonContainer, CenterSpinner } from "@/components/common/common";
import { ViewInner } from "@/components/application/ViewInner";
import { createApolloClient } from "@/modules/apolloClient";
import { ApplicationPageWrapper } from "@/components/application/ApplicationPage";
import {
  getCommonServerSideProps,
  getGenericTerms,
} from "@/modules/serverUtils";
import { base64encode } from "common/src/helpers";
import { errorToast } from "common/src/common/toast";

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"];
type PropsNarrowed = Exclude<Props, { notFound: boolean }>;

// User has to accept the terms of service then on submit we change the application status
// This uses separate Send mutation (not update) so no onNext like the other pages
// we could also remove the FormContext here
function Preview(props: PropsNarrowed): JSX.Element {
  const { pk, tos } = props;

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

  const [acceptTermsOfUse, setAcceptTermsOfUse] = useState(false);
  const router = useRouter();

  const { t } = useTranslation();

  const [send, { error: mutationError, loading: isMutationLoading }] =
    useSendApplicationMutation();

  const onSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!acceptTermsOfUse) {
      return;
    }
    if (!pk) {
      // eslint-disable-next-line no-console
      console.error("no pk in values");
      return;
    }
    const { data: mutData, errors } = await send({
      variables: {
        input: {
          pk,
        },
      },
    });
    if (errors) {
      // eslint-disable-next-line no-console
      console.error("error sending application", errors);
      // TODO show error
      return;
    }

    const { pk: resPk } = mutData?.sendApplication ?? {};

    if (resPk != null) {
      // TODO use an urlbuilder
      const prefix = `/application/${resPk}`;
      const target = `${prefix}/sent`;
      router.push(target);
    }
    // TODO error
  };

  useEffect(() => {
    mutationError &&
      errorToast({
        text: t("common:error.mutationError"),
      });
  }, [mutationError, t]);

  if (pk == null) {
    return <Error statusCode={404} />;
  }
  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return <Error statusCode={500} />;
  }
  if (isLoading) {
    return <CenterSpinner />;
  }

  if (application == null) {
    return <Error statusCode={404} />;
  }

  // TODO use an urlbuilder
  const handleBack = () => router.push(`/application/${application.pk}/page3`);

  return (
    <ApplicationPageWrapper
      translationKeyPrefix="application:preview"
      application={application}
    >
      <form onSubmit={onSubmit}>
        <ViewInner
          application={application}
          tos={tos}
          acceptTermsOfUse={acceptTermsOfUse}
          setAcceptTermsOfUse={setAcceptTermsOfUse}
        />
        <ButtonContainer>
          <MediumButton variant="secondary" onClick={handleBack}>
            {t("common:prev")}
          </MediumButton>
          <MediumButton
            id="submit"
            type="submit"
            disabled={!acceptTermsOfUse}
            isLoading={isMutationLoading}
          >
            {t("common:submit")}
          </MediumButton>
        </ButtonContainer>
      </form>
    </ApplicationPageWrapper>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { locale } = ctx;
  const commonProps = getCommonServerSideProps();
  const apolloClient = createApolloClient(commonProps.apiBaseUrl, ctx);

  const tos = await getGenericTerms(apolloClient);

  // TODO should fetch on SSR but we need authentication for it
  const { query } = ctx;
  const { id } = query;
  const pkstring = Array.isArray(id) ? id[0] : id;
  const pk = Number.isNaN(Number(pkstring)) ? null : Number(pkstring);

  if (pk == null) {
    return {
      props: {
        notFound: true,
        ...commonProps,
      },
      notFound: true,
    };
  }

  return {
    props: {
      ...commonProps,
      key: locale,
      pk,
      tos,
      ...(await serverSideTranslations(locale ?? "fi")),
    },
  };
}

export default Preview;
