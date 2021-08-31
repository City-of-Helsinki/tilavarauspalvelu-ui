import React, { useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { gql } from "@apollo/client";
import { Koros } from "hds-react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Container from "../../components/common/Container";
import {
  PendingReservation,
  Reservation,
  ReservationUnit as ReservationUnitType,
} from "../../modules/types";
import Head from "../../components/reservation-unit/Head";
import Address from "../../components/reservation-unit/Address";
import Sanitize from "../../components/common/Sanitize";
import { breakpoint } from "../../modules/style";
import RelatedUnits from "../../components/reservation-unit/RelatedUnits";
import useReservationUnitsList from "../../hooks/useReservationUnitList";
import StartApplicationBar from "../../components/common/StartApplicationBar";
import { AccordionWithState as Accordion } from "../../components/common/Accordion";
import apolloClient from "../../modules/apolloClient";
import Map from "../../components/Map";
import { H2 } from "../../modules/style/typography";
import Calendar, { CalendarEvent } from "../../components/calendar/Calendar";
import Legend from "../../components/calendar/Legend";
import LoginFragment from "../../components/LoginFragment";
import ReservationInfo from "../../components/calendar/ReservationInfo";

type Props = {
  reservationUnit: ReservationUnitType | null;
  relatedReservationUnits: ReservationUnitType[];
  viewType: "recurring" | "single";
};

type WeekOptions = "day" | "week" | "month";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getServerSideProps = async ({ locale, params }) => {
  const id = Number(params.id);

  let relatedReservationUnits = [] as ReservationUnitType[];

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
          id: pk
          name
        }
        location {
          latitude
          longitude
          addressStreet
          addressZip
          addressCity
        }
        minReservationDuration
        maxReservationDuration
        nextAvailableSlot
        spaces {
          id: pk
          name
          termsOfUse
        }
      }
    }
  `;

  if (id) {
    const { data } = await apolloClient.query({
      query: RESERVATION_UNIT,
      variables: { pk: id },
    });

    if (data.reservationUnit?.building?.id) {
      const RELATED_RESERVATION_UNITS = gql`
        query RelatedReservationUnits($unit: ID) {
          relatedReservationUnits: reservationUnits(unit: $unit) {
            edges {
              node {
                id: pk
                name
                images {
                  imageUrl
                  smallUrl
                  imageType
                }
                building: unit {
                  id: pk
                  name
                }
                reservationUnitType {
                  name
                }
                maxPersons
                location {
                  addressStreet
                }
              }
            }
          }
        }
      `;
      const { data: relatedReservationUnitsData } = await apolloClient.query({
        query: RELATED_RESERVATION_UNITS,
        variables: { unit: data.reservationUnit.building.id },
      });

      relatedReservationUnits =
        relatedReservationUnitsData.relatedReservationUnits.edges
          .map((n) => n.node)
          .filter((n: ReservationUnitType) => n.id !== data.reservationUnit.id);
    }

    return {
      props: {
        ...(await serverSideTranslations(locale)),
        reservationUnit: data.reservationUnit,
        relatedReservationUnits,
      },
    };
  }

  return { props: { ...(await serverSideTranslations(locale)), paramsId: id } };
};

const TwoColumnLayout = styled.div`
  display: grid;
  gap: var(--spacing-layout-s);
  grid-template-columns: 7fr 390px;
  margin-top: var(--spacing-m);
  margin-bottom: var(--spacing-xl);

  @media (max-width: ${breakpoint.l}) {
    grid-template-columns: 1fr;
    margin-bottom: var(--spacing-m);
  }
`;

const Content = styled.div`
  font-family: var(--font-regular);
`;

const BottomWrapper = styled.div`
  margin: 0;
  padding: 0;
  background-color: var(--color-silver-medium-light);
`;

const BottomContainer = styled(Container)`
  background-color: var(--color-silver-medium-light);
  margin-top: var(--spacing-layout-l);
  margin-bottom: calc(var(--spacing-s) * -1 + var(--spacing-layout-xl) * -1);
  padding-bottom: var(--spacing-layout-xl);
`;

const StyledKoros = styled(Koros).attrs({
  type: "basic",
})`
  fill: var(--tilavaraus-gray);
`;

const StyledH2 = styled(H2)`
  && {
    margin-bottom: var(--spacing-xl);
  }
`;

const CalendarWrapper = styled.div`
  margin-bottom: var(--spacing-layout-xl);
`;

const MapWrapper = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const ReservationUnit = ({
  reservationUnit,
  relatedReservationUnits,
  viewType,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();

  const [date, setDate] = useState(new Date());
  const [calendarViewType, setCalendarViewType] = useState<WeekOptions>("week");
  const [initialReservation, setInitialReservation] =
    useState<PendingReservation | null>(null);
  const [reservations] = useState<Reservation[] | null>([]);

  const calendarRef = useRef(null);

  const reservationUnitList = useReservationUnitsList();

  const shouldDisplayBottomWrapper = relatedReservationUnits?.length > 0;

  const allReservations = [...reservations, initialReservation].filter(
    (n) => n
  );

  return reservationUnit ? (
    <>
      <Head
        reservationUnit={reservationUnit}
        reservationUnitList={reservationUnitList}
        viewType={viewType}
        calendarRef={calendarRef}
      />
      <Container>
        <TwoColumnLayout>
          <div>
            <Accordion open heading={t("reservationUnit:description")}>
              <Content>
                <Sanitize html={reservationUnit.description} />
              </Content>
            </Accordion>
          </div>
          <div>
            <Address reservationUnit={reservationUnit} />
          </div>
        </TwoColumnLayout>
        {viewType === "single" && (
          <CalendarWrapper ref={calendarRef}>
            <StyledH2>{t("reservations:reservationCalendar")}</StyledH2>
            <Calendar
              begin={date}
              reservations={allReservations}
              reservationUnit={reservationUnit}
              onNavigate={(d: Date) => {
                setDate(d);
              }}
              viewType={calendarViewType}
              onView={(n: WeekOptions) => {
                setCalendarViewType(n);
              }}
              onSelecting={({ start, end }: CalendarEvent) => {
                setInitialReservation({
                  name: t("reservationCalendar:initialReservation"),
                  begin: start.toISOString(),
                  end: end.toISOString(),
                } as PendingReservation);
              }}
              showToolbar
              reservable
            />
            <Legend />
            <LoginFragment
              text={t("reservationCalendar:loginInfo")}
              componentIfAuthenticated={
                <ReservationInfo
                  reservationUnitId={reservationUnit.id}
                  begin={initialReservation?.begin}
                  end={initialReservation?.end}
                />
              }
            />
          </CalendarWrapper>
        )}
        <MapWrapper>
          <StyledH2>{t("common:location")}</StyledH2>
          <Map
            title={reservationUnit.building?.name}
            latitude={Number(reservationUnit.location?.latitude)}
            longitude={Number(reservationUnit.location?.longitude)}
          />
        </MapWrapper>
        <TwoColumnLayout>
          <Address reservationUnit={reservationUnit} />
          <div />
          <Accordion heading={t("reservationUnit:termsOfUse")}>
            <Content>
              <Sanitize html={reservationUnit.termsOfUse} />
            </Content>
          </Accordion>
          <div />
          <Accordion heading={t("reservationUnit:termsOfUseSpaces")}>
            <Content>
              {reservationUnit.spaces.map((space) => (
                <React.Fragment key={space.id}>
                  {reservationUnit.spaces.length > 1 && <h3>{space.name}</h3>}
                  <p>
                    <Sanitize html={space.termsOfUse} />
                  </p>
                </React.Fragment>
              ))}
            </Content>
          </Accordion>
          <div />
        </TwoColumnLayout>
      </Container>
      <BottomWrapper>
        {shouldDisplayBottomWrapper && (
          <>
            <StyledKoros flipHorizontal />
            <BottomContainer>
              <RelatedUnits
                reservationUnitList={reservationUnitList}
                units={relatedReservationUnits}
                viewType={viewType}
              />
            </BottomContainer>
          </>
        )}
      </BottomWrapper>
      {viewType === "recurring" && (
        <StartApplicationBar
          count={reservationUnitList.reservationUnits.length}
        />
      )}
    </>
  ) : null;
};

export default ReservationUnit;
