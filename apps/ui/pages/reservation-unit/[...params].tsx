import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useLocalStorage } from "react-use";
import { Stepper } from "hds-react";
import { FormProvider, useForm } from "react-hook-form";
import type { GetServerSidePropsContext } from "next";
import { useTranslation } from "next-i18next";
import { breakpoints } from "common/src/common/style";
import { fontRegular, H2 } from "common/src/common/typography";
import {
  CustomerTypeChoice,
  State,
  useConfirmReservationMutation,
  useUpdateReservationMutation,
  useDeleteReservationMutation,
  type ReservationQuery,
  ReservationUnitDocument,
  type ReservationUnitQuery,
  type ReservationUnitQueryVariables,
  OptionsDocument,
  OptionsQuery,
  OptionsQueryVariables,
  ReservationDocument,
  ReservationQueryVariables,
  useReservationLazyQuery,
} from "@gql/gql-types";
import { Inputs } from "common/src/reservation-form/types";
import { Subheading } from "common/src/reservation-form/styles";
import { getReservationApplicationFields } from "common/src/reservation-form/util";
import { Container } from "common";
import { createApolloClient } from "@/modules/apolloClient";
import { reservationUnitPrefix, reservationsPrefix } from "@/modules/const";
import { getTranslation, reservationsUrl } from "@/modules/util";
import Sanitize from "@/components/common/Sanitize";
import { getReservationUnitPrice } from "@/modules/reservationUnit";
import {
  getCheckoutUrl,
  getReservationApplicationMutationValues,
} from "@/modules/reservation";
import { ReservationProps } from "@/context/DataContext";
import { ReservationInfoCard } from "@/components/reservation/ReservationInfoCard";
import Step0 from "@/components/reservation/Step0";
import Step1 from "@/components/reservation/Step1";
import { ReservationStep } from "@/modules/types";
import { JustForDesktop } from "@/modules/style/layout";
import { PinkBox } from "@/components/reservation-unit/ReservationUnitStyles";
import { Toast } from "@/styles/util";
import {
  getCommonServerSideProps,
  getGenericTerms,
} from "@/modules/serverUtils";
import { useConfirmNavigation } from "@/hooks/useConfirmNavigation";
import { base64encode, filterNonNullable } from "common/src/helpers";
import { containsField } from "common/src/metaFieldsHelpers";

const StyledContainer = styled(Container)`
  padding-top: var(--spacing-m);

  @media (min-width: ${breakpoints.m}) {
    margin-bottom: var(--spacing-layout-l);
  }
`;

const Columns = styled.div`
  grid-template-columns: 1fr;
  display: grid;
  align-items: flex-start;
  gap: var(--spacing-m);

  @media (min-width: ${breakpoints.m}) {
    & > div:nth-of-type(1) {
      order: 2;
    }

    margin-top: var(--spacing-xl);
    grid-template-columns: 1fr 378px;
  }
`;

const Title = styled(H2).attrs({ as: "h1" })`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: 0;

  svg {
    color: var(--color-tram);
  }
`;

const BodyContainer = styled.div`
  ${fontRegular}

  a {
    color: var(--color-bus);
  }
`;

const StyledStepper = styled(Stepper)<{ small: boolean }>`
  ${({ small }) => !small && "max-width: 300px;"}
`;

/// We want to get rid of the local storage
/// but there is still code that requires it to be used.
/// Other pages (ex. login + book) get confused if we don't clear it here.
const useRemoveStoredReservation = () => {
  const [storedReservation, , removeStoredReservation] =
    useLocalStorage<ReservationProps>("reservation");

  useEffect(() => {
    if (storedReservation) removeStoredReservation();
  }, [storedReservation, removeStoredReservation]);
};

// NOTE back / forward buttons (browser) do NOT work properly
// router.beforePopState could be used to handle them but it's super hackish
// the correct solution is to create separate pages (files) for each step (then next-router does this for free)
// Known issues with using beforePopState:
// - using back button changes the url but if the confirmation is cancelled the page is not changed
//   so it will break at least refresh (but next links still work like the url was correct)
// - it interfares with the confirmNavigation (incorrect url changes will break it)
// - using back multiple times breaks the confirmation hook (bypassing it or blocking the navigation while deleting the reservation)
// - requires complex logic to handle the steps and keep the url in sync with what's on the page
// - forward / backward navigation work differently
function ReservationUnitReservation(props: PropsNarrowed): JSX.Element | null {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const {
    reservationUnit,
    reservationPurposes,
    ageGroups,
    cities,
    termsOfUse,
  } = props;

  const [refetch, { data: resData }] = useReservationLazyQuery({
    variables: { id: props.reservation.id },
    fetchPolicy: "no-cache",
  });

  const reservation = resData?.reservation ?? props.reservation;
  // it should be Created only here (SSR should have redirected)
  if (reservation.state !== State.Created) {
    // eslint-disable-next-line no-console
    console.warn(
      "should NOT be here when reservation state is ",
      reservation.state
    );
  }

  useRemoveStoredReservation();

  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Get prefilled profile user fields from the reservation (backend fills them when created).
  // NOTE Using pick makes the types way too complex; easier to just define the fields here.
  const defaultValues = {
    reserveeFirstName: reservation?.reserveeFirstName ?? "",
    reserveeLastName: reservation?.reserveeLastName ?? "",
    reserveePhone: reservation?.reserveePhone ?? "",
    reserveeEmail: reservation?.reserveeEmail ?? "",
    reserveeAddressStreet: reservation?.reserveeAddressStreet ?? "",
    reserveeAddressCity: reservation?.reserveeAddressCity ?? "",
    reserveeAddressZip: reservation?.reserveeAddressZip ?? "",
    // TODO is this correct? it used to just pick the homeCity (but that makes no sense since it's typed as a number)
    // no it's not correct, the types and MetaFields are based on a number but the front sets it as { label: string, value: number }
    // requires typing the useFormContext properly and refactoring all setters.
    homeCity: reservation?.homeCity?.pk ?? undefined,
  };
  // TODO is defaultValues correct? it's prefilled from the profile data and we are not refetching at any point.
  // If we would refetch values would be more correct with reset hook.
  // Also if this is ever initialised without the data it will not prefill the form.
  const form = useForm<Inputs>({ defaultValues, mode: "onBlur" });
  const { handleSubmit, watch } = form;

  const reserveeType = watch("reserveeType");

  const requireHandling =
    reservationUnit?.requireReservationHandling ||
    reservation?.applyingForFreeOfCharge;

  const steps: ReservationStep[] = useMemo(() => {
    const price = getReservationUnitPrice({
      reservationUnit,
      pricingDate: reservation?.begin
        ? new Date(reservation?.begin)
        : undefined,
      asNumeral: true,
    });

    const stepLength = price === "0" || requireHandling ? 2 : 5;

    return Array.from(Array(stepLength)).map((_n, i) => {
      const state = i === step ? 0 : i < step ? 1 : 2;

      return {
        label: `${i + 1}. ${t(`reservations:steps.${i + 1}`)}`,
        state,
      };
    });
  }, [step, requireHandling, reservationUnit, reservation, t]);

  const [deleteReservation] = useDeleteReservationMutation({
    errorPolicy: "all",
    onError: () => {
      router.push(`${reservationUnitPrefix}/${reservationUnit?.pk}`);
    },
  });

  const confirmMessage = t("reservations:confirmNavigation");
  // NOTE this is the only place where reservation is deleted, don't add a second place or it gets called repeatedly
  const onNavigationConfirmed = useCallback(() => {
    deleteReservation({
      variables: {
        input: {
          pk: reservation?.pk?.toString() ?? "",
        },
      },
    });
  }, [deleteReservation, reservation?.pk]);

  // whitelist to allow language change and confirmation
  const whitelist = [
    RegExp(`.*/reservations/${reservation?.pk}/confirmation`),
    RegExp(
      `.*/reservation-unit/${reservationUnit?.pk}/reservation/${reservation?.pk}`
    ),
  ];
  // only block nextjs navigation (we should not have any <a> links and we don't want to block refresh)
  useConfirmNavigation({
    confirm: true,
    confirmMessage,
    onNavigationConfirmed,
    whitelist,
  });

  const [updateReservation] = useUpdateReservationMutation({
    errorPolicy: "all",
    onCompleted: async (data) => {
      if (data.updateReservation?.state === "CANCELLED") {
        router.push(`${reservationUnitPrefix}/${reservationUnit?.pk}`);
      } else {
        await refetch();
        setStep(1);
        window.scrollTo(0, 0);
      }
    },
  });

  const [confirmReservation] = useConfirmReservationMutation({
    onCompleted: (data) => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      const { pk, state } = data.confirmReservation ?? {};
      if (pk == null) {
        setErrorMsg(t("errors:general_error"));
        return;
      }

      if (state === State.Confirmed || state === State.RequiresHandling) {
        router.push(`${reservationsUrl}${pk}/confirmation`);
      } else if (steps?.length > 2) {
        const { order } = data.confirmReservation ?? {};
        const checkoutUrl = getCheckoutUrl(order, i18n.language);

        if (checkoutUrl) {
          router.push(checkoutUrl);
        } else {
          // eslint-disable-next-line no-console
          console.warn("No checkout url found");
          setErrorMsg(t("errors:general_error"));
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn("Confirm reservation mutation returning something odd");
        setErrorMsg(t("errors:general_error"));
      }
    },
  });

  const { pk: reservationPk } = reservation || {};
  if (!ageGroups || ageGroups.length < 1) {
    // eslint-disable-next-line no-console
    console.warn("No ageGroups received!");
  }

  // TODO why isn't this on the SSR side? the creation of the options that is
  const sortedAgeGroups = ageGroups.sort((a, b) => a.minimum - b.minimum);
  const purposeOptions = reservationPurposes.map((purpose) => ({
    label: getTranslation(purpose, "name"),
    value: purpose.pk ?? 0,
  }));
  const ageGroupOptions = [
    // the sortedAgeGroups array has "1 - 99" as the first element, so let's move it to the end for correct order
    ...sortedAgeGroups.slice(1),
    ...sortedAgeGroups.slice(0, 1),
  ].map((ageGroup) => ({
    label: `${ageGroup.minimum} - ${ageGroup.maximum ?? ""}`,
    value: ageGroup.pk ?? 0,
  }));
  const homeCityOptions = cities.map((city) => ({
    label: getTranslation(city, "name"),
    value: city.pk ?? 0,
  }));

  const options = {
    purpose: purposeOptions,
    ageGroup: ageGroupOptions,
    homeCity: homeCityOptions,
  };

  const pageTitle =
    step === 0
      ? t("reservationCalendar:heading.newReservation")
      : t("reservationCalendar:heading.pendingReservation");

  // TODO all this is copy pasta from EditStep1
  const supportedFields = filterNonNullable(
    reservationUnit?.metadataSet?.supportedFields
  );
  const generalFields = getReservationApplicationFields({
    supportedFields,
    reserveeType: "common",
  }).filter((n) => n !== "reserveeType");

  const type = containsField(supportedFields, "reserveeType")
    ? reserveeType
    : CustomerTypeChoice.Individual;
  const reservationApplicationFields = getReservationApplicationFields({
    supportedFields,
    reserveeType: type,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: type the form
  const onSubmitStep0 = async (payload: any): Promise<void> => {
    const hasReserveeTypeField = containsField(supportedFields, "reserveeType");
    if (hasReserveeTypeField && !reserveeType) {
      throw new Error("Reservee type is required");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: type the form
    const normalizedPayload = Object.keys(payload).reduce<any>((acc, key) => {
      if (key === "showBillingAddress") {
        return acc;
      }
      acc[key] = {}.propertyIsEnumerable.call(payload[key] || {}, "value")
        ? payload[key].value
        : payload[key];
      return acc;
    }, {});

    const input = getReservationApplicationMutationValues(
      normalizedPayload,
      supportedFields,
      hasReserveeTypeField ? reserveeType : CustomerTypeChoice.Individual
    );

    try {
      await updateReservation({
        variables: {
          input: {
            pk: reservationPk ?? 0,
            ...input,
            reserveeLanguage: i18n.language,
          },
        },
      });
    } catch (e) {
      setErrorMsg(t("errors:general_error"));
    }
  };

  const onSubmitStep1 = async (): Promise<void> => {
    try {
      await confirmReservation({
        variables: {
          input: {
            pk: reservationPk ?? 0,
          },
        },
      });
    } catch (e) {
      setErrorMsg(t("errors:general_error"));
    }
  };

  // NOTE: only navigate away from the page if the reservation is cancelled the confirmation hook handles delete
  const cancelReservation = useCallback(async () => {
    router.push(`${reservationUnitPrefix}/${reservationUnit?.pk}`);
  }, [router, reservationUnit?.pk]);

  const shouldDisplayReservationUnitPrice = useMemo(() => {
    switch (step) {
      case 0:
        return (
          reservationUnit?.canApplyFreeOfCharge &&
          generalFields?.includes("applyingForFreeOfCharge")
        );
      case 1:
      default:
        return (
          reservationUnit?.canApplyFreeOfCharge &&
          reservation?.applyingForFreeOfCharge === true
        );
    }
  }, [step, generalFields, reservation, reservationUnit]);

  const termsOfUseContent =
    reservationUnit != null
      ? getTranslation(reservationUnit, "termsOfUse")
      : null;

  const infoReservation = {
    ...reservation,
    reservationUnit: reservationUnit != null ? [reservationUnit] : [],
  };

  return (
    <StyledContainer>
      <Columns>
        <div>
          <ReservationInfoCard
            reservation={infoReservation}
            type="pending"
            shouldDisplayReservationUnitPrice={
              shouldDisplayReservationUnitPrice
            }
          />
          {termsOfUseContent && (
            <JustForDesktop>
              <PinkBox>
                <Subheading>
                  {t("reservations:reservationInfoBoxHeading")}
                </Subheading>
                <Sanitize html={termsOfUseContent} />
              </PinkBox>
            </JustForDesktop>
          )}
        </div>
        <BodyContainer>
          <FormProvider {...form}>
            <div>
              <Title>{pageTitle}</Title>
              {/* TODO what's the logic here?
               * in what case are there more than 2 steps?
               * why do we not show that?
               * TODO why isn't this shown when creating a paid version? I think there was on purpose reason for that? maybe?
               */}
              {steps.length <= 2 && (
                <StyledStepper
                  language={i18n.language}
                  selectedStep={step}
                  small={false}
                  onStepClick={(e) => {
                    const target = e.currentTarget;
                    const s = target
                      .getAttribute("data-testid")
                      ?.replace("hds-stepper-step-", "");
                    if (s) {
                      setStep(parseInt(s, 10));
                    }
                  }}
                  steps={steps}
                />
              )}
            </div>
            {step === 0 && reservationUnit != null && (
              <Step0
                reservationUnit={reservationUnit}
                handleSubmit={handleSubmit(onSubmitStep0)}
                generalFields={generalFields}
                reservationApplicationFields={reservationApplicationFields}
                cancelReservation={cancelReservation}
                options={options}
              />
            )}
            {step === 1 && reservation != null && reservationUnit != null && (
              <Step1
                reservation={reservation}
                reservationUnit={reservationUnit}
                handleSubmit={handleSubmit(onSubmitStep1)}
                generalFields={generalFields}
                reservationApplicationFields={reservationApplicationFields}
                options={options}
                reserveeType={reserveeType}
                // TODO this is correct but confusing.
                // There used to be 5 steps for payed reservations but the stepper is hidden for them now.
                requiresHandling={steps.length > 2}
                setStep={setStep}
                genericTerms={termsOfUse.genericTerms}
              />
            )}
          </FormProvider>
        </BodyContainer>
      </Columns>
      {errorMsg && (
        <Toast
          type="error"
          label={t("reservationUnit:reservationUpdateFailed")}
          position="top-center"
          autoClose
          autoCloseDuration={4000}
          displayAutoCloseProgress={false}
          onClose={() => setErrorMsg(null)}
          dismissible
          closeButtonLabelText={t("common:error.closeErrorMsg")}
        >
          {errorMsg}
        </Toast>
      )}
    </StyledContainer>
  );
}

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"];
type PropsNarrowed = Exclude<Props, { notFound: boolean }>;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { locale, params } = ctx;
  const [reservationUnitPk, path, reservationPk] = params?.params ?? [];
  const commonProps = getCommonServerSideProps();
  const apolloClient = createApolloClient(commonProps.apiBaseUrl, ctx);

  const resUnitPk = Number(reservationUnitPk);
  const resPk = Number(reservationPk);
  if (resUnitPk > 0 && resPk > 0 && path === "reservation") {
    const id = base64encode(`ReservationUnitNode:${resUnitPk}`);
    const { data } = await apolloClient.query<
      ReservationUnitQuery,
      ReservationUnitQueryVariables
    >({
      query: ReservationUnitDocument,
      variables: { id },
      fetchPolicy: "no-cache",
    });
    const { reservationUnit } = data || {};

    const genericTerms = await getGenericTerms(apolloClient);
    const { data: paramsData } = await apolloClient.query<
      OptionsQuery,
      OptionsQueryVariables
    >({
      query: OptionsDocument,
      fetchPolicy: "no-cache",
    });

    const { data: resData } = await apolloClient.query<
      ReservationQuery,
      ReservationQueryVariables
    >({
      query: ReservationDocument,
      variables: { id: base64encode(`ReservationNode:${resPk}`) },
      fetchPolicy: "no-cache",
    });

    const reservationPurposes = filterNonNullable(
      paramsData.reservationPurposes?.edges?.map((e) => e?.node)
    );
    const ageGroups = filterNonNullable(
      paramsData.ageGroups?.edges?.map((e) => e?.node)
    );
    const cities = filterNonNullable(
      paramsData.cities?.edges?.map((e) => e?.node)
    );

    const { reservation } = resData;

    if (
      reservation?.pk != null &&
      reservation.pk > 0 &&
      reservation?.state !== State.Created
    ) {
      return {
        redirect: {
          permanent: false,
          destination: `${reservationsPrefix}/${reservation.pk}`,
        },
        props: {
          notFound: true, // for prop narrowing
        },
      };
    }

    if (reservation != null && reservationUnit != null) {
      return {
        props: {
          ...commonProps,
          reservation,
          reservationUnit,
          reservationPurposes,
          ageGroups,
          cities,
          termsOfUse: { genericTerms },
          ...(await serverSideTranslations(locale ?? "fi")),
        },
      };
    }
  }

  return {
    props: {
      // have to double up notFound inside the props to get TS types dynamically
      notFound: true,
      ...commonProps,
      ...(await serverSideTranslations(locale ?? "fi")),
    },
    notFound: true,
  };
}

export default ReservationUnitReservation;
