import {
  IconArrowDown,
  IconArrowUp,
  IconGroup,
  IconCross,
  Notification,
  IconSize,
  ButtonSize,
  ButtonVariant,
  Button,
} from "hds-react";
import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { fontBold, H6 } from "common/src/common/typography";
import { breakpoints } from "common/src/common/style";
import type { ReservationUnitCardFieldsFragment } from "@gql/gql-types";
import { getMainImage, getTranslation } from "@/modules/util";
import { getReservationUnitName } from "@/modules/reservationUnit";
import { getImageSource } from "common/src/helpers";

type ReservationUnitType = ReservationUnitCardFieldsFragment;
type Props = {
  order: number;
  reservationUnit: ReservationUnitType;
  onDelete: (reservationUnit: ReservationUnitType) => void;
  first: boolean;
  last: boolean;
  onMoveUp: (reservationUnit: ReservationUnitType) => void;
  onMoveDown: (reservationUnit: ReservationUnitType) => void;
  invalid: boolean;
};

const NameCardContainer = styled.div``;

const PreCardLabel = styled(H6).attrs({ as: "h3" })`
  margin-bottom: 0;
  margin-top: 0;
`;

const CardButtonContainer = styled.div`
  display: grid;
  grid-template-columns: 8fr 1fr;
  margin-top: var(--spacing-2-xs);
  align-items: center;
  position: relative;

  @media (max-width: ${breakpoints.m}) {
    grid-template-columns: 1fr;
  }
`;

const CardContainer = styled.div`
  background-color: var(--tilavaraus-gray);
  display: grid;
  align-items: flex-start;
  grid-template-columns: 1fr;

  @media (min-width: ${breakpoints.m}) {
    grid-template-columns: 163px 6fr 2fr;
    gap: var(--spacing-xs);
  }
`;

const PaddedCell = styled.div`
  padding: var(--spacing-m) 0;

  @media (min-width: ${breakpoints.s}) {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
`;

const ExtraPaddedCell = styled(PaddedCell)`
  padding: var(--spacing-s);

  @media (min-width: ${breakpoints.s}) {
    gap: 0;
  }
`;

const ImageCell = styled.div<{ $src?: string }>`
  background-image: url(${(props) => props.$src});
  width: 100%;
  height: 150px;
  background-size: cover;

  @media (min-width: ${breakpoints.m}) {
    height: 100%;
  }
`;

const Name = styled.div`
  ${fontBold};
  font-size: var(--fontsize-heading-s);
  line-height: var(--lineheight-xl);
  margin-bottom: var(--spacing-3-xs);
`;

const MaxPersonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--fontsize-body-s);
  margin-top: var(--spacing-xs);
  padding-bottom: var(--spacing-2-xs);
`;

const DeleteButton = styled(Button)`
  margin: var(--spacing-s) var(--spacing-s) var(--spacing-s) 0;
  place-self: flex-start;
  @media (min-width: ${breakpoints.m}) {
    place-self: flex-end;
  }
`;

const ArrowContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: absolute;
  right: var(--spacing-m);
  bottom: var(--spacing-m);

  @media (min-width: ${breakpoints.m}) {
    position: static;
    flex-direction: column;
    gap: var(--spacing-s);
    justify-self: flex-end;
  }
`;

const Circle = styled.div<{ passive: boolean }>`
  margin-left: var(--spacing-xs);
  height: var(--spacing-layout-m);
  width: var(--spacing-layout-m);
  background-color: ${(props) =>
    props.passive ? "var(--color-black-10)" : "var(--color-white)"};
  color: ${(props) =>
    props.passive ? "var(--color-black-50)" : "var(--color-bus)"};
  border-width: 2px;
  border-style: solid;
  border-color: ${(props) =>
    props.passive ? "var(--color-black-10)" : "var(--color-bus)"};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  button {
    &:disabled {
      color: var(--color-black-40);
      cursor: default;
    }

    border: 0;
    background-color: transparent;
    color: var(--color-bus);
    cursor: pointer;
  }
`;

// NOTE size=small causes text to disappear
const ErrorNotification = styled(Notification).attrs({
  type: "error",
})`
  --fontsize-heading-xs: var(--fontsize-body-s);
`;

/// Custom card for selecting reservation units for application
export function ReservationUnitCard({
  reservationUnit,
  order,
  onDelete,
  first,
  last,
  onMoveUp,
  onMoveDown,
  invalid,
}: Props): JSX.Element {
  const { t } = useTranslation();

  const { unit } = reservationUnit;
  const unitName = unit ? getTranslation(unit, "name") : "-";

  const img = getMainImage(reservationUnit);
  const imgSrc = getImageSource(img, "medium");

  return (
    <NameCardContainer>
      <PreCardLabel>
        {t("reservationUnitList:option")} {order + 1}.
      </PreCardLabel>
      {invalid ? (
        <ErrorNotification
          label={t("application:validation.reservationUnitTooSmall")}
        />
      ) : null}
      <CardButtonContainer>
        <CardContainer>
          <ImageCell $src={imgSrc} />
          <ExtraPaddedCell>
            <Name>{getReservationUnitName(reservationUnit)}</Name>
            <div>{unitName}</div>
            <MaxPersonsContainer>
              {reservationUnit.maxPersons && (
                <>
                  <IconGroup aria-hidden="true" size={IconSize.Small} />
                  {t("reservationUnitCard:maxPersons", {
                    count: reservationUnit.maxPersons,
                  })}
                </>
              )}
            </MaxPersonsContainer>
          </ExtraPaddedCell>
          <DeleteButton
            variant={ButtonVariant.Supplementary}
            iconStart={<IconCross aria-hidden="true" />}
            size={ButtonSize.Small}
            onClick={() => {
              onDelete(reservationUnit);
            }}
          >
            {t("reservationUnitList:buttonRemove")}
          </DeleteButton>
        </CardContainer>
        <ArrowContainer>
          <Circle passive={first}>
            <button
              className="button-reset"
              disabled={first}
              type="button"
              aria-label={t("reservationUnitList:buttonUp")}
              onClick={() => onMoveUp(reservationUnit)}
            >
              <IconArrowUp aria-hidden="true" size={IconSize.Small} />
            </button>
          </Circle>
          <Circle passive={last}>
            <button
              className="button-reset"
              aria-label={t("reservationUnitList:buttonDown")}
              type="button"
              disabled={last}
              onClick={() => onMoveDown(reservationUnit)}
            >
              <IconArrowDown aria-hidden="true" size={IconSize.Small} />
            </button>
          </Circle>
        </ArrowContainer>
      </CardButtonContainer>
    </NameCardContainer>
  );
}
