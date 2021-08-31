import {
  Button,
  IconCalendarClock,
  IconCheck,
  IconClock,
  IconGroup,
  IconInfoCircle,
  IconPlus,
  Koros,
} from "hds-react";
import { parseISO } from "date-fns";
import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import useReservationUnitList from "../../hooks/useReservationUnitList";
import { breakpoint } from "../../modules/style";
import { ReservationUnit as ReservationUnitType } from "../../modules/types";
import { formatDuration, localizedValue } from "../../modules/util";
import Back from "../common/Back";
import Container from "../common/Container";
import IconWithText from "../common/IconWithText";
import Notification from "./Notification";
import Images from "./Images";
import { JustForDesktop, JustForMobile } from "../../modules/style/layout";

interface PropsType {
  reservationUnit: ReservationUnitType;
  reservationUnitList: ReturnType<typeof useReservationUnitList>;
  viewType: "recurring" | "single";
  calendarRef: React.MutableRefObject<HTMLDivElement>;
}

const TopContainer = styled.div`
  background-color: white;
  padding-top: var(--spacing-m);
`;

const RightContainer = styled.div`
  font-size: var(--fontsize-body-m);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-s);

  @media (max-width: ${breakpoint.m}) {
    grid-template-columns: 1fr;
  }
`;

const StyledIconWithText = styled(IconWithText)`
  margin-top: var(--spacing-m);
  display: flex;
  align-items: flex-start;
  white-space: pre-line;
  line-height: var(--lineheight-l);
`;

const Props = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-s);
`;

const ReservationUnitName = styled.h1`
  font-size: var(--fontsize-heading-l);
  margin: var(--spacing-2-xs) 0 var(--spacing-xs);
`;

const BuildingName = styled.div`
  font-size: var(--fontsize-heading-m);
  font-family: var(--font-bold);
`;

const ButtonContainer = styled.div`
  margin-top: var(--spacing-layout-m);

  & > button {
    margin: 0;
  }
`;

const ThinButton = styled(Button).attrs({
  variant: "secondary",
  style: { "--min-size": "35px" },
})`
  height: 35px;
`;

const StyledKoros = styled(Koros)`
  margin-top: var(--spacing-l);
  fill: var(--tilavaraus-gray);
`;

const Head = ({
  reservationUnit,
  reservationUnitList,
  viewType,
  calendarRef,
}: PropsType): JSX.Element => {
  const {
    selectReservationUnit,
    containsReservationUnit,
    removeReservationUnit,
  } = reservationUnitList;

  const { t, i18n } = useTranslation();

  const minReservationDuration = formatDuration(
    reservationUnit.minReservationDuration,
    false
  );

  const maxReservationDuration = formatDuration(
    reservationUnit.maxReservationDuration,
    false
  );

  return (
    <TopContainer>
      <Notification applicationRound={null} />
      <Container>
        <Back link="/search?restore" label="reservationUnit:backToSearch" />
        <RightContainer>
          <div>
            <ReservationUnitName>
              {localizedValue(reservationUnit.name, i18n.language)}
            </ReservationUnitName>
            <BuildingName>
              {localizedValue(reservationUnit.building?.name, i18n.language)}
            </BuildingName>
            <JustForMobile style={{ marginTop: "var(--spacing-l)" }}>
              <Images images={reservationUnit.images} />
            </JustForMobile>
            <Props>
              <div>
                {viewType === "single" &&
                  reservationUnit.nextAvailableSlot &&
                  reservationUnit.maxReservationDuration && (
                    <StyledIconWithText
                      icon={
                        <IconCalendarClock
                          aria-label={t("reservationUnit:type")}
                        />
                      }
                      text={`${t("reservationCalendar:nextAvailableSlot", {
                        count:
                          reservationUnit.maxReservationDuration.startsWith(
                            "01:00:"
                          )
                            ? 1
                            : 2,
                        slot: maxReservationDuration,
                      })}:
                      ${t("common:dateTimeNoYear", {
                        date: parseISO(reservationUnit.nextAvailableSlot),
                      })}
                      `}
                    />
                  )}
              </div>
              <div>
                {viewType === "single" &&
                  (reservationUnit.minReservationDuration ||
                    reservationUnit.maxReservationDuration) && (
                    <StyledIconWithText
                      icon={<IconClock />}
                      text={`Min ${minReservationDuration}
                      Max ${maxReservationDuration}
                    `}
                    />
                  )}
                {reservationUnit.reservationUnitType ? (
                  <StyledIconWithText
                    icon={
                      <IconInfoCircle aria-label={t("reservationUnit:type")} />
                    }
                    text={localizedValue(
                      reservationUnit.reservationUnitType?.name,
                      i18n.language
                    )}
                  />
                ) : null}
                <StyledIconWithText
                  icon={
                    <IconGroup aria-label={t("reservationUnit:maxPersons")} />
                  }
                  text={t("reservationUnitCard:maxPersons", {
                    maxPersons: reservationUnit.maxPersons,
                  })}
                />
              </div>
            </Props>
            <ButtonContainer>
              {viewType === "recurring" &&
                (containsReservationUnit(reservationUnit) ? (
                  <Button
                    onClick={() => removeReservationUnit(reservationUnit)}
                    iconLeft={<IconCheck />}
                    className="margin-left-s margin-top-s"
                  >
                    {t("common:reservationUnitSelected")}
                  </Button>
                ) : (
                  <Button
                    onClick={() => selectReservationUnit(reservationUnit)}
                    iconLeft={<IconPlus />}
                    className="margin-left-s margin-top-s"
                    variant="secondary"
                  >
                    {t("common:selectReservationUnit")}
                  </Button>
                ))}
              {viewType === "single" && (
                <ThinButton
                  onClick={() => {
                    window.scroll({
                      top: calendarRef.current.offsetTop - 20,
                      left: 0,
                      behavior: "smooth",
                    });
                  }}
                >
                  {t("reservationCalendar:showCalendar")}
                </ThinButton>
              )}
            </ButtonContainer>
          </div>
          <JustForDesktop>
            <Images images={reservationUnit.images} />
          </JustForDesktop>
        </RightContainer>
      </Container>
      <StyledKoros className="koros" type="wave" />
    </TopContainer>
  );
};

export default Head;
