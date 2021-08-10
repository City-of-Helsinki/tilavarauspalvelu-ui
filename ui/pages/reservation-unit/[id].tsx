import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { gql } from "@apollo/client";
import router from "next/router";
import { Koros } from "hds-react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
// eslint-disable-next-line import/no-unresolved
import Container from "../../components/common/Container";
import {
  PendingReservation,
  Reservation,
  ReservationUnit as ReservationUnitType,
} from "../../modules/types";
import { getReservationUnits } from "../../modules/api";
import Head from "../../components/reservation-unit/Head";
import Address from "../../components/reservation-unit/Address";
import Images from "../../components/reservation-unit/Images";
import Sanitize from "../../components/common/Sanitize";
import { breakpoint } from "../../modules/style";
import RelatedUnits from "../../components/reservation-unit/RelatedUnits";
import useReservationUnitsList from "../../hooks/useReservationUnitList";
import StartApplicationBar from "../../components/common/StartApplicationBar";
import { AccordionWithState as Accordion } from "../../components/common/Accordion";
import apolloClient from "../../modules/apolloClient";
import Map from "../../components/reservation-unit/Map";
import { H2 } from "../../modules/style/typography";
import Calendar, { CalendarEvent } from "../../components/calendar/Calendar";
import Legend from "../../components/calendar/Legend";
import LoginFragment from "../../components/LoginFragment";
import Modal from "../../components/common/Modal";
import ReservationDialog from "./ReservationDialog";

type Props = {
  reservationUnit: ReservationUnitType | null;
  relatedReservationUnits: ReservationUnitType[];
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

    if (data.reservationUnit?.building?.id) {
      relatedReservationUnits = (
        await getReservationUnits({ unit: data.reservationUnit.building.id })
      ).filter((u) => u.id !== Number(id));
    }

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
}: Props): JSX.Element | null => {
  const { t } = useTranslation();

  const [date, setDate] = useState(new Date());
  const [viewType, setViewType] = useState<WeekOptions>("week");
  const [initialReservation, setInitialReservation] =
    useState<PendingReservation | null>(null);
  const [reservations] = useState<Reservation[] | null>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showReservationDialog, setShowReservationDialog] =
    useState<boolean>(false);

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
      />
      <Container>
        <TwoColumnLayout>
          <div>
            <Accordion open heading={t("reservationUnit:description")}>
              <Content>
                <Sanitize html={reservationUnit.description} />
              </Content>
            </Accordion>
            <Accordion heading={t("reservationUnit:termsOfUse")}>
              <Content>
                <Sanitize html={reservationUnit.termsOfUse} />
              </Content>
            </Accordion>
          </div>
          <div>
            <Address reservationUnit={reservationUnit} />
            <Images images={reservationUnit.images} />
          </div>
        </TwoColumnLayout>
        <CalendarWrapper>
          <StyledH2>{t("reservations:reservationCalendar")}</StyledH2>
          <Calendar
            begin={date}
            reservations={allReservations}
            reservationUnit={reservationUnit}
            onNavigate={(d: Date) => {
              setDate(d);
            }}
            viewType={viewType}
            onView={(n: WeekOptions) => {
              setViewType(n);
            }}
            onSelecting={({ start, end }: CalendarEvent) => {
              setInitialReservation({
                name: t("reservationCalendar:initialReservation"),
                begin: start.toISOString(),
                end: end.toISOString(),
              } as PendingReservation);
            }}
            onSelectEvent={() => {
              setShowReservationDialog(true);
            }}
            showToolbar
            reservable={isAuthenticated}
          />
          <Legend />
          <LoginFragment
            text={t("reservationCalendar:loginInfo")}
            setIsAuthenticated={(isAuthd: boolean) =>
              setIsAuthenticated(isAuthd)
            }
          />
        </CalendarWrapper>
        <MapWrapper>
          <StyledH2>{t("common:location")}</StyledH2>
          <Map
            title={reservationUnit.building?.name}
            latitude={reservationUnit.location?.coordinates?.latitude}
            longitude={reservationUnit.location?.coordinates?.longitude}
          />
        </MapWrapper>
      </Container>
      <BottomWrapper>
        {shouldDisplayBottomWrapper && (
          <>
            <StyledKoros flipHorizontal />
            <BottomContainer>
              <RelatedUnits
                reservationUnitList={reservationUnitList}
                units={relatedReservationUnits}
              />
            </BottomContainer>
          </>
        )}
      </BottomWrapper>
      <StartApplicationBar
        count={reservationUnitList.reservationUnits.length}
      />
      {showReservationDialog && (
        <Modal
          handleClose={() => setShowReservationDialog(false)}
          show={showReservationDialog}
          closeButtonKey="common:close"
          handleOk={() => {
            router.push(`/reservation-unit/${reservationUnit.id}/reservation`);
          }}
          okButtonKey={t("reservationCalendar:makeReservation")}
        >
          <ReservationDialog reservationUnit={reservationUnit} />
        </Modal>
      )}
    </>
  ) : null;
};

export default ReservationUnit;
