import React, { useContext, useState } from "react";
import { gql } from "@apollo/client";
import styled from "styled-components";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import router from "next/router";
import { differenceInMinutes, parseISO } from "date-fns";
import {
  IconCalendar,
  Koros,
  Notification,
  TextInput,
  Checkbox,
  IconArrowLeft,
  IconCheckCircle,
} from "hds-react";
import { useForm } from "react-hook-form";
import { GetServerSideProps } from "next";
import { isFinite } from "lodash";
import { Trans, useTranslation } from "react-i18next";
import { UserProfile } from "../../../modules/types";
import apolloClient from "../../../modules/apolloClient";
import {
  fontRegular,
  fontMedium,
  H1,
  H2,
  Strong,
} from "../../../modules/style/typography";
import { breakpoint } from "../../../modules/style";
import { TwoColumnContainer } from "../../../components/common/common";
import { NarrowCenteredContainer } from "../../../modules/style/layout";
import { AccordionWithState as Accordion } from "../../../components/common/Accordion";
import { isBrowser } from "../../../modules/const";
import {
  applicationErrorText,
  capitalize,
  formatDurationMinutes,
  getTranslation,
} from "../../../modules/util";
import WithUserProfile from "../../../components/WithUserProfile";
import { MediumButton } from "../../../styles/util";
import { DataContext } from "../../../context/DataContext";
import { ReservationUnitType } from "../../../modules/gql-types";
import ErrorPage from "../../404";

type Props = {
  reservationUnit: ReservationUnitType;
  profile: UserProfile | null;
};

type Inputs = {
  reserver: string;
  phone: string;
  reservationName: string;
  reservationDescription: string;
  spaceTerms: boolean;
  resourceTerms: boolean;
};

type Reservation = {
  begin: string;
  end: string;
  user: string;
  reservationUnit: number;
  reserver: string;
  phone: string;
  reservationName: string;
  reservationDescription: string;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}) => {
  const id = Number(params.params[0]);
  const path = params.params[1];

  const RESERVATION_UNIT = gql`
    query SelectedReservationUnit($pk: Int) {
      reservationUnitByPk(pk: $pk) {
        pk
        nameFi
        nameEn
        nameSv
        unit {
          nameFi
          nameEn
          nameSv
        }
      }
    }
  `;

  if (isFinite(id) && path === "reservation") {
    const { data } = await apolloClient.query({
      query: RESERVATION_UNIT,
      variables: { pk: id },
    });

    return {
      props: {
        reservationUnit: data.reservationUnitByPk,
        ...(await serverSideTranslations(locale)),
      },
    };
  }

  return {
    notFound: true,
  };
};

const Head = styled.div`
  padding: var(--spacing-layout-m) 0 0;
  background-color: var(--color-white);
`;

const Description = styled.div``;

const DescriptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  ${fontMedium}
`;

const StyledKoros = styled(Koros)`
  margin-top: var(--spacing-l);
  fill: var(--tilavaraus-gray);
`;

const BodyContainer = styled(NarrowCenteredContainer)`
  background-color: var(-color-gray);
  ${fontRegular}

  a {
    color: var(--color-bus);
  }
`;

const StyledTextInput = styled(TextInput)`
  label {
    ${fontMedium}
  }
`;

const StyledNotification = styled(Notification).attrs({
  style: {
    "--notification-padding": "var(--spacing-m)",
  },
})`
  svg {
    position: relative;
    top: -3px;
  }
`;

const Heading = styled(H1)`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  svg {
    color: var(--color-tram);
  }
`;

const Subheading = styled(H2)`
  margin-top: var(--spacing-2-xs);
`;

const OneColumnContainer = styled(TwoColumnContainer)`
  grid-template-columns: 1fr;
  margin-bottom: var(--spacing-3-xl);

  @media (min-width: ${breakpoint.m}) {
    width: 48.638%;
  }
`;

const AccordionContainer = styled.div`
  @media (min-width: ${breakpoint.m}) {
    width: 70%;
  }

  white-space: pre-line;
  line-height: var(--lineheight-l);

  button {
    margin-bottom: var(--spacing-xs);
  }
`;

const TermContainer = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const ActionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  button {
    margin-bottom: var(--spacing-m);

    @media (min-width: ${breakpoint.m}) {
      width: 18rem;
    }
  }
`;

const ReservationUnitReservation = ({
  reservationUnit,
  profile,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const { reservation: reservationData } = useContext(DataContext);

  const [formStatus, setFormStatus] = useState<"pending" | "error" | "sent">(
    "pending"
  );
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const [areTermsSpaceAccepted, setAreTermsSpaceAccepted] = useState(false);
  const [areTermsResourceAccepted, setAreTermsResourceAccepted] =
    useState(false);

  const { register, handleSubmit, errors } = useForm<Inputs>();

  if (!reservationData?.begin || !reservationData?.end) {
    return <ErrorPage />;
  }

  const { begin, end } = reservationData;

  const beginDate = t("common:dateWithWeekday", {
    date: begin && parseISO(begin),
  });

  const beginTime = t("common:timeWithPrefix", {
    date: begin && parseISO(begin),
  });

  const endDate = t("common:dateWithWeekday", {
    date: end && parseISO(end),
  });

  const endTime = t("common:time", {
    date: end && parseISO(end),
  });

  const duration = differenceInMinutes(new Date(end), new Date(begin));
  const timeString = `${beginDate} ${beginTime} - ${
    endDate !== beginDate ? endDate : ""
  }
  ${endTime} (${t("common:duration", {
    duration: formatDurationMinutes(duration),
  })})`;

  const onSubmit = (data) => {
    // createReservation({ ...data, begin, end, profile, reservationUnit });
    setReservation({
      begin,
      end,
      user: profile.email,
      reservationUnit: reservationUnit.pk,
      reserver: data.reserver,
      phone: data.phone,
      reservationName: data.reservationName,
      reservationDescription: data.reservationDescription,
    });
    console.log(reservation); // eslint-disable-line no-console
    setFormStatus("sent");
  };

  if (!isBrowser) {
    return null;
  }

  return (
    <>
      <Head>
        <NarrowCenteredContainer>
          <H1>{getTranslation(reservationUnit, "name")}</H1>
          <H2>{getTranslation(reservationUnit.unit, "name")}</H2>
          <Description>
            <DescriptionItem>
              <IconCalendar /> {capitalize(timeString)}
            </DescriptionItem>
          </Description>
        </NarrowCenteredContainer>
        <StyledKoros className="koros" type="wave" />
      </Head>
      {formStatus === "pending" && (
        <BodyContainer>
          <H1>{t("reservationCalendar:newReservation")}</H1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <H2 style={{ marginTop: "var(--spacing-layout-m)" }}>
              {t("reservationCalendar:reserverInfo")}
            </H2>
            <TwoColumnContainer>
              <StyledTextInput
                label={`${t("reservationCalendar:label.reserver")}*`}
                id="reserver"
                name="reserver"
                ref={register({ required: true })}
                errorText={
                  errors.reserver && applicationErrorText(t, "requiredField")
                }
              />
              <StyledTextInput
                label={`${t("common:phone")}*`}
                id="phone"
                name="phone"
                ref={register({ required: true })}
                errorText={
                  errors.phone && applicationErrorText(t, "requiredField")
                }
              />
            </TwoColumnContainer>
            <H2 style={{ marginTop: "var(--spacing-layout-xl)" }}>
              {t("reservationCalendar:reservationInfo")}
            </H2>
            <StyledNotification
              type="alert"
              label={`${t(
                "reservationCalendar:notification.reservationAlertTitle"
              )}`}
            >
              {t("reservationCalendar:notification.reservationAlertBody")}
            </StyledNotification>
            <OneColumnContainer>
              <StyledTextInput
                label={`${t("reservationCalendar:label.reservationName")}*`}
                id="reservationName"
                name="reservationName"
                ref={register({ required: true })}
                errorText={
                  errors.reservationName &&
                  applicationErrorText(t, "requiredField")
                }
              />
              <StyledTextInput
                label={`${t(
                  "reservationCalendar:label.reservationDescription"
                )}*`}
                id="reservationDescription"
                name="reservationDescription"
                ref={register({ required: true })}
                errorText={
                  errors.reservationDescription &&
                  applicationErrorText(t, "requiredField")
                }
              />
            </OneColumnContainer>
            <AccordionContainer>
              <TermContainer>
                <Accordion
                  open
                  heading={t("reservationCalendar:heading.termsOfUse")}
                >
                  {t("reservationCalendar:spaceTerms")}
                </Accordion>
                <Checkbox
                  id="spaceTerms"
                  name="spaceTerms"
                  checked={areTermsSpaceAccepted}
                  onChange={(e) => setAreTermsSpaceAccepted(e.target.checked)}
                  label={`${t("reservationCalendar:label.termsSpace")}*`}
                  ref={register({ required: true })}
                  errorText={
                    !!errors.spaceTerms &&
                    applicationErrorText(t, "requiredField")
                  }
                />
              </TermContainer>
              <TermContainer>
                <Accordion
                  open
                  heading={t("reservationCalendar:heading.resourceTerms")}
                >
                  {t("reservationCalendar:resourceTerms")}
                </Accordion>
                <Checkbox
                  id="resourceTerms"
                  name="resourceTerms"
                  checked={areTermsResourceAccepted}
                  onChange={(e) =>
                    setAreTermsResourceAccepted(e.target.checked)
                  }
                  label={`${t("reservationCalendar:label.termsResource")}*`}
                  ref={register({ required: true })}
                  errorText={
                    !!errors.resourceTerms &&
                    applicationErrorText(t, "requiredField")
                  }
                />
              </TermContainer>
            </AccordionContainer>
            <ActionContainer>
              <MediumButton variant="primary" type="submit">
                {t("reservationCalendar:saveReservation")}
              </MediumButton>
              <MediumButton
                variant="secondary"
                iconLeft={<IconArrowLeft />}
                onClick={() =>
                  router.push(`/reservation-unit/${reservationUnit.pk}`)
                }
              >
                {t("common:prev")}
              </MediumButton>
            </ActionContainer>
          </form>
        </BodyContainer>
      )}
      {formStatus === "sent" && (
        <BodyContainer>
          <TwoColumnContainer style={{ alignItems: "flex-start" }}>
            <div>
              <Heading>
                <IconCheckCircle size="m" />
                {t("reservationUnit:reservationSuccessful")}
              </Heading>
              <p>
                <Trans
                  i18nKey="reservationUnit:reservationReminderText"
                  t={t}
                  values={{ profile }}
                  components={{
                    emailLink: (
                      <a href={`mailto:${profile.email}`}>{profile.email}</a>
                    ),
                  }}
                />
              </p>
              <p>
                <Trans
                  i18nKey="reservationUnit:loadReservationCalendar"
                  t={t}
                  components={{
                    calendarLink: <a href="foobariavaan"> </a>, // TODO change
                  }}
                />
              </p>
              <p>
                {t("common:thanksForUsingVaraamo")}
                <br />
                <a
                  href={t(`footer:Navigation.feedback.href`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("common:sendFeedback")}
                </a>
              </p>
              <ActionContainer style={{ marginTop: "var(--spacing-3-xl)" }}>
                <MediumButton
                  variant="primary"
                  onClick={() => router.push("/applications")}
                >
                  {t("reservationUnit:gotoApplications")}
                </MediumButton>
                <MediumButton
                  variant="secondary"
                  onClick={() => router.push("/")}
                  iconLeft={<IconArrowLeft />}
                >
                  {t("common:gotoFrontpage")}
                </MediumButton>
              </ActionContainer>
            </div>
            <div>
              <Subheading>{t("reservationUnit:additionalInfo")}</Subheading>
              <p>
                <Strong>
                  {t("reservationCalendar:label.reservationName")}
                </Strong>
                <div>{reservation.reservationName}</div>
              </p>
              <p>
                <Strong>{t("reservationCalendar:label.reserver")}</Strong>
                <div>{reservation.reserver}</div>
              </p>
              <p>
                <Strong>
                  {t("reservationCalendar:label.reservationDescription")}
                </Strong>
                <div>{reservation.reservationDescription}</div>
              </p>
              <p>
                <Strong>
                  {t("reservationCalendar:label.reservationDate")}
                </Strong>
                <div style={{ textTransform: "capitalize" }}>
                  {beginDate} {beginTime} - {endDate !== beginDate && endDate}{" "}
                  {endTime}
                </div>
              </p>
              <p>
                <Strong>
                  {t("reservationCalendar:label.reservationSpace")}
                </Strong>
                <div>{getTranslation(reservationUnit, "name")}</div>
              </p>
              <p>
                <Strong>{t("common:phone")}</Strong>
                <div>{reservation.phone}</div>
              </p>
            </div>
          </TwoColumnContainer>
        </BodyContainer>
      )}
    </>
  );
};

export default WithUserProfile(ReservationUnitReservation);
