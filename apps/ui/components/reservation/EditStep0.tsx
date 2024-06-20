import Calendar, { CalendarEvent } from "common/src/calendar/Calendar";
import { getEventBuffers } from "common/src/calendar/util";
import { breakpoints } from "common/src/common/style";
import type { PendingReservation } from "@/modules/types";
import type {
  ApplicationRoundFieldsFragment,
  ListReservationsQuery,
  ReservationNode,
  ReservationQuery,
  ReservationUnitPageQuery,
} from "@gql/gql-types";
import {
  addMinutes,
  addSeconds,
  differenceInMinutes,
  set,
  startOfDay,
} from "date-fns";
import classNames from "classnames";
import { IconArrowRight, IconCross } from "hds-react";
import { useRouter } from "next/router";
import React, { Children, useCallback, useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import { useMedia } from "react-use";
import styled from "styled-components";
import { Toolbar } from "common/src/calendar/Toolbar";
import {
  dayMax,
  filterNonNullable,
  getIntervalMinutes,
  getLocalizationLang,
} from "common/src/helpers";
import {
  SLOTS_EVERY_HOUR,
  canReservationTimeBeChanged,
  getDurationOptions,
  getNewReservation,
} from "@/modules/reservation";
import { getSlotPropGetter, isRangeReservable } from "@/modules/reservable";
import {
  getPossibleTimesForDay,
  getReservationUnitPrice,
  getTimeString,
} from "@/modules/reservationUnit";
import { formatDuration, isTouchDevice } from "@/modules/util";
import { BlackButton, MediumButton } from "@/styles/util";
import Legend from "../calendar/Legend";
import ReservationCalendarControls, {
  FocusTimeSlot,
} from "../calendar/ReservationCalendarControls";
import { CalendarWrapper } from "../reservation-unit/ReservationUnitStyles";
import { eventStyleGetter } from "@/components/common/calendarUtils";
import { type UseFormReturn } from "react-hook-form";
import { type PendingReservationFormType } from "@/components/reservation-unit/schema";
import { fromUIDate, isValidDate, toUIDate } from "common/src/common/util";
import { useReservableTimes } from "@/hooks/useReservableTimes";

type QueryData = NonNullable<ListReservationsQuery["reservations"]>;
type Node = NonNullable<
  NonNullable<NonNullable<QueryData["edges"]>[0]>["node"]
>;
type ReservationUnitNodeT = NonNullable<
  ReservationUnitPageQuery["reservationUnit"]
>;
type ReservationNodeT = NonNullable<ReservationQuery["reservation"]>;
type Props = {
  reservation: ReservationNodeT;
  reservationUnit: ReservationUnitNodeT;
  userReservations: Node[];
  reservationForm: UseFormReturn<PendingReservationFormType>;
  activeApplicationRounds: ApplicationRoundFieldsFragment[];
  setErrorMsg: React.Dispatch<React.SetStateAction<string | null>>;
  nextStep: () => void;
  apiBaseUrl: string;
  isLoading: boolean;
};

type WeekOptions = "day" | "week" | "month";

const CalendarFooter = styled.div`
  position: sticky;
  bottom: 0;
  background-color: var(--color-white);
  z-index: var(--tilavaraus-stack-order-sticky-container);

  display: flex;
  flex-direction: column-reverse;

  @media (min-width: ${breakpoints.l}) {
    flex-direction: column;
    gap: var(--spacing-2-xl);
    justify-content: space-between;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--spacing-m);

  @media (min-width: ${breakpoints.s}) {
    flex-direction: row;
  }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO type calendar props
const EventWrapperComponent = (props: any): JSX.Element => {
  const { event } = props;
  let isSmall = false;
  let isMedium = false;
  if (event.event.state === "INITIAL") {
    const { start, end } = props.event;
    const diff = differenceInMinutes(end, start);
    if (diff <= 30) isSmall = true;
    if (diff <= 120) isMedium = true;
  }
  return <div {...props} className={classNames({ isSmall, isMedium })} />;
};

const TouchCellWrapper = ({
  children,
  value,
  onSelectSlot,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO type calendar props
any): JSX.Element => {
  return React.cloneElement(Children.only(children), {
    onTouchEnd: () => onSelectSlot({ action: "click", slots: [value] }),
    style: {
      className: `${children}`,
    },
  });
};

/// To check availability for the reservation.
/// The check functions use the reservationUnit instead of a list of other reservations
/// so have to do some questionable edits.
function getWithoutThisReservation(
  reservationUnit: ReservationUnitNodeT,
  reservation: ReservationNodeT
): ReservationUnitNodeT {
  const otherReservations = filterNonNullable(
    reservationUnit?.reservationSet?.filter((n) => n?.pk !== reservation.pk)
  );
  return {
    ...reservationUnit,
    reservationSet: otherReservations,
  };
}

function calculateFocusSlot(
  date: string,
  timeValue: string,
  durationMinutes: number
): Omit<FocusTimeSlot, "isReservable"> {
  if (!timeValue) {
    throw new Error("Invalid time value");
  }
  const [hours, minutes] = timeValue
    .split(":")
    .map(Number)
    .filter(Number.isFinite);
  if (hours == null || minutes == null) {
    throw new Error("Invalid time value");
  }
  const start = fromUIDate(date) ?? new Date();
  if (!isValidDate(start)) {
    throw new Error("Invalid date value");
  }
  start.setHours(hours, minutes, 0, 0);
  const end = addMinutes(start, durationMinutes);

  return {
    start,
    end,
    durationMinutes,
  };
}

export function EditStep0({
  reservation,
  reservationUnit,
  userReservations,
  activeApplicationRounds,
  reservationForm,
  nextStep,
  isLoading,
}: Props): JSX.Element {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isMobile = useMedia(`(max-width: ${breakpoints.m})`, false);
  const [calendarViewType, setCalendarViewType] = useState<WeekOptions>("week");

  const originalBegin = new Date(reservation.begin);
  const originalEnd = new Date(reservation.end);

  const { watch, handleSubmit, setValue, formState } = reservationForm;
  const { isDirty } = formState;

  const [focusDate, setFocusDate] = useState<Date>(originalBegin);
  const reservableTimes = useReservableTimes(reservationUnit);

  const isSlotAvailable = useCallback(
    (start: Date, end: Date, skipLengthCheck = false): boolean => {
      const resUnit = getWithoutThisReservation(reservationUnit, reservation);
      return isRangeReservable({
        range: {
          start,
          end,
        },
        reservationUnit: resUnit,
        reservableTimes,
        activeApplicationRounds,
        skipLengthCheck,
      });
    },
    [reservationUnit, reservableTimes, reservation, activeApplicationRounds]
  );

  const durationOptions = getDurationOptions(reservationUnit, t);

  const duration =
    watch("duration") ?? differenceInMinutes(originalBegin, originalEnd);
  const startingTimeOptions = getPossibleTimesForDay(
    reservableTimes,
    reservationUnit?.reservationStartInterval,
    fromUIDate(watch("date") ?? "") ?? new Date(),
    reservationUnit,
    activeApplicationRounds,
    duration
  );

  const focusSlot = calculateFocusSlot(
    watch("date") ?? "",
    watch("time") ?? "",
    duration
  );
  const isReservable = isSlotAvailable(focusSlot.start, focusSlot.end);

  const calendarEvents: CalendarEvent<ReservationNode>[] = useMemo(() => {
    const diff = focusSlot.durationMinutes ?? 0;
    const dur = diff >= 90 ? `(${formatDuration(diff, t)})` : "";
    // TODO show different style if the reservation has not been modified
    const currentReservation = {
      begin: focusSlot.start,
      end: focusSlot.end,
      state: "INITIAL",
    };
    const resUnit = getWithoutThisReservation(reservationUnit, reservation);
    const otherReservations = filterNonNullable(resUnit.reservationSet);
    return [...otherReservations, currentReservation].map((n) => {
      const suffix = n.state === "INITIAL" ? dur : "";
      const event = {
        title:
          n.state === "CANCELLED"
            ? `${t("reservationCalendar:prefixForCancelled")}: `
            : suffix,
        start: n.begin ? new Date(n.begin) : new Date(),
        end: n.end ? new Date(n.end) : new Date(),
        allDay: false,
        event: n,
      };

      return event as CalendarEvent<ReservationNode>;
    });
  }, [reservationUnit, t, focusSlot, reservation]);

  const eventBuffers = useMemo(() => {
    const bufferTimeBefore = reservationUnit.bufferTimeBefore ?? 0;
    const bufferTimeAfter = reservationUnit.bufferTimeAfter ?? 0;

    return getEventBuffers([
      ...(calendarEvents.flatMap((e) => e.event) as ReservationNode[]),
      {
        begin: focusSlot.start.toISOString(),
        end: focusSlot.end.toISOString(),
        bufferTimeBefore,
        bufferTimeAfter,
      },
    ]);
  }, [
    calendarEvents,
    focusSlot,
    reservationUnit?.bufferTimeAfter,
    reservationUnit?.bufferTimeBefore,
  ]);

  const isSlotFree = useCallback(
    (start: Date): boolean => {
      const price = getReservationUnitPrice({
        reservationUnit,
        pricingDate: start,
        asNumeral: true,
      });
      return price === "0";
    },
    [reservationUnit]
  );

  const slotPropGetter = useMemo(() => {
    if (!reservationUnit) {
      return undefined;
    }
    return getSlotPropGetter({
      reservableTimes,
      activeApplicationRounds,
      reservationBegins: reservationUnit.reservationBegins
        ? new Date(reservationUnit.reservationBegins)
        : undefined,
      reservationEnds: reservationUnit.reservationEnds
        ? new Date(reservationUnit.reservationEnds)
        : undefined,
      reservationsMinDaysBefore: reservationUnit.reservationsMinDaysBefore ?? 0,
      reservationsMaxDaysBefore: reservationUnit.reservationsMaxDaysBefore ?? 0,
      customValidation: (date) => isSlotFree(date),
    });
  }, [activeApplicationRounds, reservationUnit, isSlotFree, reservableTimes]);

  // TODO submit should be completely unnecessary
  // just disable nextStep button if the form is invalid
  // the form isn't submitted from this step at all
  const submitReservation = (_data: PendingReservationFormType) => {
    if (!focusSlot?.start || !focusSlot?.end) {
      return;
    }
    const newReservation: PendingReservation = {
      begin: focusSlot.start.toISOString(),
      end: focusSlot.end.toISOString(),
      price: getReservationUnitPrice({
        reservationUnit,
        pricingDate: focusSlot?.start ? new Date(focusSlot.start) : undefined,
        minutes: 0,
        asNumeral: true,
      }),
    };

    const resUnit = getWithoutThisReservation(reservationUnit, reservation);

    const isNewReservationValid = canReservationTimeBeChanged({
      reservation,
      newReservation,
      reservableTimes,
      reservationUnit: resUnit,
      activeApplicationRounds,
    });

    /*
    if (validationError) {
      setErrorMsg(t(`reservations:modifyTimeReasons.${validationError}`));
    }
    */
    if (isNewReservationValid) {
      nextStep();
    }
  };

  // TODO this is copy pasta from reservation-unit/[id]
  const clampDuration = useCallback(
    (d: number): number => {
      const { minReservationDuration, maxReservationDuration } =
        reservationUnit;
      const minReservationDurationMinutes = minReservationDuration
        ? minReservationDuration / 60
        : 30;
      const maxReservationDurationMinutes = maxReservationDuration
        ? maxReservationDuration / 60
        : Number.MAX_SAFE_INTEGER;
      const initialDuration = Math.max(
        minReservationDurationMinutes,
        durationOptions[0]?.value ?? 0
      );
      return Math.min(
        Math.max(d, initialDuration),
        maxReservationDurationMinutes
      );
    },
    [durationOptions, reservationUnit]
  );

  // FIXME this allows too long / too short reservation selects
  // unlike reservation-unit/[id] the clamp doesn't work here (in the calendar view)
  const handleCalendarEventChange = useCallback(
    (
      { start, end }: CalendarEvent<ReservationNode>,
      skipLengthCheck = false
    ): boolean => {
      const { minReservationDuration } = reservationUnit;
      const minEnd = addSeconds(start, minReservationDuration ?? 0);
      // TODO this is copy pasta from reservation-unit/[id]
      // start time and duration needs to be snapped to the nearest interval
      // i.e. case where the options are 60 mins apart but the drag and drop allows 30 mins increments
      // this causes backend validation errors
      const interval = getIntervalMinutes(
        reservationUnit.reservationStartInterval
      );
      const originalDuration = differenceInMinutes(end, start);
      let dayTime = start.getHours() * 60 + start.getMinutes();
      if (dayTime % interval !== 0) {
        dayTime = Math.ceil(dayTime / interval) * interval;
      }
      const newStart = set(startOfDay(start), {
        hours: dayTime / 60,
        minutes: dayTime % 60,
      });
      let dur = clampDuration(originalDuration);
      if (dur % interval !== 0) {
        dur = Math.ceil(duration / interval) * interval;
      }
      const newEnd = dayMax([end, minEnd, addMinutes(newStart, duration)]);
      if (newEnd == null) {
        return false;
      }

      if (!isSlotAvailable(newStart, newEnd, skipLengthCheck)) {
        return false;
      }

      const { begin } = getNewReservation({
        start: newStart,
        end: newEnd,
        reservationUnit,
      });
      const newDate = toUIDate(begin);
      const newTime = getTimeString(begin);
      setValue("date", newDate, { shouldDirty: true });
      setValue("time", newTime, { shouldDirty: true });
      setValue("duration", differenceInMinutes(newEnd, newStart), {
        shouldDirty: true,
      });

      const isClientATouchDevice = isTouchDevice();
      if (isClientATouchDevice) {
        // TODO test: does setValue work?
        setValue("isControlsVisible", true);
      }

      return true;
    },
    [isSlotAvailable, clampDuration, reservationUnit, setValue]
  );

  // FIXME some issues still moving a reservation (requires multiple clicks at times)
  const handleSlotClick = useCallback(
    (
      props: {
        start: Date;
        end: Date;
        action: "select" | "click" | "doubleClick";
      },
      skipLengthCheck = false
    ): boolean => {
      const { start, end, action } = props;
      const isClientATouchDevice = isTouchDevice();
      const isTouchClick = action === "select" && isClientATouchDevice;

      if (action === "select" && !isClientATouchDevice) {
        return false;
      }

      const normalizedEnd =
        action === "click" ||
        (isTouchClick && differenceInMinutes(end, start) <= 30)
          ? addSeconds(start, reservationUnit?.minReservationDuration ?? 0)
          : new Date(end);

      const { begin } = getNewReservation({
        start,
        end: normalizedEnd,
        reservationUnit,
      });

      // TODO why isn't this normalizedEnd?
      if (!isSlotAvailable(start, end, skipLengthCheck)) {
        return false;
      }

      const newDate = toUIDate(new Date(begin));
      const newTime = getTimeString(new Date(begin));
      // click doesn't change the duration
      setValue("date", newDate, { shouldDirty: true });
      setValue("time", newTime, { shouldDirty: true });

      return true;
    },
    [reservationUnit, isSlotAvailable, setValue]
  );

  const events = [...calendarEvents, ...eventBuffers];

  return (
    <>
      <CalendarWrapper>
        <div aria-hidden>
          <Calendar<ReservationNode>
            events={events}
            begin={focusDate}
            // TODO should not set the reservation date, but a separate focus date
            onNavigate={(d: Date) => setFocusDate(d)}
            eventStyleGetter={(event) =>
              eventStyleGetter(
                event,
                filterNonNullable(userReservations?.map((n) => n?.pk))
              )
            }
            slotPropGetter={slotPropGetter}
            viewType={calendarViewType}
            onView={(str) => {
              if (str === "month" || str === "week" || str === "day") {
                setCalendarViewType(str);
              }
            }}
            onSelecting={(event) => handleCalendarEventChange(event, true)}
            // TODO what is the purpose of this?
            // min={addHours(startOfDay(focusDate), 6)}
            showToolbar
            reservable
            toolbarComponent={Toolbar}
            dateCellWrapperComponent={TouchCellWrapper}
            eventWrapperComponent={EventWrapperComponent}
            resizable
            draggable={!isTouchDevice()}
            onEventDrop={handleCalendarEventChange}
            onEventResize={handleCalendarEventChange}
            onSelectSlot={handleSlotClick}
            draggableAccessor={({ event }) =>
              event?.state ? event?.state?.toString() === "INITIAL" : false
            }
            resizableAccessor={({ event }) =>
              event?.state ? event?.state?.toString() === "INITIAL" : false
            }
            step={30}
            timeslots={SLOTS_EVERY_HOUR}
            culture={getLocalizationLang(i18n.language)}
            aria-hidden
            longPressThreshold={100}
          />
        </div>
        <CalendarFooter>
          <ReservationCalendarControls
            reservationUnit={reservationUnit}
            mode="edit"
            isAnimated={isMobile}
            reservationForm={reservationForm}
            durationOptions={durationOptions}
            focusSlot={{ ...focusSlot, isReservable }}
            startingTimeOptions={startingTimeOptions}
            submitReservation={submitReservation}
          />
        </CalendarFooter>
        <Legend />
      </CalendarWrapper>
      <form noValidate onSubmit={handleSubmit(submitReservation)}>
        <Actions>
          <BlackButton
            type="button"
            variant="secondary"
            iconLeft={<IconCross aria-hidden />}
            onClick={() => {
              router.push(`/reservations/${reservation.pk}`);
            }}
            data-testid="reservation-edit__button--cancel"
          >
            {t("reservations:cancelEditReservationTime")}
          </BlackButton>
          <MediumButton
            variant="primary"
            iconRight={<IconArrowRight aria-hidden />}
            disabled={!isReservable || !isDirty}
            type="submit"
            data-testid="reservation-edit__button--continue"
            isLoading={isLoading}
            loadingText={t("reservationCalendar:nextStepLoading")}
          >
            {t("reservationCalendar:nextStep")}
          </MediumButton>
        </Actions>
      </form>
    </>
  );
}
