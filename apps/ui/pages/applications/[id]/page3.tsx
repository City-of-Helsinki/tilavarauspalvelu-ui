import React, { useEffect } from "react";
import {
  ApplicantTypeChoice,
  type ApplicationQuery,
  useApplicationQuery,
  type ApplicationUpdateMutationInput,
} from "@gql/gql-types";
import { useTranslation } from "next-i18next";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { Maybe } from "graphql/jsutils/Maybe";
import Error from "next/error";
import { CompanyForm } from "@/components/application/CompanyForm";
import { IndividualForm } from "@/components/application/IndividualForm";
import { OrganisationForm } from "@/components/application/OrganisationForm";
import { ApplicantTypeSelector } from "@/components/application/ApplicantTypeSelector";
import { useOptions } from "@/hooks/useOptions";
import {
  convertAddress,
  convertOrganisation,
  convertPerson,
  type ApplicationFormPage3Values,
  type PersonFormValues,
  type AddressFormValues,
  type OrganisationFormValues,
} from "@/components/application/Form";
import { ApplicationPageWrapper } from "@/components/application/ApplicationPage";
import { useApplicationUpdate } from "@/hooks/useApplicationUpdate";
import { CenterSpinner } from "@/components/common/common";
import { getCommonServerSideProps } from "@/modules/serverUtils";
import { base64encode, toNumber } from "common/src/helpers";
import { errorToast } from "common/src/common/toast";
import { getApplicationPath } from "@/modules/urls";
import { Button, ButtonVariant, IconArrowRight } from "hds-react";
import { ButtonContainer } from "common/styles/util";
import styled from "styled-components";

function Buttons({
  applicationPk,
  submitDisabled,
}: {
  applicationPk: number;
  submitDisabled?: boolean;
}): JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();

  const onPrev = () => router.push(getApplicationPath(applicationPk, "page2"));

  return (
    <ButtonContainer>
      <Button variant={ButtonVariant.Secondary} onClick={onPrev}>
        {t("common:prev")}
      </Button>
      <Button
        id="button__application--next"
        iconEnd={<IconArrowRight aria-hidden="true" />}
        type="submit"
        disabled={submitDisabled}
      >
        {t("common:next")}
      </Button>
    </ButtonContainer>
  );
}

// Filter out any empty strings from the object (otherwise the mutation fails)
function transformPerson(person?: PersonFormValues) {
  return {
    firstName: person?.firstName || undefined,
    lastName: person?.lastName || undefined,
    email: person?.email || undefined,
    phoneNumber: person?.phoneNumber || undefined,
  };
}

type Node = NonNullable<ApplicationQuery["application"]>;
function isAddressValid(address?: AddressFormValues) {
  const { streetAddress, postCode, city } = address || {};
  return (
    streetAddress != null &&
    streetAddress !== "" &&
    postCode != null &&
    postCode !== "" &&
    city != null &&
    city !== ""
  );
}

function transformAddress(address?: AddressFormValues) {
  return {
    pk: address?.pk || undefined,
    streetAddress: address?.streetAddress || undefined,
    postCode: address?.postCode || undefined,
    city: address?.city || undefined,
  };
}

// Filter out any empty strings from the object (otherwise the mutation fails)
// remove the identifier if it's empty (otherwise the mutation fails)
function transformOrganisation(org: OrganisationFormValues) {
  return {
    name: org?.name || undefined,
    identifier: org?.identifier || undefined,
    address: isAddressValid(org?.address)
      ? transformAddress(org?.address)
      : undefined,
    coreBusiness: org?.coreBusiness || undefined,
  };
}

function convertApplicationToForm(
  app?: Maybe<Node>
): ApplicationFormPage3Values {
  return {
    pk: app?.pk ?? 0,
    applicantType: app?.applicantType ?? undefined,
    organisation: convertOrganisation(app?.organisation),
    contactPerson: convertPerson(app?.contactPerson),
    billingAddress: convertAddress(app?.billingAddress),
    hasBillingAddress:
      app?.applicantType !== ApplicantTypeChoice.Individual &&
      app?.billingAddress?.streetAddressFi != null,
    additionalInformation: app?.additionalInformation ?? "",
    homeCity: app?.homeCity?.pk ?? undefined,
  };
}

function transformApplication(
  values: ApplicationFormPage3Values
): ApplicationUpdateMutationInput {
  const shouldSaveBillingAddress =
    values.applicantType === ApplicantTypeChoice.Individual ||
    values.hasBillingAddress;
  return {
    pk: values.pk,
    applicantType: values.applicantType,
    ...(values.billingAddress != null && shouldSaveBillingAddress
      ? { billingAddress: transformAddress(values.billingAddress) }
      : {}),
    ...(values.contactPerson != null
      ? { contactPerson: transformPerson(values.contactPerson) }
      : {}),
    ...(values.organisation != null &&
    values.applicantType !== ApplicantTypeChoice.Individual
      ? { organisation: transformOrganisation(values.organisation) }
      : {}),
    ...(values.additionalInformation != null
      ? { additionalInformation: values.additionalInformation }
      : {}),
    ...(values.homeCity != null && values.homeCity !== 0
      ? { homeCity: values.homeCity }
      : {}),
  };
}

function Page3(): JSX.Element | null {
  const { options } = useOptions();
  const { cityOptions } = options;

  const { watch } = useFormContext<ApplicationFormPage3Values>();

  const type = watch("applicantType");

  switch (type) {
    case ApplicantTypeChoice.Individual:
      return <IndividualForm />;
    case ApplicantTypeChoice.Community:
    case ApplicantTypeChoice.Association:
      return <OrganisationForm homeCityOptions={cityOptions} />;
    case ApplicantTypeChoice.Company:
      return <CompanyForm />;
    default:
      return null;
  }
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-m);
`;

function Page3Wrapped(props: PropsNarrowed): JSX.Element | null {
  const { pk: appPk } = props;
  const router = useRouter();

  const id = base64encode(`ApplicationNode:${appPk}`);
  const {
    data,
    error: queryError,
    loading: isLoading,
  } = useApplicationQuery({
    variables: { id },
  });
  const { application } = data ?? {};
  const { applicationRound } = application ?? {};

  const form = useForm<ApplicationFormPage3Values>({
    mode: "onChange",
    defaultValues: convertApplicationToForm(application),
    // No resolver because different types require different mandatory values.
    // Would need to write more complex validation logic that branches based on the type.
    // resolver: zodResolver(ApplicationFormPage3Schema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
    watch,
  } = form;

  useEffect(() => {
    if (application != null) {
      reset(convertApplicationToForm(application));
    }
  }, [application, reset]);

  const { t } = useTranslation();
  const [update] = useApplicationUpdate();

  const handleSave = async (values: ApplicationFormPage3Values) => {
    // There should not be a situation where we are saving on this page without an application
    // but because of loading we might not have it when the page is rendered
    // TODO: refactor so we don't need to check it like this
    if (values.pk === 0) {
      // eslint-disable-next-line no-console
      console.error("application pk is 0");
      return 0;
    }
    return update(transformApplication(values));
  };

  const onSubmit = async (values: ApplicationFormPage3Values) => {
    try {
      const pk = await handleSave(values);
      if (pk === 0) {
        return;
      }
      router.push(getApplicationPath(pk, "preview"));
    } catch (e) {
      errorToast({ text: t("common:error.dataError") });
    }
  };

  if (id == null) {
    return <Error statusCode={404} />;
  }

  if (queryError != null) {
    // eslint-disable-next-line no-console
    console.error(queryError);
    return <Error statusCode={500} />;
  }

  if (isLoading && application == null && applicationRound == null) {
    return <CenterSpinner />;
  }

  // TODO these are 404
  // This should never happen but Apollo TS doesn't enforce it
  if (application?.pk == null || applicationRound == null) {
    return <Error statusCode={404} />;
  }

  const isValid = watch("applicantType") != null;

  return (
    <FormProvider {...form}>
      {/* TODO general mutation error (not query) */}
      <ApplicationPageWrapper
        translationKeyPrefix="application:Page3"
        application={application}
        isDirty={isDirty}
      >
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <ApplicantTypeSelector />
          <Page3 />
          <Buttons applicationPk={application.pk} submitDisabled={!isValid} />
        </Form>
      </ApplicationPageWrapper>
    </FormProvider>
  );
}

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"];
type PropsNarrowed = Exclude<Props, { notFound: boolean }>;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { locale } = ctx;

  // TODO should fetch on SSR but we need authentication for it
  const { query } = ctx;
  const { id } = query;
  const pkstring = Array.isArray(id) ? id[0] : id;
  const pk = toNumber(pkstring ?? "");
  if (pk == null || !(pk > 0)) {
    return {
      notFound: true,
      props: {
        notFound: true,
        ...(await serverSideTranslations(locale ?? "fi")),
      },
    };
  }
  return {
    props: {
      ...getCommonServerSideProps(),
      key: locale,
      pk,
      ...(await serverSideTranslations(locale ?? "fi")),
    },
  };
}

export default Page3Wrapped;
