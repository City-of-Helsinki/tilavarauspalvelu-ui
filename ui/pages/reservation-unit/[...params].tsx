import React, { useState } from "react";
import { gql } from "@apollo/client";
import styled from "styled-components";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import queryString from "query-string";
import router from "next/router";
import { isDate, isFinite } from "lodash";
import { parseISO } from "date-fns";
import {
  IconCalendar,
  Koros,
  Notification,
  TextInput,
  Checkbox,
  Button,
  IconArrowLeft,
} from "hds-react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { ReservationUnit, UserProfile } from "../../modules/types";
import apolloClient from "../../modules/apolloClient";
import { H1, H2 } from "../../modules/style/typography";
import { breakpoint } from "../../modules/style";
import { TwoColumnContainer } from "../../components/common/common";
import { NarrowCenteredContainer } from "../../modules/style/layout";
import { AccordionWithState as Accordion } from "../../components/common/Accordion";
import { isBrowser } from "../../modules/const";
import { applicationErrorText } from "../../modules/util";
import WithUserProfile from "../../components/WithUserProfile";

type Props = {
  reservationUnit: ReservationUnit;
  profile: UserProfile | null;
};

type QueryParams = {
  begin: string;
  end: string;
};

type Inputs = {
  reserver: string;
  phone: string;
  reservationName: string;
  reservationDescription: string;
  spaceTerms: boolean;
  resourceTerms: boolean;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getServerSideProps = async ({ locale, params, query }) => {
  const id = Number(params.params[0]);
  const path = params.params[1];
  const isValidDate = (date: string): boolean =>
    !!date && isDate(new Date(date)) && isFinite(new Date(date).getTime());

  const RESERVATION_UNIT = gql`
    query SelectedReservationUnit($pk: Int) {
      reservationUnit: reservationUnitByPk(pk: $pk) {
        id: pk
        name
        building: unit {
          name
        }
      }
    }
  `;

  if (
    isFinite(id) &&
    path === "reservation" &&
    isValidDate(query?.begin) &&
    isValidDate(query?.end)
  ) {
    const { data } = await apolloClient.query({
      query: RESERVATION_UNIT,
      variables: { pk: id },
    });

    return {
      props: {
        ...(await serverSideTranslations(locale)),
        reservationUnit: data.reservationUnit,
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
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
`;

const StyledKoros = styled(Koros)`
  margin-top: var(--spacing-l);
  fill: var(--tilavaraus-gray);
`;

const BodyContainer = styled(NarrowCenteredContainer)`
  background-color: var(-color-gray);
  font-family: var(--font-regular);
  font-weight: 400;

  a {
    color: var(--color-bus);
  }
`;

const StyledTextInput = styled(TextInput)`
  label {
    font-family: var(--font-medium);
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
  font-family: var(--font-regular);
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

const createReservation = ({ begin, end, profile, reservationUnit }) => {
  const reservation = {
    begin,
    end,
    user: profile.id,
    reservationUnit: reservationUnit.id,
  };

  console.log(reservation); // eslint-disable-line no-console
};

const ReservationUnitReservation = ({
  reservationUnit,
  profile,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  const [formStatus, setFormStatus] = useState<"pending" | "error" | "sent">(
    "pending"
  );
  const searchParams = isBrowser ? window.location.search : "";
  const { begin, end }: QueryParams = queryString.parse(
    searchParams
  ) as QueryParams;

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

  const { register, handleSubmit, errors } = useForm<Inputs>();
  const onSubmit = (data) => {
    createReservation({ ...data, begin, end, profile, reservationUnit });
    setFormStatus("sent");
  };

  const timeString = `${beginDate} ${beginTime} - ${
    endDate !== beginDate ? endDate : ""
  }
  ${endTime}`;

  const [areTermsSpaceAccepted, setAreTermsSpaceAccepted] = useState(false);
  const [areTermsResourceAccepted, setAreTermsResourceAccepted] =
    useState(false);

  if (!isBrowser) {
    return null;
  }

  return (
    <>
      <Head>
        <NarrowCenteredContainer>
          <H1>{reservationUnit.name}</H1>
          <H2>{reservationUnit.building.name}</H2>
          <Description>
            <DescriptionItem>
              <IconCalendar /> {timeString}
            </DescriptionItem>
            {/* <DescriptionItem>
              <IconTicket /> Hinta
            </DescriptionItem> */}
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
              <Button variant="primary" type="submit">
                {t("reservationCalendar:saveReservation")}
              </Button>
              <Button
                variant="secondary"
                iconLeft={<IconArrowLeft />}
                onClick={() =>
                  router.push(`/reservation-unit/${reservationUnit.id}`)
                }
              >
                {t("common:prev")}
              </Button>
            </ActionContainer>
          </form>
        </BodyContainer>
      )}
      {formStatus === "sent" && (
        <BodyContainer>
          <H1>{t("reservationUnit:reservationSuccessful")}</H1>
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
            <Button
              variant="primary"
              onClick={() => router.push("/applications")}
            >
              {t("reservationUnit:gotoApplications")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push("/")}
              iconLeft={<IconArrowLeft />}
            >
              {t("common:gotoFrontpage")}
            </Button>
          </ActionContainer>
        </BodyContainer>
      )}
    </>
  );
};

export default WithUserProfile(ReservationUnitReservation);
