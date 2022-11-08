import React, { useMemo } from "react";
import { IconTicket, IconCross, IconArrowRight } from "hds-react";
import { i18n, useTranslation } from "next-i18next";
import { parseISO } from "date-fns";
import router from "next/router";
import styled, { css } from "styled-components";
import { getReservationPrice } from "common";
import { camelCase, trim } from "lodash";
import { breakpoints } from "common/src/common/style";
import {
  capitalize,
  getMainImage,
  getTranslation,
  reservationsUrl,
} from "../../modules/util";
import IconWithText from "../common/IconWithText";
import { MediumButton, truncatedText } from "../../styles/util";
import {
  ReservationsReservationStateChoices,
  ReservationType,
} from "../../modules/gql-types";
import { canUserCancelReservation } from "../../modules/reservation";
import {
  getReservationUnitName,
  getReservationUnitPrice,
  getUnitName,
} from "../../modules/reservationUnit";
import { JustForDesktop, JustForMobile } from "../../modules/style/layout";

type CardType = "upcoming" | "past" | "cancelled";

interface Props {
  reservation: ReservationType;
  type?: CardType;
}

const Container = styled.div`
  background-color: var(--color-silver-light);
  margin-top: var(--spacing-s);
  position: relative;

  @media (min-width: ${breakpoints.m}) {
    display: grid;
    grid-template-columns: 300px 1fr;
  }

  @media (min-width: ${breakpoints.l}) {
    display: grid;
    grid-template-columns: 300px auto;

    & > div:nth-of-type(2) {
      grid-column: unset;
    }
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-xs);

  @media (min-width: ${breakpoints.s}) {
    margin: var(--spacing-s);
  }

  @media (min-width: ${breakpoints.m}) {
    justify-content: space-between;
    flex-direction: column;
  }

  @media (min-width: ${breakpoints.l}) {
    /* white-space: pre;
    flex-direction: row; */
    display: grid;
    grid-template-columns: 2fr 1fr;
  }
`;

const Details = styled.div`
  @media (min-width: ${breakpoints.l}) {
    /* width: 10px;
    white-space: pre; */
  }
`;

const Name = styled.span`
  font-size: var(--fontsize-heading-m);
  font-family: var(--font-bold);
  font-weight: 700;
  margin-bottom: 0;

  a,
  a:visited {
    color: var(--color-black-90);
    text-decoration: none;
  }
`;

const Bottom = styled.span`
  display: flex;
  flex-direction: column;
  column-gap: var(--spacing-m);
  font-weight: 500;
  font-size: var(--fontsize-body-m);
  flex-wrap: wrap;
  margin-top: var(--spacing-2-xs);
`;

const TimeStrip = styled.div``;

const Price = styled(IconWithText)`
  span {
    margin-left: var(--spacing-2-xs);
  }

  margin-bottom: var(--spacing-2-xs);
`;

const Actions = styled.div`
  display: flex;
  padding-bottom: var(--spacing-s);
  flex-direction: column-reverse;

  button {
    width: 100%;
    font-family: var(--font-medium);
    font-weight: 500;
    margin-top: var(--spacing-s);
    white-space: nowrap;
    ${truncatedText};
  }

  @media (min-width: ${breakpoints.s}) {
    flex-direction: row;
    padding-bottom: var(--spacing-m);
    gap: var(--spacing-m);
  }

  @media (min-width: ${breakpoints.m}) {
    align-self: flex-end;
    justify-self: flex-end;
    padding: 0;

    button {
      width: 170px;
    }
  }

  @media (min-width: ${breakpoints.l}) {
    /* margin-top: 120px; */
    align-self: flex-start;
    align-items: flex-end;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;

    button {
      width: unset;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-s);
`;

const ActionButton = styled(MediumButton).attrs({
  style: {
    "--color-button-primary": "var(--color-black-90)",
    "--color-bus": "var(--color-black-90)",
  },
  size: "small",
  variant: "secondary",
})``;

const Image = styled.img`
  width: 100%;
  height: 50vw;
  object-fit: cover;
  max-width: 100%;

  @media (min-width: ${breakpoints.s}) {
    max-height: 250px;
    height: 100%;
  }

  @media (min-width: ${breakpoints.m}) {
    max-height: 182px;
  }

  @media (min-width: ${breakpoints.l}) {
    max-height: 150px;
  }
`;

const Status = styled.div<{ $state: ReservationsReservationStateChoices }>`
  ${({ $state }) => {
    switch ($state) {
      case "REQUIRES_HANDLING":
        return css`
          background-color: var(--color-gold-light);
        `;
      case "CREATED":
        return css`
          background-color: var(--color-bus-light);
        `;
      case "DENIED":
        return css`
          background-color: var(--color-error-light);
        `;
      case "CONFIRMED":
        return css`
          background-color: var(--color-success-light);
        `;
      default:
        return css`
          background-color: var(--color-black-10);
        `;
    }
  }}
  padding: var(--spacing-3-xs) var(--spacing-2-xs);
  font-size: var(--fontsize-body-s);
  text-align: center;
  max-width: fit-content;
  align-self: flex-end;
  ${truncatedText};
`;

const ReservationCard = ({ reservation, type }: Props): JSX.Element => {
  const { t } = useTranslation();

  const reservationUnit = reservation.reservationUnits[0];
  const link = `/reservations/${reservation.pk}`;

  const timeStripContent = useMemo(() => {
    const beginDate = t("common:dateWithWeekday", {
      date: reservation.begin && parseISO(reservation.begin),
    });

    const beginTime = t("common:timeWithPrefix", {
      date: reservation.begin && parseISO(reservation.begin),
    });

    const endDate = t("common:dateWithWeekday", {
      date: reservation.end && parseISO(reservation.end),
    });

    const endTime = t("common:time", {
      date: reservation.end && parseISO(reservation.end),
    });

    return capitalize(
      `${beginDate} ${beginTime}-${
        endDate !== beginDate ? `${endDate}` : ""
      }${endTime}`
    );
  }, [reservation, t]);

  const title = trim(
    `${getReservationUnitName(reservationUnit)}, ${getUnitName(
      reservationUnit.unit
    )}`,
    ", "
  );

  const price =
    reservation.state === "REQUIRES_HANDLING"
      ? getReservationUnitPrice(reservationUnit)
      : getReservationPrice(
          reservation.price,
          i18n.t("prices:priceFree"),
          i18n.language
        );

  const statusText = t(
    `reservations:status.${camelCase(reservation.state.toLocaleLowerCase())}`
  );

  const statusTag = (
    state: ReservationsReservationStateChoices,
    statusType = "desktop"
  ) => (
    <Status
      data-testid={`reservation__card--status-${statusType}`}
      $state={state}
    >
      {statusText}
    </Status>
  );

  return (
    <Container data-testid="reservation__card--container">
      <Image
        alt={t("common:imgAltForSpace", {
          name: getTranslation(reservation, "name"),
        })}
        src={
          getMainImage(reservationUnit)?.mediumUrl ||
          "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
        }
      />
      <MainContent>
        <Details>
          <Name>{title}</Name>
          <Bottom>
            <TimeStrip data-testid="reservation__card--time">
              {timeStripContent}
            </TimeStrip>
            <JustForMobile
              customBreakpoint={breakpoints.l}
              style={{ marginTop: "var(--spacing-s)" }}
            >
              {statusTag(reservation.state, "mobile")}
            </JustForMobile>
            <Price
              icon={<IconTicket aria-label={t("reservationUnit:price")} />}
              text={price}
              data-testid="reservation__card--price"
            />
          </Bottom>
        </Details>
        <Actions>
          <JustForDesktop customBreakpoint={breakpoints.l}>
            {statusTag(reservation.state)}
          </JustForDesktop>
          <ActionButtons>
            {["upcoming"].includes(type) &&
              canUserCancelReservation(reservation) && (
                <ActionButton
                  iconRight={<IconCross aria-hidden />}
                  onClick={() =>
                    router.push(`${reservationsUrl}${reservation.pk}/cancel`)
                  }
                  data-testid="reservation-card__button--cancel-reservation"
                >
                  {t("reservations:cancelReservationAbbreviated")}
                </ActionButton>
              )}
            <ActionButton
              iconRight={<IconArrowRight aria-hidden />}
              onClick={() => router.push(link)}
              data-testid="reservation-card__button--goto-reservation"
            >
              {t("reservationList:seeMore")}
            </ActionButton>
          </ActionButtons>
        </Actions>
      </MainContent>
    </Container>
  );
};

export default ReservationCard;
