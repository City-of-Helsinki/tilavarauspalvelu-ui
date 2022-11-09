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
import { BlackButton, truncatedText } from "../../styles/util";
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
  display: block;
  background-color: var(--color-silver-light);
  margin-top: var(--spacing-s);
  min-height: 150px;

  @media (min-width: ${breakpoints.s}) {
    display: grid;
    grid-template-columns: 226px auto;
  }
`;

const MainContent = styled.div`
  display: grid;
  margin: var(--spacing-s);

  @media (min-width: ${breakpoints.s}) and (max-width: ${breakpoints.m}) {
    margin-bottom: 0;
  }
`;

const Top = styled.div`
  display: flex;
  gap: var(--spacing-m);
  justify-content: space-between;
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
  display: block;

  @media (min-width: ${breakpoints.m}) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--spacing-l);
  }
`;

const Props = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TimeStrip = styled.div``;

const Price = styled(IconWithText)`
  span {
    margin-left: var(--spacing-2-xs);
  }
`;

const Actions = styled.div`
  display: block;
  padding: var(--spacing-s) var(--spacing-s) var(--spacing-s) 0;
  white-space: nowrap;

  > button {
    white-space: nowrap;
  }

  @media (min-width: ${breakpoints.m}) {
    display: flex;
    flex-direction: column;
    align-self: flex-end;
    justify-self: flex-end;
    padding: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-s);
`;

const ActionButton = styled(BlackButton).attrs({
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
          name: getTranslation(reservationUnit, "name"),
        })}
        src={
          getMainImage(reservationUnit)?.mediumUrl ||
          "https://via.placeholder.com/384x384" ||
          "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
        }
      />
      <MainContent>
        <Top>
          <Name>{title}</Name>
          <JustForDesktop customBreakpoint={breakpoints.l}>
            {statusTag(reservation.state)}
          </JustForDesktop>
        </Top>
        <Bottom>
          <Props>
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
          </Props>
          <Actions>
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
        </Bottom>
      </MainContent>
    </Container>
  );
};

export default ReservationCard;
