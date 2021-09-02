import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { gql } from "@apollo/client";
import { Koros } from "hds-react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { subMinutes } from "date-fns";
import Container from "../../components/common/Container";
import {
  OpeningHour,
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
import { parseDate } from "../../modules/util";
import {
  areSlotsReservable,
  doReservationsCollide,
  getSlotPropGetter,
  isReservationLongEnough,
  isReservationShortEnough,
} from "../../modules/calendar";
import Toolbar from "../../components/calendar/Toolbar";

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

const eventStyleGetter = ({
  event,
}: CalendarEvent): { style: React.CSSProperties; className?: string } => {
  const style = {
    borderRadius: "0px",
    opacity: "0.8",
    color: "var(--color-white)",
    display: "block",
    borderColor: "transparent",
  } as Record<string, string>;
  let className = "";

  switch (event.state) {
    case "cancelled":
      style.backgroundColor = "var(--color-error-dark)";
      style.textDecoration = "line-through";
      break;
    case "initial":
      style.backgroundColor = "var(--color-success-dark)";
      className = "rbc-event-movable";
      break;
    default:
      style.backgroundColor = "var(--color-brick-dark)";
  }

  return {
    style,
    className,
  };
};

const ReservationUnit = ({
  reservationUnit,
  relatedReservationUnits,
  viewType = "single", // TODO get rid of
}: Props): JSX.Element | null => {
  const { t } = useTranslation();

  const [focusDate, setFocusDate] = useState(new Date());
  const [calendarViewType, setCalendarViewType] = useState<WeekOptions>("week");
  const [initialReservation, setInitialReservation] =
    useState<PendingReservation | null>(null);
  const [reservations] = useState<Reservation[] | null>([
    {
      id: 1,
      state: "created",
      priority: 100,
      begin: "2021-08-31T09:00:00.000Z",
      end: "2021-08-31T20:00:00.000Z",
      reservationUnit,
    },
    {
      id: 2,
      state: "created",
      priority: 100,
      begin: "2021-09-01T09:00:00.000Z",
      end: "2021-09-01T20:00:00.000Z",
      reservationUnit,
    },
  ]);
  const [openingHours] = useState<OpeningHour[] | null>([
    {
      date: "2021-08-30",
      times: { startTime: "09:00:00", endTime: "20:00:00" },
    },
    {
      date: "2021-08-31",
      times: { startTime: "07:00:00", endTime: "20:00:00" },
    },
    {
      date: "2021-09-01",
      times: { startTime: "07:00:00", endTime: "22:00:00" },
    },
    {
      date: "2021-09-02",
      times: { startTime: "07:00:00", endTime: "20:00:00" },
    },
    {
      date: "2021-09-03",
      times: { startTime: "10:00:00", endTime: "20:00:00" },
    },
  ]);

  const slotPropGetter = useMemo(
    () => getSlotPropGetter(openingHours),
    [openingHours]
  );

  const calendarRef = useRef(null);

  const reservationUnitList = useReservationUnitsList();

  const shouldDisplayBottomWrapper = relatedReservationUnits?.length > 0;

  const calendarEvents = [...reservations, initialReservation]
    .filter((n) => n)
    .map((reservation: Reservation) => {
      const event = {
        title: `${
          reservation.state === "cancelled"
            ? `${t("reservationCalendar:prefixForCancelled")}: `
            : ""
        }`,
        start: parseDate(reservation.begin),
        end: parseDate(reservation.end),
        allDay: false,
        event: reservation,
      };

      return event as CalendarEvent;
    });

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
              events={calendarEvents}
              begin={focusDate}
              onNavigate={(d: Date) => {
                setFocusDate(d);
              }}
              customEventStyleGetter={eventStyleGetter}
              slotPropGetter={slotPropGetter}
              viewType={calendarViewType}
              onView={(n: WeekOptions) => {
                setCalendarViewType(n);
              }}
              onSelecting={({ start, end }: CalendarEvent): boolean => {
                if (
                  !areSlotsReservable(
                    [new Date(start), subMinutes(new Date(end), 1)],
                    openingHours
                  ) ||
                  !isReservationShortEnough(
                    start,
                    end,
                    reservationUnit.maxReservationDuration
                  ) ||
                  doReservationsCollide(reservations, { start, end })
                ) {
                  return false;
                }
                setInitialReservation({
                  begin: start.toISOString(),
                  end: end.toISOString(),
                  state: "initial",
                } as PendingReservation);
                return true;
              }}
              showToolbar
              reservable
              toolbarComponent={Toolbar}
              resizable
              draggable
              onEventDrop={({ start, end }: CalendarEvent) => {
                if (
                  areSlotsReservable(
                    [new Date(start), subMinutes(new Date(end), 1)],
                    openingHours
                  ) &&
                  !doReservationsCollide(reservations, { start, end }) &&
                  isReservationShortEnough(
                    start,
                    end,
                    reservationUnit.maxReservationDuration
                  ) &&
                  isReservationLongEnough(
                    start,
                    end,
                    reservationUnit.minReservationDuration
                  )
                ) {
                  setInitialReservation({
                    begin: start.toISOString(),
                    end: end.toISOString(),
                    state: "initial",
                  });
                }
              }}
              onEventResize={({ start, end }: CalendarEvent) => {
                if (
                  areSlotsReservable(
                    [new Date(start), subMinutes(new Date(end), 1)],
                    openingHours
                  ) &&
                  !doReservationsCollide(reservations, { start, end }) &&
                  isReservationShortEnough(
                    start,
                    end,
                    reservationUnit.maxReservationDuration
                  ) &&
                  isReservationLongEnough(
                    start,
                    end,
                    reservationUnit.minReservationDuration
                  )
                ) {
                  setInitialReservation({
                    begin: start.toISOString(),
                    end: end.toISOString(),
                    state: "initial",
                  });
                }
              }}
              draggableAccessor={({ event }: CalendarEvent) =>
                event.state === "initial"
              }
              resizableAccessor={({ event }: CalendarEvent) =>
                event.state === "initial"
              }
            />
            <Legend />
            <LoginFragment
              text={t("reservationCalendar:loginInfo")}
              componentIfAuthenticated={
                <ReservationInfo
                  reservationUnit={reservationUnit}
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
