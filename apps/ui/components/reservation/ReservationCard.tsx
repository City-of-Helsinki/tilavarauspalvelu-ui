import React from "react";
import { IconArrowRight, IconCross, IconGlyphEuro } from "hds-react";
import { useTranslation } from "next-i18next";
import { differenceInMinutes } from "date-fns";
import styled from "styled-components";
import { getReservationPrice } from "common";
import { trim } from "lodash";
import { breakpoints } from "common/src/common/style";
import {
  type ListReservationsQuery,
  ReservationStateChoice,
  OrderStatus,
} from "@gql/gql-types";
import {
  capitalize,
  formatDateTimeRange,
  getMainImage,
  getTranslation,
  reservationsUrl,
} from "@/modules/util";
import {
  canUserCancelReservation,
  getNormalizedReservationOrderStatus,
} from "@/modules/reservation";
import {
  getReservationUnitName,
  getReservationUnitPrice,
  getUnitName,
} from "@/modules/reservationUnit";
import { JustForDesktop, JustForMobile } from "@/modules/style/layout";
import IconWithText from "@/components/common/IconWithText";
import { ReservationOrderStatus } from "./ReservationOrderStatus";
import { ReservationStatus } from "./ReservationStatus";
import { ButtonLikeLink } from "../common/ButtonLikeLink";
import { getImageSource } from "common/src/helpers";

type CardType = "upcoming" | "past" | "cancelled";

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

const StatusContainer = styled.div`
  display: flex;
  gap: var(--spacing-m);
  align-self: flex-end;
  align-items: flex-start;
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
    place-self: flex-end;
    padding: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-s);
`;

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

function StatusTags({
  state,
  orderStatus,
  statusType = "desktop",
}: {
  state: ReservationStateChoice;
  orderStatus: OrderStatus | null;
  statusType: "desktop" | "mobile";
}) {
  return (
    <StatusContainer>
      {orderStatus != null && (
        <ReservationOrderStatus
          orderStatus={orderStatus}
          data-testid={`reservation-card__order-status-${statusType}`}
        />
      )}
      <ReservationStatus
        data-testid={`reservation-card__status-${statusType}`}
        state={state}
      />
    </StatusContainer>
  );
}

// TODO use a fragment
type QueryT = NonNullable<ListReservationsQuery["reservations"]>;
type EdgeT = NonNullable<QueryT["edges"][0]>;
type NodeT = NonNullable<EdgeT["node"]>;
interface PropsT {
  reservation: NodeT;
  type?: CardType;
}

function ReservationCard({ reservation, type }: PropsT): JSX.Element {
  const { t, i18n } = useTranslation();

  const reservationUnit = reservation.reservationUnit?.[0] ?? undefined;
  const link = reservation.pk ? `/reservations/${reservation.pk}` : "";

  const { begin, end } = reservation;
  const timeString = capitalize(
    formatDateTimeRange(t, new Date(begin), new Date(end))
  );

  const title = trim(
    `${getReservationUnitName(reservationUnit)}, ${getUnitName(
      reservationUnit?.unit ?? undefined
    )}`,
    ", "
  );

  const price =
    reservation.state === ReservationStateChoice.RequiresHandling
      ? getReservationUnitPrice({
          reservationUnit,
          pricingDate: new Date(reservation.begin),
          minutes: differenceInMinutes(
            new Date(reservation.end),
            new Date(reservation.begin)
          ),
          trailingZeros: true,
        })
      : getReservationPrice(
          reservation.price ?? undefined,
          t("prices:priceFree"),
          i18n.language
        );

  const normalizedOrderStatus =
    getNormalizedReservationOrderStatus(reservation);

  const name = reservationUnit ? getTranslation(reservationUnit, "name") : "-";
  const img = getMainImage(reservationUnit);
  const imgSrc = getImageSource(img, "medium");

  return (
    <Container data-testid="reservation-card__container">
      <Image alt={name} src={imgSrc} />
      <MainContent>
        <Top>
          <Name data-testid="reservation-card__name">{title}</Name>
          <JustForDesktop customBreakpoint={breakpoints.l}>
            {StatusTags({
              state: reservation.state ?? ReservationStateChoice.Confirmed,
              orderStatus: normalizedOrderStatus,
              statusType: "desktop",
            })}
          </JustForDesktop>
        </Top>
        <Bottom>
          <Props>
            <TimeStrip data-testid="reservation-card__time">
              {timeString}
            </TimeStrip>
            <JustForMobile
              customBreakpoint={breakpoints.l}
              style={{ marginTop: "var(--spacing-s)" }}
            >
              {StatusTags({
                state: reservation.state ?? ReservationStateChoice.Confirmed,
                orderStatus: normalizedOrderStatus,
                statusType: "mobile",
              })}
            </JustForMobile>
            <Price
              icon={<IconGlyphEuro aria-label={t("reservationUnit:price")} />}
              text={price}
              data-testid="reservation-card__price"
            />
          </Props>
          <Actions>
            <ActionButtons>
              {type === "upcoming" && canUserCancelReservation(reservation) && (
                <ButtonLikeLink
                  href={`${reservationsUrl}${reservation.pk}/cancel`}
                  data-testid="reservation-card__button--cancel-reservation"
                >
                  {t("reservations:cancelReservationAbbreviated")}
                  <IconCross aria-hidden />
                </ButtonLikeLink>
              )}
              <ButtonLikeLink
                href={link}
                data-testid="reservation-card__button--goto-reservation"
              >
                {t("reservationList:seeMore")}
                <IconArrowRight aria-hidden />
              </ButtonLikeLink>
            </ActionButtons>
          </Actions>
        </Bottom>
      </MainContent>
    </Container>
  );
}

export default ReservationCard;
