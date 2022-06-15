import { get, uniqBy } from "lodash";
import {
  ApplicationEventScheduleType,
  ApplicationEventType,
  ApplicationsApplicationApplicantTypeChoices,
  ApplicationType,
  ReservationUnitType,
} from "../../../common/gql-types";
import { OptionType } from "../../../common/types";

export const getFilteredApplicationEvents = (
  applications: ApplicationType[],
  unitFilter: OptionType | null,
  timeFilter: OptionType[],
  orderFilter: OptionType[],
  reservationUnitFilter: ReservationUnitType | null
): ApplicationEventType[] => {
  if (applications?.length < 1 || !reservationUnitFilter) return [];

  let applicationEvents = applications.flatMap(
    (application): ApplicationEventType[] =>
      application.applicationEvents as ApplicationEventType[]
  );

  if (orderFilter?.length) {
    const order = orderFilter.map((n) => (n.value as number) - 1);
    applicationEvents = applicationEvents.filter((applicationEvent) =>
      order.every(
        (o) =>
          get(applicationEvent, `applicationEventSchedules[${o}]`) !== undefined
      )
    );
  }

  if (unitFilter) {
    applicationEvents = applicationEvents.filter((applicationEvent) =>
      applicationEvent?.eventReservationUnits?.some((eventReservationUnit) => {
        const unitId = eventReservationUnit?.reservationUnit?.unit?.pk || 0;
        return unitFilter.value === unitId;
      })
    );
  }

  if (timeFilter.length) {
    const priorities = timeFilter.map((n) => n.value);
    applicationEvents = applicationEvents.filter((applicationEvent) =>
      applicationEvent?.applicationEventSchedules?.some(
        (applicationEventSchedule) =>
          applicationEventSchedule?.priority &&
          priorities.includes(applicationEventSchedule?.priority)
      )
    );
  }

  if (reservationUnitFilter) {
    applicationEvents = applicationEvents.filter((applicationEvent) =>
      applicationEvent?.eventReservationUnits?.some(
        (eventReservationUnit) =>
          eventReservationUnit?.reservationUnit?.pk === reservationUnitFilter.pk
      )
    );
  }

  return applicationEvents;
};

export const getApplicationByApplicationEvent = (
  applications: ApplicationType[],
  applicationEventId: number
): ApplicationType | undefined => {
  return applications.find((application) =>
    application?.applicationEvents?.find(
      (applicationEvent) => applicationEvent?.pk === applicationEventId
    )
  );
};

export type Cell = {
  hour: number;
  minute: number;
  state?: string;
  key: string;
};

export const applicationEventSchedulesToCells = (
  firstSlotStart: number,
  lastSlotStart: number
): Cell[][] => {
  const cells = [] as Cell[][];

  for (let j = 0; j < 7; j += 1) {
    const day = [];
    for (let i = firstSlotStart; i <= lastSlotStart; i += 1) {
      day.push({
        key: `${j}-${i}-00`,
        hour: i,
        minute: 0,
      } as Cell);
      day.push({
        key: `${j}-${i}-30`,
        hour: i,
        minute: 30,
      } as Cell);
    }
    cells.push(day);
  }

  return cells;
};

export const isSlotAdjacent = (selection: string[], slot: string): boolean => {
  const [day, hour, minute] = slot.split("-").map(Number);
  return minute === 0
    ? selection.includes(`${day}-${hour}-30`) ||
        selection.includes(`${day}-${hour - 1}-30`)
    : selection.includes(`${day}-${hour}-00`) ||
        selection.includes(`${day}-${hour + 1}-00`);
};

export const isSlotFirst = (selection: string[], slot: string): boolean => {
  const [day, hour, minute] = slot.split("-").map(Number);
  return minute === 0
    ? !selection.includes(`${day}-${hour - 1}-30`)
    : !selection.includes(`${day}-${hour}-00`);
};

export const isSlotLast = (selection: string[], slot: string): boolean => {
  const [day, hour, minute] = slot.split("-").map(Number);
  return minute === 0
    ? !selection.includes(`${day}-${hour}-30`)
    : !selection.includes(`${day}-${hour + 1}-00`);
};

export const getApplicationEventScheduleTimes = (
  applicationEventSchedule: ApplicationEventScheduleType
): { begin: string; end: string } => {
  return {
    begin: `${applicationEventSchedule?.day}-${Number(
      applicationEventSchedule?.begin.substring(0, 2)
    )}-${applicationEventSchedule?.begin.substring(3, 5)}`,
    end: `${applicationEventSchedule?.day}-${Number(
      applicationEventSchedule?.end.substring(0, 2)
    )}-${applicationEventSchedule?.end.substring(3, 5)}`,
  };
};

export const doSomeSlotsFitApplicationEventSchedule = (
  applicationEventSchedule: ApplicationEventScheduleType,
  slots: string[]
): boolean => {
  const { begin, end } = getApplicationEventScheduleTimes(
    applicationEventSchedule
  );
  return slots.some((slot) => {
    const [slotDay, slotHour, slotMinute] = slot.split("-").map(Number);
    const [beginDay, beginHour, beginMinute] = begin.split("-").map(Number);
    const [, endHour, endMinute] = end.split("-").map(Number);
    const slotTime = new Date().setHours(slotHour, slotMinute);
    const beginTime = new Date().setHours(beginHour, beginMinute);
    const endTime = new Date().setHours(endHour, endMinute);
    return slotDay === beginDay && beginTime <= slotTime && endTime > slotTime;
  });
};

export const getSlotApplicationEventCount = (
  slots: string[],
  applicationEvents: ApplicationEventType[]
): number => {
  const applicationEventSchedules = applicationEvents.flatMap(
    (applicationEvent) => applicationEvent.applicationEventSchedules
  );
  const schedules = applicationEventSchedules.filter(
    (applicationEventSchedule) =>
      applicationEventSchedule &&
      doSomeSlotsFitApplicationEventSchedule(applicationEventSchedule, slots)
  );
  return uniqBy(schedules, "pk").length;
};

export const getTimeSlotOptions = (
  day: string,
  startHours: number,
  startMinutes: number,
  endHours: number,
  endOptions?: boolean
): OptionType[] => {
  const timeSlots = [];
  for (let i = startHours; i <= endHours; i += 1) {
    if (endOptions) {
      timeSlots.push({
        label: `${i}:30`,
        value: `${day}-${i}-00`,
      });
      timeSlots.push({
        label: `${i === 23 ? 0 : i + 1}:00`,
        value: `${day}-${i}-30`,
      });
    } else {
      timeSlots.push({
        label: `${i}:00`,
        value: `${day}-${i}-00`,
      });
      timeSlots.push({
        label: `${i}:30`,
        value: `${day}-${i}-30`,
      });
    }
  }

  if (startMinutes === 30) timeSlots.shift();

  return timeSlots;
};

export const getTimeSlots = (
  applicationEventSchedules: ApplicationEventScheduleType[]
): string[] => {
  return applicationEventSchedules?.reduce(
    (acc: string[], cur: ApplicationEventScheduleType) => {
      const { day } = cur;
      const [startHours, startMinutes] = cur.begin.split(":").map(Number);
      const [endHours] = cur.end.split(":").map(Number);
      const timeSlots: string[] = [];
      for (let i = startHours; i < endHours; i += 1) {
        timeSlots.push(`${day}-${i}-00`);
        timeSlots.push(`${day}-${i}-30`);
      }

      if (startMinutes === 30) timeSlots.shift();

      return [...acc, ...timeSlots];
    },
    []
  );
};

export const getApplicantName = (
  application: ApplicationType | undefined
): string => {
  return application?.applicantType ===
    ApplicationsApplicationApplicantTypeChoices.Individual
    ? `${application?.contactPerson?.firstName} ${application?.contactPerson?.lastName}`.trim()
    : application?.applicantName || "";
};

export const getSlotApplicationEvents = (
  slots: string[] | null,
  applicationEvents: ApplicationEventType[]
): ApplicationEventType[] => {
  if (!slots) return [];
  return applicationEvents.filter((applicationEvent) =>
    applicationEvent?.applicationEventSchedules?.some(
      (applicationEventSchedule) =>
        applicationEventSchedule &&
        doSomeSlotsFitApplicationEventSchedule(applicationEventSchedule, slots)
    )
  );
};
