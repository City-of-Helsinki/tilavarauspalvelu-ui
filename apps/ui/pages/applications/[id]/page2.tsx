import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApplicationPageWrapper } from "@/components/application/ApplicationPage";
import { Page2 as Page2Impl } from "@/components/application/Page2";
import {
  type ApplicationPage2FormValues,
  transformApplicationPage2,
  convertApplicationPage2,
  ApplicationSectionPage2Schema,
} from "@/components/application/form";
import { useApplicationUpdate } from "@/hooks/useApplicationUpdate";
import { getCommonServerSideProps } from "@/modules/serverUtils";
import { base64encode, ignoreMaybeArray, toNumber } from "common/src/helpers";
import { createApolloClient } from "@/modules/apolloClient";
import {
  ApplicationPage2Document,
  type ApplicationPage2Query,
  type ApplicationPage2QueryVariables,
} from "@/gql/gql-types";
import { errorToast } from "common/src/common/toast";
import { getApplicationPath } from "@/modules/urls";
import { getErrorMessages } from "@/components/application/module";
import { gql } from "@apollo/client";

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"];
type PropsNarrowed = Exclude<Props, { notFound: boolean }>;

function Page2({ application }: PropsNarrowed): JSX.Element {
  const router = useRouter();

  const [update] = useApplicationUpdate();

  const handleSave = async (values: ApplicationPage2FormValues) => {
    return update(transformApplicationPage2(values));
  };

  const saveAndNavigate = async (values: ApplicationPage2FormValues) => {
    try {
      const pk = await handleSave(values);
      router.push(getApplicationPath(pk, "page3"));
    } catch (err) {
      const errorMessage = getErrorMessages(err);
      const text =
        errorMessage !== ""
          ? t(`errors:applicationMutation.${errorMessage}`)
          : t("errors:general_error");
      errorToast({ text });
    }
  };

  const form = useForm<ApplicationPage2FormValues>({
    mode: "onChange",
    defaultValues: convertApplicationPage2(application),
    resolver: zodResolver(ApplicationSectionPage2Schema),
  });

  const {
    formState: { isDirty },
  } = form;

  const { t } = useTranslation();

  return (
    <FormProvider {...form}>
      <ApplicationPageWrapper
        translationKeyPrefix="application:Page2"
        application={application}
        isDirty={isDirty}
      >
        <Page2Impl application={application} onNext={saveAndNavigate} />
      </ApplicationPageWrapper>
    </FormProvider>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { locale, query } = ctx;
  const pk = toNumber(ignoreMaybeArray(query.id));

  const commonProps = getCommonServerSideProps();
  const notFound = {
    props: {
      ...commonProps,
      notFound: true,
      ...(await serverSideTranslations(locale ?? "fi")),
    },
    notFound: true,
  };
  if (pk == null) {
    return notFound;
  }

  const client = createApolloClient(commonProps.apiBaseUrl, ctx);
  const { data } = await client.query<
    ApplicationPage2Query,
    ApplicationPage2QueryVariables
  >({
    query: ApplicationPage2Document,
    variables: {
      id: base64encode(`ApplicationNode:${pk}`),
    },
  });
  const { application } = data;
  if (application == null) {
    return notFound;
  }

  return {
    props: {
      ...commonProps,
      application,
      ...(await serverSideTranslations(locale ?? "fi")),
    },
  };
}

export const APPLICATION_PAGE2_QUERY = gql`
  query ApplicationPage2($id: ID!) {
    application(id: $id) {
      ...ApplicationForm
    }
  }
`;

export default Page2;
