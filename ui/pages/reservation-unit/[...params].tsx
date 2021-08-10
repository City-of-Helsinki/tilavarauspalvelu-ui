import React from "react";
import { gql } from "@apollo/client";
import styled from "styled-components";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import router from "next/router";
import {
  IconCalendar,
  IconTicket,
  Koros,
  Notification,
  TextInput,
  Checkbox,
  Button,
  IconArrowLeft,
} from "hds-react";
import { useTranslation } from "react-i18next";
import { ReservationUnit } from "../../modules/types";
import apolloClient from "../../modules/apolloClient";
import { H1, H2 } from "../../modules/style/typography";
import { breakpoint } from "../../modules/style";
import { TwoColumnContainer } from "../../components/common/common";
import { NarrowCenteredContainer } from "../../modules/style/layout";
import { AccordionWithState as Accordion } from "../../components/common/Accordion";

type Props = {
  reservationUnit: ReservationUnit;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getServerSideProps = async ({ locale, params }) => {
  const id = Number(params.params[0]);

  const RESERVATION_UNIT = gql`
    query SelectedReservationUnit($pk: Int) {
      reservationUnit: reservationUnitByPk(pk: $pk) {
        id: pk
        name
        images {
          imageUrl
          mediumUrl
          smallUrl
          imageType
        }
        description
        termsOfUse
        reservationUnitType {
          name
        }
        maxPersons
        building: unit {
          name
        }
        location {
          addressStreet
          addressZip
          addressCity
        }
      }
    }
  `;

  if (id) {
    const { data } = await apolloClient.query({
      query: RESERVATION_UNIT,
      variables: { pk: id },
    });

    return {
      props: {
        ...(await serverSideTranslations(locale)),
        reservationUnit: {
          // TODO: remove this
          ...data.reservationUnit,
          location: {
            ...data.reservationUnit.location,
            coordinates: {
              longitude: 60.29429873400916,
              latitude: 25.07080078125,
            },
          },
        },
      },
    };
  }

  return { props: { ...(await serverSideTranslations(locale)), paramsId: id } };
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
`;

const StyledKoros = styled(Koros)`
  margin-top: var(--spacing-l);
  fill: var(--tilavaraus-gray);
`;

const BodyContainer = styled(NarrowCenteredContainer)`
  background-color: var(-color-gray);
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

const ReservationUnitReservation = ({
  reservationUnit,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  const [areTermsSpaceAccepted, setAreTermsSpaceAccepted] =
    React.useState(false);
  const [areTermsResourceAccepted, setAreTermsResourceAccepted] =
    React.useState(false);

  return (
    <>
      <Head>
        <NarrowCenteredContainer>
          <H1>{reservationUnit.name}</H1>
          <H2>{reservationUnit.building.name}</H2>
          <Description>
            <DescriptionItem>
              <IconCalendar /> Aika
            </DescriptionItem>
            <DescriptionItem>
              <IconTicket /> Hinta
            </DescriptionItem>
          </Description>
        </NarrowCenteredContainer>
        <StyledKoros className="koros" type="wave" />
      </Head>
      <BodyContainer>
        <H1>{t("reservationCalendar:newReservation")}</H1>
        <form>
          <H2 style={{ marginTop: "var(--spacing-layout-m)" }}>
            {t("reservationCalendar:reserverInfo")}
          </H2>
          <TwoColumnContainer>
            <TextInput
              label={t("reservationCalendar:label.reserver")}
              id="reserver"
            />
            <TextInput label={t("common:phone")} id="phone" />
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
            <TextInput
              label={t("reservationCalendar:label.reservationName")}
              id="reservationName"
            />
            <TextInput
              label={t("reservationCalendar:label.reservationDescription")}
              id="reservationDescription"
            />
          </OneColumnContainer>
          <AccordionContainer>
            <TermContainer>
              <Accordion
                open
                heading={t("reservationCalendar:heading.termsOfUse")}
              >
                {t("reservationCalendar:terms.space")}
              </Accordion>
              <Checkbox
                id="terms.space"
                checked={areTermsSpaceAccepted}
                onChange={(e) => setAreTermsSpaceAccepted(e.target.checked)}
                label={t("reservationCalendar:label.termsSpace")}
              />
            </TermContainer>
            <TermContainer>
              <Accordion
                open
                heading={t("reservationCalendar:heading.resourceTerms")}
              >
                {t("reservationCalendar:terms.resource")}
              </Accordion>
              <Checkbox
                id="terms.resource"
                checked={areTermsResourceAccepted}
                onChange={(e) => setAreTermsResourceAccepted(e.target.checked)}
                label={t("reservationCalendar:label.termsResource")}
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
    </>
  );
};

export default ReservationUnitReservation;
