import React from "react";
import {
  IconArrowRight,
  IconCalendar,
  IconLinkExternal,
  IconSignout,
} from "hds-react";
import { Trans, useTranslation } from "next-i18next";
import Link from "next/link";
import styled from "styled-components";
import { fontRegular, H2 } from "common/src/common/typography";
import {
  type PaymentOrderNode,
  type ReservationQuery,
  ReservationStateChoice,
} from "@gql/gql-types";
import { Subheading } from "common/src/reservation-form/styles";
import { breakpoints } from "common/src/common/style";
import { IconButton } from "common/src/components";
import { signOut } from "common/src/browserHelpers";
import { getReservationUnitInstructionsKey } from "../../modules/reservationUnit";
import { getTranslation, reservationsUrl } from "../../modules/util";
import { BlackButton } from "../../styles/util";
import { Paragraph } from "./styles";
import { reservationUnitPath } from "../../modules/const";
import { ButtonLikeLink } from "../common/ButtonLikeLink";

type Node = NonNullable<ReservationQuery["reservation"]>;
type Props = {
  reservation: Node;
  apiBaseUrl: string;
  order?: PaymentOrderNode;
};

const Wrapper = styled.div`
  align-items: flex-start;
  margin-bottom: var(--spacing-layout-l);
`;

const Heading = styled(H2).attrs({ as: "h1" })``;

const ActionContainer1 = styled.div`
  margin: var(--spacing-m) 0 var(--spacing-l);
  display: flex;
  gap: var(--spacing-m);
  flex-direction: column;

  > button {
    max-width: 20rem;
  }

  @media (min-width: ${breakpoints.l}) {
    flex-direction: row;
  }
`;

const InlineStyledLink = styled(Link)`
  && {
    display: inline;
    color: var(--color-black);
    text-decoration: underline;
    ${fontRegular};
  }
`;

const ReturnLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ReturnLinkList = ({
  reservationUnitHome,
  apiBaseUrl,
  style,
}: {
  reservationUnitHome: string;
  apiBaseUrl: string;
  style: React.CSSProperties;
}): JSX.Element => {
  const { t } = useTranslation();
  return (
    <ReturnLinkContainer style={style}>
      <IconButton
        href={reservationUnitHome}
        label={t("reservations:backToReservationUnit")}
        icon={<IconArrowRight aria-hidden />}
      />
      <IconButton
        href="/"
        label={t("common:gotoFrontpage")}
        icon={<IconArrowRight aria-hidden />}
      />
      <IconButton
        icon={<IconSignout aria-hidden />}
        onClick={() => signOut(apiBaseUrl)}
        label={t("common:logout")}
      />
    </ReturnLinkContainer>
  );
};

function ReservationConfirmation({
  reservation,
  apiBaseUrl,
  order,
}: Props): JSX.Element {
  const { t, i18n } = useTranslation();

  const reservationUnit = reservation.reservationUnits?.[0];
  const instructionsKey = getReservationUnitInstructionsKey(reservation?.state);
  const requiresHandling =
    reservation.state === ReservationStateChoice.RequiresHandling;
  const heading = t(
    `reservationUnit:${
      requiresHandling ? "reservationInHandling" : "reservationSuccessful"
    }`
  );

  return (
    <Wrapper>
      <Heading>{heading}</Heading>
      <Paragraph style={{ margin: "var(--spacing-xl) 0" }}>
        <Trans
          i18nKey={`reservationUnit:reservationReminderText${
            requiresHandling ? "Handling" : ""
          }`}
          t={t}
          components={{
            br: <br />,
            lnk: (
              <InlineStyledLink href={reservationsUrl}>
                Omat varaukset -sivulta
              </InlineStyledLink>
            ),
          }}
        >
          {" "}
        </Trans>
      </Paragraph>
      {reservation.state === ReservationStateChoice.Confirmed && (
        <ActionContainer1 style={{ marginBottom: "var(--spacing-2-xl)" }}>
          <ButtonLikeLink
            size="large"
            disabled={!reservation.calendarUrl}
            data-testid="reservation__confirmation--button__calendar-url"
            href={reservation.calendarUrl ?? ""}
            locale={false}
          >
            {t("reservations:saveToCalendar")}
            <IconCalendar aria-hidden />
          </ButtonLikeLink>
          {order?.receiptUrl && (
            <BlackButton
              data-testid="reservation__confirmation--button__receipt-link"
              onClick={() =>
                window.open(
                  `${order.receiptUrl}&lang=${i18n.language}`,
                  "_blank"
                )
              }
              variant="secondary"
              iconRight={<IconLinkExternal aria-hidden />}
            >
              {t("reservations:downloadReceipt")}
            </BlackButton>
          )}
        </ActionContainer1>
      )}
      {reservationUnit != null &&
        instructionsKey != null &&
        getTranslation(reservationUnit, String(instructionsKey)) && (
          <>
            <Subheading>{t("reservations:reservationInfo")}</Subheading>
            <Paragraph style={{ margin: "var(--spacing-xl) 0" }}>
              {getTranslation(reservationUnit, String(instructionsKey))}
            </Paragraph>
          </>
        )}
      {reservationUnit != null && (
        <ReturnLinkList
          reservationUnitHome={reservationUnitPath(Number(reservationUnit?.pk))}
          apiBaseUrl={apiBaseUrl}
          style={{
            marginTop: "var(--spacing-3-xl)",
          }}
        />
      )}
    </Wrapper>
  );
}

export default ReservationConfirmation;
