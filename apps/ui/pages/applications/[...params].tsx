import React, { useEffect } from "react";
import { ApolloError } from "@apollo/client";
import Error from "next/error";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApplicationPageWrapper } from "@/components/application/ApplicationPage";
import { Page1 } from "@/components/application/Page1";
import { Page2 } from "@/components/application/Page2";
import {
  type ApplicationFormValues,
  transformApplication,
  convertApplication,
  ApplicationFormSchemaRefined,
} from "@/components/application/form";
import { getValidationErrors } from "common/src/apolloUtils";
import { useReservationUnitList } from "@/hooks";
import { useApplicationUpdate } from "@/hooks/useApplicationUpdate";
import { getCommonServerSideProps } from "@/modules/serverUtils";
import { base64encode, toNumber } from "common/src/helpers";
import { createApolloClient } from "@/modules/apolloClient";
import {
  ApplicationDocument,
  type ApplicationQuery,
  type ApplicationQueryVariables,
} from "@/gql/gql-types";
import { errorToast } from "common/src/common/toast";
import { getApplicationPath } from "@/modules/urls";
import {
  convertLanguageCode,
  getTranslationSafe,
} from "common/src/common/util";

// TODO move this to a shared file
// and combine all the separate error handling functions to one
function getErrorMessages(error: unknown): string {
  if (error == null) {
    return "";
  }
  if (error instanceof ApolloError) {
    const { graphQLErrors, networkError } = error;
    if (networkError != null) {
      if ("result" in networkError) {
        if (typeof networkError.result === "string") {
          return networkError.result;
        }
        if ("errors" in networkError.result) {
          // TODO match to known error messages
          // fallback to return unkown backend validation error (different from other unknown errors)
          const { errors } = networkError.result;
          // TODO separate validation errors: this is invalid MutationInput (probably a bug)
          const VALIDATION_ERROR = "Variable '$input'";
          const isValidationError =
            errors.find((e: unknown) => {
              if (typeof e !== "object" || e == null) {
                return false;
              }
              if ("message" in e && typeof e.message === "string") {
                return e.message.startsWith(VALIDATION_ERROR);
              }
              return false;
            }) != null;
          if (isValidationError) {
            return "Validation error";
          }
          return "Unknown network error";
        }
      }
      return networkError.message;
    }
    // Possible mutations errors (there are others too)
    // 1. message: "Voi hakea vain 1-7 varausta viikossa."
    //  - code: "invalid"
    // 2. message: "Reservations begin date cannot be before the application round's reservation period begin date."
    //  - code: ""
    const mutationErrors = getValidationErrors(error);
    if (mutationErrors.length > 0) {
      return "Form validation error";
    }
    if (graphQLErrors.length > 0) {
      return "Unknown GQL error";
    }
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && "message" in error) {
    if (typeof error.message === "string") {
      return error.message;
    }
  }
  return "Unknown error";
}

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"];
type PropsNarrowed = Exclude<Props, { notFound: boolean }>;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { locale } = ctx;

  // TODO should fetch on SSR but we need authentication for it
  const { query } = ctx;
  const { params } = query;
  const [id, slug] = params ?? [];
  const pk = toNumber(id);

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
    ApplicationQuery,
    ApplicationQueryVariables
  >({
    query: ApplicationDocument,
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
      slug,
      application,
      ...(await serverSideTranslations(locale ?? "fi")),
    },
  };
}

function ApplicationRootPage({
  slug,
  application,
}: PropsNarrowed): JSX.Element {
  const { applicationRound } = application;
  const router = useRouter();

  const [update, { error }] = useApplicationUpdate();

  const handleSave = async (appToSave: ApplicationFormValues) => {
    // There should not be a situation where we are saving on this page without an application
    // but because of loading we might not have it when the page is rendered
    if (appToSave.pk === 0) {
      // eslint-disable-next-line no-console
      console.error("application pk is 0");
      return 0;
    }
    return update(transformApplication(appToSave));
  };

  const saveAndNavigate =
    (path: "page2" | "page3") => async (appToSave: ApplicationFormValues) => {
      const pk = await handleSave(appToSave);
      if (pk === 0) {
        return;
      }
      router.push(getApplicationPath(pk, path));
    };

  const { reservationUnits: selectedReservationUnits } =
    useReservationUnitList(applicationRound);

  const begin = new Date(applicationRound.reservationPeriodBegin);
  const end = new Date(applicationRound.reservationPeriodEnd);
  const form = useForm<ApplicationFormValues>({
    mode: "onChange",
    defaultValues: convertApplication(application, selectedReservationUnits),
    resolver: zodResolver(ApplicationFormSchemaRefined({ begin, end })),
  });

  const {
    formState: { isDirty },
  } = form;

  const { t, i18n } = useTranslation();

  const lang = convertLanguageCode(i18n.language);
  const applicationRoundName = getTranslationSafe(
    applicationRound,
    "name",
    lang
  );

  const errorMessage = getErrorMessages(error);
  const errorTranslated =
    errorMessage !== "" ? t(`errors:applicationMutation.${errorMessage}`) : "";

  useEffect(() => {
    if (errorTranslated !== "") {
      errorToast({
        text: errorTranslated,
      });
    }
  }, [errorTranslated, t]);

  return (
    <FormProvider {...form}>
      {slug === "page1" ? (
        <ApplicationPageWrapper
          overrideText={applicationRoundName}
          translationKeyPrefix="application:Page1"
          application={application}
          isDirty={isDirty}
        >
          <Page1
            applicationRound={applicationRound}
            onNext={saveAndNavigate("page2")}
          />
        </ApplicationPageWrapper>
      ) : slug === "page2" ? (
        <ApplicationPageWrapper
          translationKeyPrefix="application:Page2"
          application={application}
          isDirty={isDirty}
        >
          <Page2 application={application} onNext={saveAndNavigate("page3")} />
        </ApplicationPageWrapper>
      ) : (
        <Error statusCode={404} />
      )}
    </FormProvider>
  );
}

export default ApplicationRootPage;
