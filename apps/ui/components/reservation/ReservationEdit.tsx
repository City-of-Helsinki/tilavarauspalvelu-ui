import {
  FetchResult,
  useLazyQuery,
  useMutation,
  useQuery,
} from "@apollo/client";
import { breakpoints } from "common/src/common/style";
import { H2 } from "common/src/common/typography";
import {
  type ApplicationRoundNode,
  type Mutation,
  type MutationAdjustReservationTimeArgs,
  type Query,
  type QueryReservationsArgs,
  type QueryReservationUnitByPkArgs,
  ReservationsReservationStateChoices,
  ReservationsReservationTypeChoices,
  type ReservationType,
  type ReservationUnitByPkType,
  type ReservationUnitByPkTypeReservableTimeSpansArgs,
  type ReservationUnitByPkTypeReservationsArgs,
} from "common/types/gql-types";
import { pick } from "lodash";
import { useRouter } from "next/router";
import { LoadingSpinner, Stepper } from "hds-react";
import { addYears } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { PendingReservation } from "common/types/common";
import { toApiDate } from "common/src/common/util";
import { Subheading } from "common/src/reservation-form/styles";
import { Container } from "common";
import { filterNonNullable } from "common/src/helpers";
import { useCurrentUser } from "@/hooks/user";
import {
  ADJUST_RESERVATION_TIME,
  GET_RESERVATION,
  LIST_RESERVATIONS,
} from "@/modules/queries/reservation";
import { JustForDesktop, JustForMobile } from "@/modules/style/layout";
import { getTranslation } from "../../modules/util";
import Sanitize from "../common/Sanitize";
import ReservationInfoCard from "./ReservationInfoCard";
import {
  OPENING_HOURS,
  RESERVATION_UNIT,
} from "@/modules/queries/reservationUnit";
import { mockOpeningTimes } from "@/modules/reservationUnit";
import EditStep0 from "./EditStep0";
import EditStep1 from "./EditStep1";
import { reservationsPrefix } from "@/modules/const";
import { APPLICATION_ROUNDS } from "@/modules/queries/applicationRound";
import { Toast } from "@/styles/util";

type Props = {
  id: number;

  logout?: () => void;
};

const allowedReservationStates: ReservationsReservationStateChoices[] = [
  ReservationsReservationStateChoices.Created,
  ReservationsReservationStateChoices.Confirmed,
  ReservationsReservationStateChoices.RequiresHandling,
  ReservationsReservationStateChoices.WaitingForPayment,
];

const Wrapper = styled.div`
  background-color: var(--color-white);
`;

const Content = styled(Container)`
  display: block;
`;

const Heading = styled(H2).attrs({ as: "h1" })``;

const Columns = styled.div`
  display: block;

  @media (min-width: ${breakpoints.l}) {
    & > div:nth-of-type(1) {
      order: 2;
    }

    display: grid;
    align-items: flex-start;
    gap: var(--spacing-l);
    margin-top: var(--spacing-xl);
    grid-template-columns: 7fr 390px;
  }
`;

const BylineWrapper = styled.div`
  max-width: 390px;
`;

const StyledStepper = styled(Stepper)`
  margin: var(--spacing-layout-m) 0 var(--spacing-layout-m);

  @media (min-width: ${breakpoints.m}) {
    max-width: 50%;
  }
`;

const PinkBox = styled.div`
  margin-top: var(--spacing-m);
  padding: 1px var(--spacing-m) var(--spacing-m);
  background-color: var(--color-suomenlinna-light);

  p {
    &:last-of-type {
      margin-bottom: 0;
    }

    margin-bottom: var(--spacing-s);
  }

  ${Subheading} {
    margin-top: var(--spacing-m);
  }

  @media (max-width: ${breakpoints.m}) {
    display: block;
  }
`;

const BylineContent = ({
  reservation,
  reservationUnit,
  step,
  initialReservation,
}: {
  reservation: ReservationType;
  reservationUnit: ReservationUnitByPkType;
  step: number;
  initialReservation: PendingReservation | null;
}) => {
  const { t } = useTranslation();

  const reservationData =
    step === 1
      ? { ...reservation, ...pick(initialReservation, ["begin", "end"]) }
      : reservation;
  const termsOfUse = getTranslation(reservationUnit, "termsOfUse");

  return (
    <BylineWrapper>
      <ReservationInfoCard
        // @ts-expect-error: TODO: fix this
        reservation={reservationData}
        reservationUnit={reservationUnit}
        type="confirmed"
      />
      {step === 0 && termsOfUse && (
        <PinkBox>
          <Subheading>{t("reservations:reservationInfoBoxHeading")}</Subheading>
          <Sanitize html={termsOfUse} />
        </PinkBox>
      )}
    </BylineWrapper>
  );
};

const ReservationEdit = ({ id }: Props): JSX.Element => {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [reservationUnit, setReservationUnit] =
    useState<ReservationUnitByPkType | null>(null);
  const [activeApplicationRounds, setActiveApplicationRounds] = useState<
    ApplicationRoundNode[]
  >([]);
  const [step, setStep] = useState(0);

  const [initialReservation, setInitialReservation] =
    useState<PendingReservation | null>(null);
  const [userReservations, setUserReservations] = useState<ReservationType[]>(
    []
  );
  const [showSuccessMsg, setShowSuccessMsg] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const now = useMemo(() => new Date().toISOString(), []);
  const { currentUser } = useCurrentUser();

  const { data } = useQuery<Query>(GET_RESERVATION, {
    fetchPolicy: "no-cache",
    variables: {
      pk: id,
    },
  });
  const reservation = data?.reservationByPk ?? undefined;

  const { data: reservationUnitData } = useQuery<
    Query,
    QueryReservationUnitByPkArgs
  >(RESERVATION_UNIT, {
    fetchPolicy: "no-cache",
    skip: !reservation?.reservationUnits?.[0]?.pk,
    variables: {
      pk: reservation?.reservationUnits?.[0]?.pk ?? 0,
    },
  });

  const [fetchAdditionalData, { data: additionalData }] = useLazyQuery<
    Query,
    QueryReservationUnitByPkArgs &
      ReservationUnitByPkTypeReservableTimeSpansArgs &
      ReservationUnitByPkTypeReservationsArgs
  >(OPENING_HOURS, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (reservationUnitData?.reservationUnitByPk) {
      const { reservationUnitByPk } = reservationUnitData;
      fetchAdditionalData({
        variables: {
          pk: reservationUnitByPk?.pk,
          startDate: String(toApiDate(new Date(now))),
          endDate: String(toApiDate(addYears(new Date(), 1))),
          from: toApiDate(new Date(now)),
          to: toApiDate(addYears(new Date(), 1)),
          state: allowedReservationStates,
          includeWithSameComponents: true,
        },
      });
    }
  }, [reservationUnitData, fetchAdditionalData, now]);

  useEffect(() => {
    const allowReservationsWithoutOpeningHours =
      reservationUnitData?.reservationUnitByPk
        ?.allowReservationsWithoutOpeningHours;

    if (reservationUnitData?.reservationUnitByPk == null) {
      return;
    }
    setReservationUnit({
      ...reservationUnitData?.reservationUnitByPk,
      reservableTimeSpans: [
        ...filterNonNullable(
          reservationUnitData?.reservationUnitByPk?.reservableTimeSpans
        ),
        ...(allowReservationsWithoutOpeningHours
          ? mockOpeningTimes
          : additionalData?.reservationUnitByPk?.reservableTimeSpans?.filter(
              (n) => n?.startDatetime != null && n?.endDatetime != null
            ) || []),
      ],
      reservations: additionalData?.reservationUnitByPk?.reservations,
    });
  }, [additionalData, reservationUnitData?.reservationUnitByPk]);

  const { data: userReservationsData } = useQuery<Query, QueryReservationsArgs>(
    LIST_RESERVATIONS,
    {
      fetchPolicy: "no-cache",
      skip: !currentUser || !reservationUnit,
      variables: {
        begin: now,
        user: currentUser?.pk?.toString(),
        reservationUnit: [reservationUnit?.pk?.toString() ?? ""],
        state: allowedReservationStates,
      },
    }
  );

  useEffect(() => {
    const reservations = userReservationsData?.reservations?.edges
      ?.map((e) => e?.node)
      .filter(
        (n): n is ReservationType =>
          n != null && n.type === ReservationsReservationTypeChoices.Normal
      )
      .filter((n) => allowedReservationStates.includes(n.state));
    setUserReservations(reservations || []);
  }, [userReservationsData]);

  const { data: applicationRoundsData } = useQuery<Query>(APPLICATION_ROUNDS, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (applicationRoundsData && reservationUnit) {
      const appRounds = filterNonNullable(
        applicationRoundsData?.applicationRounds?.edges?.map((e) => e?.node)
      ).filter(
        (applicationRound) =>
          applicationRound.reservationUnits
            ?.map((n) => n?.pk)
            .includes(reservationUnit.pk)
      );
      setActiveApplicationRounds(appRounds);
    }
  }, [applicationRoundsData, reservationUnit]);

  const [
    adjustReservationTimeMutation,
    {
      data: adjustReservationTimeData,
      error: adjustReservationTimeError,
      loading: adjustReservationTimeLoading,
    },
  ] = useMutation<Mutation, MutationAdjustReservationTimeArgs>(
    ADJUST_RESERVATION_TIME,
    {
      errorPolicy: "all",
    }
  );

  // TODO should rework this so we don't pass a string here (use Dates till we do the mutation)
  const adjustReservationTime = (
    input: MutationAdjustReservationTimeArgs["input"]
  ): Promise<FetchResult<Mutation>> => {
    // NOTE backend throws errors in some cases if we accidentally send seconds or milliseconds that are not 0
    const { begin, end, ...rest } = input;
    const beginDate = new Date(begin);
    beginDate.setSeconds(0);
    beginDate.setMilliseconds(0);
    const endDate = new Date(end);
    endDate.setSeconds(0);
    endDate.setMilliseconds(0);
    return adjustReservationTimeMutation({
      variables: {
        input: {
          begin: beginDate.toISOString(),
          end: endDate.toISOString(),
          ...rest,
        },
      },
    });
  };

  useEffect(() => {
    if (adjustReservationTimeError) {
      setErrorMsg(adjustReservationTimeError.message);
    } else if (adjustReservationTimeData) {
      setShowSuccessMsg(true);
    }
  }, [adjustReservationTimeData, adjustReservationTimeError]);

  const steps = useMemo(() => {
    return [
      {
        label: `1. ${t("reservations:steps.1")}`,
        state: step === 0 ? 0 : 1,
      },
      {
        label: `2. ${t("reservations:steps.2")}`,
        state: step === 1 ? 0 : 2,
      },
    ];
  }, [t, step]);

  if (
    !reservation ||
    !reservationUnit ||
    !additionalData ||
    activeApplicationRounds == null
  ) {
    return (
      <Wrapper>
        <Content>
          <LoadingSpinner style={{ margin: "var(--spacing-layout-xl) auto" }} />
        </Content>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Content>
        <Columns>
          <div>
            <JustForDesktop customBreakpoint={breakpoints.l}>
              <BylineContent
                reservation={reservation}
                reservationUnit={reservationUnit}
                initialReservation={initialReservation}
                step={step}
              />
            </JustForDesktop>
          </div>
          <div>
            <Heading>
              {t(
                `${
                  step === 0
                    ? "reservations:editReservationTime"
                    : "reservationCalendar:heading.pendingReservation"
                }`
              )}
            </Heading>
            <StyledStepper
              language={i18n.language}
              selectedStep={step}
              onStepClick={(e) => {
                const target = e.currentTarget;
                const s = target
                  .getAttribute("data-testid")
                  ?.replace("hds-stepper-step-", "");
                if (s != null) {
                  setStep(parseInt(s, 10));
                }
              }}
              steps={steps}
            />
            <JustForMobile customBreakpoint={breakpoints.l}>
              <BylineContent
                reservation={reservation}
                reservationUnit={reservationUnit}
                initialReservation={initialReservation}
                step={step}
              />
            </JustForMobile>
            {step === 0 && (
              <EditStep0
                reservation={reservation}
                reservationUnit={reservationUnit}
                userReservations={userReservations}
                initialReservation={initialReservation}
                setInitialReservation={setInitialReservation}
                activeApplicationRounds={activeApplicationRounds}
                setErrorMsg={setErrorMsg}
                setStep={setStep}
              />
            )}
            {step === 1 && (
              <EditStep1
                reservation={reservation}
                reservationUnit={reservationUnit}
                setErrorMsg={setErrorMsg}
                setStep={setStep}
                handleSubmit={() => {
                  if (
                    initialReservation?.begin &&
                    initialReservation?.end &&
                    reservation.pk
                  ) {
                    adjustReservationTime({
                      pk: reservation.pk,
                      begin: initialReservation.begin,
                      end: initialReservation.end,
                    });
                  }
                }}
                isSubmitting={adjustReservationTimeLoading}
              />
            )}
          </div>
        </Columns>
      </Content>
      {errorMsg && (
        <Toast
          type="error"
          label={t("reservations:reservationEditFailed")}
          position="top-center"
          autoClose={false}
          displayAutoCloseProgress={false}
          onClose={() => setErrorMsg(null)}
          dismissible
          closeButtonLabelText={t("common:error.closeErrorMsg")}
        >
          {errorMsg}
        </Toast>
      )}
      {showSuccessMsg && (
        <Toast
          type="success"
          label={t("reservations:saveNewTimeSuccess")}
          position="top-center"
          autoClose
          autoCloseDuration={3000}
          displayAutoCloseProgress
          onClose={() => router.push(`${reservationsPrefix}/${reservation.pk}`)}
          dismissible
          closeButtonLabelText={t("common:error.closeErrorMsg")}
        >
          {errorMsg}
        </Toast>
      )}
    </Wrapper>
  );
};

export default ReservationEdit;
