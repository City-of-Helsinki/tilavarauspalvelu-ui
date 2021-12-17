import React, { useContext, useMemo, useRef, useState } from "react";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { Koros } from "hds-react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { isValid, subMinutes } from "date-fns";
import Container from "../../../components/common/Container";
import { ApplicationRound, PendingReservation } from "../../../modules/types";
import Head from "../../../components/reservation-unit/Head";
import Address from "../../../components/reservation-unit/Address";
import Sanitize from "../../../components/common/Sanitize";
import { breakpoint } from "../../../modules/style";
import RelatedUnits from "../../../components/reservation-unit/RelatedUnits";
import useReservationUnitsList from "../../../hooks/useReservationUnitList";
import { AccordionWithState as Accordion } from "../../../components/common/Accordion";
import apolloClient from "../../../modules/apolloClient";
import Map from "../../../components/Map";
import { H2 } from "../../../modules/style/typography";
import Calendar, { CalendarEvent } from "../../../components/calendar/Calendar";
import Legend from "../../../components/calendar/Legend";
import LoginFragment from "../../../components/LoginFragment";
import ReservationInfo from "../../../components/calendar/ReservationInfo";
import { getTranslation, parseDate, toApiDate } from "../../../modules/util";
import {
  areSlotsReservable,
  doBuffersCollide,
  doReservationsCollide,
  getEventBuffers,
  getSlotPropGetter,
  getTimeslots,
  isReservationLongEnough,
  isReservationShortEnough,
  isSlotWithinTimeframe,
  isStartTimeWithinInterval,
} from "../../../modules/calendar";
import Toolbar, { ToolbarProps } from "../../../components/calendar/Toolbar";
import { getActiveOpeningTimes } from "../../../modules/openingHours";
import {
  Query,
  QueryReservationUnitByPkArgs,
  QueryReservationUnitsArgs,
  ReservationType,
  ReservationUnitByPkType,
  ReservationUnitByPkTypeOpeningHoursArgs,
  ReservationUnitByPkTypeReservationsArgs,
  ReservationUnitType,
  ReservationUnitTypeEdge,
} from "../../../modules/gql-types";
import {
  OPENING_HOURS,
  RELATED_RESERVATION_UNITS,
  RESERVATION_UNIT,
} from "../../../modules/queries/reservationUnit";
import { getApplicationRounds } from "../../../modules/api";
import { DataContext } from "../../../context/DataContext";

type Props = {
  reservationUnit: ReservationUnitByPkType | null;
  relatedReservationUnits: ReservationUnitType[];
  activeApplicationRounds: ApplicationRound[];
};

type WeekOptions = "day" | "week" | "month";

type ReservationStateWithInitial = string;

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
  query,
}) => {
  const id = Number(params.id);
  const uuid = query.ru;
  const today: string = toApiDate(new Date());

  let relatedReservationUnits = [] as ReservationUnitType[];

  const applicationRounds = await getApplicationRounds();
  const activeApplicationRounds = applicationRounds.filter((applicationRound) =>
    applicationRound.reservationUnitIds.includes(id)
  );

  if (id) {
    const { data: reservationUnitData } = await apolloClient.query<
      Query,
      QueryReservationUnitByPkArgs
    >({
      query: RESERVATION_UNIT,
      variables: {
        pk: id,
      },
    });

    const isDraft = reservationUnitData.reservationUnitByPk?.isDraft;

    if (isDraft && uuid !== reservationUnitData.reservationUnitByPk.uuid) {
      return {
        notFound: true,
      };
    }

    const lastOpeningPeriodEndDate: string =
      reservationUnitData?.reservationUnitByPk?.openingHours?.openingTimePeriods
        .map((period) => period.endDate)
        .sort()
        .reverse()[0] || toApiDate(new Date());

    const { data: additionalData } = await apolloClient.query<
      Query,
      QueryReservationUnitByPkArgs &
        ReservationUnitByPkTypeOpeningHoursArgs &
        ReservationUnitByPkTypeReservationsArgs
    >({
      query: OPENING_HOURS,
      variables: {
        pk: id,
        startDate: today,
        endDate: lastOpeningPeriodEndDate,
        from: today,
        to: lastOpeningPeriodEndDate,
        state: ["CREATED", "CONFIRMED"],
      },
    });

    if (reservationUnitData.reservationUnitByPk?.unit?.pk) {
      const { data: relatedReservationUnitsData } = await apolloClient.query<
        Query,
        QueryReservationUnitsArgs
      >({
        query: RELATED_RESERVATION_UNITS,
        variables: {
          unit: [String(reservationUnitData.reservationUnitByPk.unit.pk)],
        },
      });

      relatedReservationUnits =
        relatedReservationUnitsData?.reservationUnits?.edges
          .map((n: ReservationUnitTypeEdge) => n.node)
          .filter(
            (n: ReservationUnitType) =>
              n.pk !== reservationUnitData.reservationUnitByPk.pk
          );
    }

    if (!reservationUnitData.reservationUnitByPk?.pk) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        ...(await serverSideTranslations(locale)),
        reservationUnit: {
          ...reservationUnitData?.reservationUnitByPk,
          openingHours: {
            ...reservationUnitData?.reservationUnitByPk?.openingHours,
            openingTimes:
              additionalData?.reservationUnitByPk?.openingHours?.openingTimes ||
              null,
          },
          reservations:
            additionalData?.reservationUnitByPk?.reservations?.filter((n) => n),
        },
        relatedReservationUnits,
        activeApplicationRounds,
      },
    };
  }

  return { props: { ...(await serverSideTranslations(locale)), paramsId: id } };
};

const Wrapper = styled.div`
  padding-bottom: var(--spacing-layout-xl);
`;

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
  white-space: pre-wrap;
`;

const CalendarFooter = styled.div`
  display: flex;
  flex-direction: column-reverse;

  button {
    order: 2;
  }

  @media (min-width: ${breakpoint.l}) {
    flex-direction: row;
    gap: var(--spacing-2-xl);
    justify-content: space-between;
  }
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

  const state = event?.state as ReservationStateWithInitial;

  switch (state) {
    case "INITIAL":
      style.backgroundColor = "var(--color-success-dark)";
      className = "rbc-event-movable";
      break;
    case "BUFFER":
      style.backgroundColor = "var(--color-black-10)";
      className = "rbc-event-buffer";
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
  activeApplicationRounds,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();

  const { reservation } = useContext(DataContext);

  const [focusDate, setFocusDate] = useState(new Date());
  const [calendarViewType, setCalendarViewType] = useState<WeekOptions>("week");
  const [initialReservation, setInitialReservation] =
    useState<PendingReservation | null>(null);

  const activeOpeningTimes = getActiveOpeningTimes(
    reservationUnit.openingHours.openingTimePeriods
  );

  const slotPropGetter = useMemo(
    () =>
      getSlotPropGetter(
        reservationUnit.openingHours.openingTimes,
        activeApplicationRounds
      ),
    [reservationUnit.openingHours.openingTimes, activeApplicationRounds]
  );

  const isSlotReservable = (
    start: Date,
    end: Date,
    skipLengthCheck = false
  ): boolean => {
    if (
      !isValid(start) ||
      !isValid(end) ||
      doBuffersCollide(reservationUnit.reservations, {
        start,
        end,
        bufferTimeBefore: reservationUnit.bufferTimeBefore,
        bufferTimeAfter: reservationUnit.bufferTimeAfter,
      }) ||
      !isStartTimeWithinInterval(
        start,
        reservationUnit.openingHours?.openingTimes,
        reservationUnit.reservationStartInterval
      ) ||
      !areSlotsReservable(
        [new Date(start), subMinutes(new Date(end), 1)],
        reservationUnit.openingHours.openingTimes,
        activeApplicationRounds
      ) ||
      (!skipLengthCheck &&
        !isReservationLongEnough(
          start,
          end,
          reservationUnit.minReservationDuration
        )) ||
      !isReservationShortEnough(
        start,
        end,
        reservationUnit.maxReservationDuration
      ) ||
      doReservationsCollide(reservationUnit.reservations, { start, end }) ||
      !isSlotWithinTimeframe(start)
    ) {
      return false;
    }

    return true;
  };

  const handleEventChange = (
    { start, end }: CalendarEvent,
    skipLengthCheck = false
  ): boolean => {
    if (!isSlotReservable(start, end, skipLengthCheck)) {
      return false;
    }

    setInitialReservation({
      begin: start.toISOString(),
      end: end.toISOString(),
      state: "INITIAL",
    } as PendingReservation);
    return true;
  };

  const handleSlotClick = (
    { start, action },
    skipLengthCheck = false
  ): boolean => {
    if (action !== "click") {
      return false;
    }
    const [hours, minutes] = reservationUnit.minReservationDuration.split(":");

    const end = new Date(start);
    end.setHours(
      start.getHours() + parseInt(hours, 10),
      start.getMinutes() + parseInt(minutes, 10)
    );

    if (!isSlotReservable(start, end, skipLengthCheck)) {
      return false;
    }

    setInitialReservation({
      begin: start.toISOString(),
      end: end.toISOString(),
      state: "INITIAL",
    } as PendingReservation);
    return true;
  };

  useMemo(() => {
    handleEventChange({
      start: reservation?.begin && new Date(reservation?.begin),
      end: reservation?.end && new Date(reservation?.end),
    } as CalendarEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation]);

  const calendarRef = useRef(null);

  const reservationUnitList = useReservationUnitsList();

  const shouldDisplayBottomWrapper = relatedReservationUnits?.length > 0;

  const calendarEvents: CalendarEvent[] = reservationUnit?.reservations
    ? [...reservationUnit.reservations, initialReservation]
        .filter((n: ReservationType) => n)
        .map((n: ReservationType) => {
          const event = {
            title: `${
              n.state === "CANCELLED"
                ? `${t("reservationCalendar:prefixForCancelled")}: `
                : ""
            }`,
            start: parseDate(n.begin),
            end: parseDate(n.end),
            allDay: false,
            event: n,
          };

          return event;
        })
    : [];

  const eventBuffers = getEventBuffers([
    ...(calendarEvents.flatMap((e) => e.event) as ReservationType[]),
    {
      begin: initialReservation?.begin,
      end: initialReservation?.end,
      state: "INITIAL",
      bufferTimeBefore: reservationUnit.bufferTimeBefore,
      bufferTimeAfter: reservationUnit.bufferTimeAfter,
    } as PendingReservation,
  ]);

  const ToolbarWithProps = React.memo((props: ToolbarProps) => (
    <Toolbar
      {...props}
      onNavigateToNextAvailableDate={() =>
        reservationUnit.nextAvailableSlot &&
        setFocusDate(new Date(reservationUnit.nextAvailableSlot))
      }
    />
  ));

  return reservationUnit ? (
    <Wrapper>
      <Head
        reservationUnit={reservationUnit}
        activeOpeningTimes={activeOpeningTimes}
        reservationUnitList={reservationUnitList}
        viewType="single"
        calendarRef={calendarRef}
      />
      <Container>
        <TwoColumnLayout>
          <div>
            <Accordion open heading={t("reservationUnit:description")}>
              <Content>
                <p>
                  <Sanitize
                    html={getTranslation(reservationUnit, "description")}
                  />
                </p>
              </Content>
            </Accordion>
          </div>
          <div>
            <Address reservationUnit={reservationUnit} />
          </div>
        </TwoColumnLayout>
        {reservationUnit.minReservationDuration &&
          reservationUnit.maxReservationDuration && (
            <CalendarWrapper ref={calendarRef}>
              <StyledH2>{t("reservations:reservationCalendar")}</StyledH2>
              <div aria-hidden>
                <Calendar
                  events={[...calendarEvents, ...eventBuffers]}
                  begin={focusDate || new Date()}
                  onNavigate={(d: Date) => {
                    setFocusDate(d);
                  }}
                  customEventStyleGetter={eventStyleGetter}
                  slotPropGetter={slotPropGetter}
                  viewType={calendarViewType}
                  onView={(n: WeekOptions) => {
                    setCalendarViewType(n);
                  }}
                  onSelecting={(event: CalendarEvent) =>
                    handleEventChange(event, true)
                  }
                  showToolbar
                  reservable
                  toolbarComponent={
                    reservationUnit.nextAvailableSlot
                      ? ToolbarWithProps
                      : Toolbar
                  }
                  resizable
                  draggable
                  onEventDrop={handleEventChange}
                  onEventResize={handleEventChange}
                  onSelectSlot={handleSlotClick}
                  draggableAccessor={({ event }: CalendarEvent) =>
                    (event.state as ReservationStateWithInitial) === "INITIAL"
                  }
                  resizableAccessor={({ event }: CalendarEvent) =>
                    (event.state as ReservationStateWithInitial) === "INITIAL"
                  }
                  step={15}
                  timeslots={getTimeslots(
                    reservationUnit.reservationStartInterval
                  )}
                  aria-hidden
                />
              </div>
              <CalendarFooter>
                <LoginFragment
                  text={t("reservationCalendar:loginInfo")}
                  componentIfAuthenticated={
                    <ReservationInfo
                      reservationUnit={reservationUnit}
                      begin={initialReservation?.begin}
                      end={initialReservation?.end}
                      resetReservation={() => setInitialReservation(null)}
                      isSlotReservable={isSlotReservable}
                      setCalendarFocusDate={setFocusDate}
                      activeApplicationRounds={activeApplicationRounds}
                    />
                  }
                />
                <Legend />
              </CalendarFooter>
            </CalendarWrapper>
          )}
        {reservationUnit.location && (
          <MapWrapper>
            <StyledH2>{t("common:location")}</StyledH2>
            <Map
              title={getTranslation(reservationUnit.unit, "name")}
              latitude={Number(reservationUnit.location?.latitude)}
              longitude={Number(reservationUnit.location?.longitude)}
            />
          </MapWrapper>
        )}
        <TwoColumnLayout>
          <Address reservationUnit={reservationUnit} />
          <div />
          <Accordion heading={t("reservationCalendar:heading.termsOfUse")}>
            <Content>
              <p>
                <Sanitize
                  html={getTranslation(reservationUnit, "termsOfUse")}
                />
              </p>
            </Content>
          </Accordion>
          <div />
          {reservationUnit.serviceSpecificTerms && (
            <>
              <Accordion heading={t("reservationUnit:termsOfUseSpaces")}>
                <Content>
                  <p>
                    <Sanitize
                      html={getTranslation(
                        reservationUnit.serviceSpecificTerms,
                        "text"
                      )}
                    />
                  </p>
                </Content>
              </Accordion>
              <div />
            </>
          )}
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
                viewType="single"
              />
            </BottomContainer>
          </>
        )}
      </BottomWrapper>
    </Wrapper>
  ) : null;
};

export default ReservationUnit;
