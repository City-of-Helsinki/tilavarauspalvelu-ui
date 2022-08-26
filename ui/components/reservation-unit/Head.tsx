import { IconClock, IconGroup, IconTicket } from "hds-react";
import { parseISO } from "date-fns";
import React, { useMemo } from "react";
import { useLocalStorage } from "react-use";
import NextImage from "next/image";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { breakpoint } from "../../modules/style";
import {
  formatSecondDuration,
  getTranslation,
  orderImages,
  searchUrl,
} from "../../modules/util";
import Container from "../common/Container";
import IconWithText from "../common/IconWithText";
import Images from "./Images";
import { ReservationUnitByPkType } from "../../modules/gql-types";
import {
  getPrice,
  getReservationUnitName,
  getUnitName,
} from "../../modules/reservationUnit";
import { fontRegular, H1, H2 } from "../../modules/style/typography";
import BreadcrumbWrapper from "../common/BreadcrumbWrapper";

interface PropsType {
  reservationUnit: ReservationUnitByPkType;
  // activeOpeningTimes: ActiveOpeningTime[];
  isReservable?: boolean;
}

const TopContainer = styled.div`
  background-color: white;
  padding-top: var(--spacing-xl);
`;

const RightContainer = styled.div`
  font-size: var(--fontsize-body-m);
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: ${breakpoint.l}) {
    grid-template-columns: auto 465px;
    gap: var(--spacing-layout-2-xl);
  }
`;

const StyledIconWithText = styled(IconWithText).attrs({
  "data-testid": "icon-with-text",
})`
  display: grid;
  align-items: flex-start;
  white-space: nowrap;
  line-height: var(--lineheight-l);
  margin-top: unset;
`;

const Props = styled.div`
  & > div:empty {
    display: none;
  }

  ${fontRegular};
  font-size: var(--fontsize-body-s);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-m) var(--spacing-s);
  margin-bottom: var(--spacing-layout-m);

  @media (min-width: ${breakpoint.l}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${breakpoint.xl}) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const GrayBox = styled.div`
  background-color: var(--color-black-5);
  font-size: var(--fontsize-body-l);
  line-height: var(--fontsize-body-l);
  padding: var(--spacing-s);
  display: inline-block;
`;

const ReservationUnitName = styled(H1)`
  margin-top: 0;
`;

const UnitName = styled(H2)`
  margin-top: 0;
`;

const Head = ({
  reservationUnit,
  // activeOpeningTimes,
  isReservable,
}: PropsType): JSX.Element => {
  const { t } = useTranslation();

  const storageKey = "reservationUnit-search";

  const [storedValues] = useLocalStorage(storageKey, null);

  const searchUrlWithParams = useMemo(() => {
    return searchUrl(storedValues);
  }, [storedValues]);

  const minReservationDuration = formatSecondDuration(
    reservationUnit.minReservationDuration,
    true
  );

  const maxReservationDuration = formatSecondDuration(
    reservationUnit.maxReservationDuration,
    true
  );

  // const openingTimesTextArr = activeOpeningTimes?.map((openingTime, index) =>
  //   getDayOpeningTimes(openingTime, index)
  // );

  const unitPrice = getPrice(reservationUnit);

  const reservationUnitName = getReservationUnitName(reservationUnit);

  const unitName = getUnitName(reservationUnit.unit);

  return (
    <>
      <BreadcrumbWrapper
        route={["", searchUrlWithParams, "reservationUnit"]}
        aliases={[{ slug: searchUrlWithParams, title: t("breadcrumb:search") }]}
      />
      <TopContainer>
        <Container>
          <RightContainer>
            <div>
              <ReservationUnitName>{reservationUnitName}</ReservationUnitName>
              <UnitName>{unitName}</UnitName>
              <Props>
                {reservationUnit.reservationUnitType ? (
                  <StyledIconWithText
                    icon={
                      <NextImage
                        src="/icons/icon_premises.svg"
                        width="24"
                        height="24"
                        aria-label={t("reservationUnitCard:type")}
                      />
                    }
                    text={getTranslation(
                      reservationUnit.reservationUnitType,
                      "name"
                    )}
                  />
                ) : null}
                {reservationUnit.maxPersons && (
                  <StyledIconWithText
                    icon={
                      <IconGroup aria-label={t("reservationUnit:maxPersons")} />
                    }
                    text={t("reservationUnitCard:maxPersons", {
                      count: reservationUnit.maxPersons,
                    })}
                  />
                )}
                {/* {openingTimesTextArr?.length > 0 && (
                    <StyledIconWithText
                      icon={
                        <IconCalendar
                          aria-label={t("reservationUnit:openingTimes")}
                        />
                      }
                      texts={openingTimesTextArr}
                    />
                  )} */}
                {unitPrice && (
                  <StyledIconWithText
                    icon={
                      <IconTicket
                        aria-label={t("prices:reservationUnitPriceLabel")}
                      />
                    }
                    text={unitPrice}
                  />
                )}
                {(reservationUnit.minReservationDuration ||
                  reservationUnit.maxReservationDuration) && (
                  <StyledIconWithText
                    icon={
                      <IconClock
                        aria-label={t("reservationCalendar:eventDuration")}
                      />
                    }
                    text={`${minReservationDuration} – ${maxReservationDuration}
                    `}
                  />
                )}
              </Props>
              {isReservable && reservationUnit.nextAvailableSlot && (
                <GrayBox>
                  {`${t("reservationCalendar:nextAvailableTime")}:
                      ${t("common:dateTimeNoYear", {
                        date: parseISO(reservationUnit.nextAvailableSlot),
                      })}
                  `}
                </GrayBox>
              )}
            </div>
            <Images
              images={orderImages(reservationUnit.images)}
              contextName={reservationUnitName}
            />
          </RightContainer>
        </Container>
      </TopContainer>
    </>
  );
};

export default Head;
