import { IconCross, Select } from "hds-react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { fontMedium } from "common/src/common/typography";
import styled from "styled-components";
import {
  type ApplicationSectionNode,
  ApplicationRoundStatusChoice,
  type Query,
  type AllocatedTimeSlotNode,
  type SuitableTimeRangeNode,
  Weekday,
  ApplicationSectionStatusChoice,
} from "common/types/gql-types";
import { ShowAllContainer } from "common/src/components/";
import type { ReservationUnitNode } from "common";
import { ALLOCATION_CALENDAR_TIMES } from "@/common/const";
import {
  type RelatedSlot,
  constructTimeSlot,
  convertWeekday,
  decodeTimeSlot,
  getTimeSlotOptions,
  transformWeekday,
} from "./modules/applicationRoundAllocation";
import { AllocatedCard, AllocationCard } from "./AllocationCard";
import { type ApolloQueryResult } from "@apollo/client";
import { useSlotSelection } from "./hooks";
import { filterNonNullable } from "common/src/helpers";
import { type Day } from "common/src/conversion";

type Props = {
  applicationSections: ApplicationSectionNode[] | null;
  reservationUnit?: ReservationUnitNode;
  refetchApplicationEvents: () => Promise<ApolloQueryResult<Query>>;
  applicationRoundStatus: ApplicationRoundStatusChoice;
  relatedAllocations: RelatedSlot[][];
};

const Wrapper = styled.div`
  position: relative;
  border: 1px solid var(--color-black-30);
  margin-top: var(--spacing-layout-l);
  padding: var(--spacing-s);
  height: fit-content;
  width: 100%;
  max-width: 300px;
`;

const CloseBtn = styled.button`
  background-color: transparent;
  border: none;
  position: absolute;
  top: var(--spacing-s);
  right: var(--spacing-2-xs);
  cursor: pointer;
`;

const StyledShowAllContainer = styled(ShowAllContainer)`
  .ShowAllContainer__ToggleButton {
    margin-top: var(--spacing-2-xs);
    color: var(--color-bus);
  }
`;

const TimeSelectWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: var(--spacing-s);
  margin-top: var(--spacing-s);
  > * {
    width: calc(50% - var(--spacing-xs));
  }

  label {
    ${fontMedium};
    margin-bottom: 0;
  }
`;

const TimeLabel = styled.div`
  background-color: var(--color-black-5);
  padding: var(--spacing-3-xs) var(--spacing-xs);
  ${fontMedium};
  font-size: var(--fontsize-body-m);
  display: inline-block;
`;

const EmptyState = styled.div`
  font-size: var(--fontsize-body-m);
  margin-bottom: var(--spacing-m);
`;

const getTimeLabel = (selection: string[], t: TFunction): string => {
  if (!selection || selection.length < 1) {
    return "";
  }
  const [startDay, startHour, startMinute] = selection[0].split("-");
  const [, endHour, endMinute] = selection[selection.length - 1].split("-");

  return `${t(`dayLong.${startDay}`)} ${startHour}:${startMinute} - ${
    endMinute === "30"
      ? endHour + endMinute === "2330"
        ? 0
        : Number(endHour) + 1
      : endHour
  }:${endMinute === "30" ? "00" : "30"}`;
};

function TimeSelection(): JSX.Element {
  const { t } = useTranslation();
  const [selection, setSelection] = useSlotSelection();

  const getOptions = useCallback(
    (type: "start" | "end") => {
      if (!selection || selection.length < 1) return [];
      const day = selection[0].split("-")[0];
      const start = ALLOCATION_CALENDAR_TIMES[0];
      const end = ALLOCATION_CALENDAR_TIMES[1];
      return getTimeSlotOptions(day, start, 0, end, type === "end");
    },
    [selection]
  );

  const timeSlotStartOptions = getOptions("start");
  const timeSlotEndOptions = getOptions("end");

  const setSelectedTime = (startValue?: string, endValue?: string): void => {
    if (!selection) {
      return undefined;
    }
    const start = startValue || selection[0];
    const end = endValue || selection[selection.length - 1];
    const [, startHours, startMinutes] = start
      ? start.toString().split("-")
      : [];
    const [, endHours, endMinutes] = end ? end.toString().split("-") : [];
    const timeSlots = getTimeSlotOptions(
      selection[0].split("-")[0],
      Number(startHours),
      Number(startMinutes),
      Number(endHours)
    ).map((n) => n.value);

    if (endValue && endMinutes === "00") timeSlots.pop();
    setSelection(timeSlots);
  };

  return (
    <TimeSelectWrapper>
      <Select
        label={t("Allocation.startingTime")}
        options={timeSlotStartOptions}
        value={
          timeSlotStartOptions.find((n) => n.value === selection?.[0]) ?? null
        }
        onChange={(val: (typeof timeSlotStartOptions)[0]) => {
          const [startHours, startMinutes] = val.label.split(":").map(Number);
          const startTime = new Date().setHours(startHours, startMinutes);
          const endOption = timeSlotEndOptions.find(
            (n) => n.value === selection?.[selection.length - 1]
          );
          if (!endOption) {
            return;
          }
          // TODO this is unsafe
          const [endHours, endMinutes] = endOption.label.split(":").map(Number);
          const endTime = new Date().setHours(endHours, endMinutes);

          const startIndex = timeSlotStartOptions.indexOf(val);
          const endValue =
            startTime >= endTime
              ? timeSlotEndOptions[startIndex + 1].value
              : timeSlotEndOptions.find(
                  (n) => n.value === selection?.[selection.length - 1]
                )?.value;
          if (endValue != null && val.value != null) {
            setSelectedTime(val.value, endValue);
          }
        }}
      />
      <Select
        label={t("Allocation.endingTime")}
        options={timeSlotEndOptions}
        value={
          timeSlotEndOptions.find(
            (n) => n.value === selection?.[selection.length - 1]
          ) ?? null
        }
        onChange={(val: (typeof timeSlotEndOptions)[0]) =>
          setSelectedTime(undefined, val.value)
        }
        isOptionDisabled={(option) => {
          const firstOption = timeSlotStartOptions.find(
            (n) => n.value === selection?.[0]
          );
          if (!firstOption) {
            return false;
          }
          const [startHours, startMinutes] = firstOption.label
            .split(":")
            .map(Number);
          const startTime = new Date().setHours(startHours, startMinutes);
          const [endHours, endMinutes] = option.label.split(":").map(Number);
          const endTime = new Date().setHours(endHours, endMinutes);

          return endTime <= startTime && endHours !== 0;
        }}
      />
    </TimeSelectWrapper>
  );
}

function isInsideSelection(
  selection: { day: Day; start: number; end: number },
  tr: {
    dayOfTheWeek: Weekday;
    beginTime: string;
    endTime: string;
  }
): boolean {
  const start = constructTimeSlot(selection.day, tr.beginTime);
  const end = constructTimeSlot(selection.day, tr.endTime);
  if (!start || !end) {
    return false;
  }
  if (selection.day !== convertWeekday(tr.dayOfTheWeek)) {
    return false;
  }
  if (start.hour > selection.end) {
    return false;
  }
  if (end.hour <= selection.start) {
    return false;
  }
  return true;
}

function getAllocatedTimeSlot(
  section: ApplicationSectionNode,
  selection: { day: Day; startHour: number; endHour: number }
): AllocatedTimeSlotNode | null {
  const { day, startHour, endHour } = selection;
  return (
    section.reservationUnitOptions
      ?.flatMap((ruo) => ruo.allocatedTimeSlots ?? [])
      .find((ts) => {
        return isInsideSelection({ day, start: startHour, end: endHour }, ts);
      }) ?? null
  );
}

function getSuitableTimeSlot(
  section: ApplicationSectionNode,
  selection: { day: Day; startHour: number; endHour: number }
): SuitableTimeRangeNode | null {
  const { day, startHour, endHour } = selection;
  return (
    section.suitableTimeRanges?.find((tr) => {
      return isInsideSelection({ day, start: startHour, end: endHour }, tr);
    }) ?? null
  );
}

export function AllocationColumn({
  applicationSections,
  reservationUnit,
  refetchApplicationEvents,
  applicationRoundStatus,
  relatedAllocations,
}: Props): JSX.Element | null {
  const { t } = useTranslation();
  const [selection, setSelection] = useSlotSelection();

  const slots = selection.map((s) => decodeTimeSlot(s));
  const day = slots
    .map((s) => s.day)
    .filter((d): d is Day => d >= 0 && d <= 6)
    .reduce<Day>((acc, d) => (d > acc ? d : acc), 0);
  const startHour = slots.length > 0 ? slots[0].hour : 0;
  const endHour = slots.length > 0 ? slots[slots.length - 1].hour : 0;

  // TODO copy pasta from AllocationCalendar (the day part of this)
  const aesForThisUnit = filterNonNullable(applicationSections);

  // NOTE need to split the applicationSection into two props
  // - the section
  // - the selected time slot / allocation (this is used for the mutation pk)
  // - might even want to split the mutation component into two separate props / children
  // NOTE we show Handled for already allocated, but not for suitable that have already been allocated.
  // TODO might be able to remove them with fulfilled?
  const selectedInterval = { day, start: startHour, end: endHour };
  const timeslots = aesForThisUnit
    .filter((ae) => ae.status !== ApplicationSectionStatusChoice.Handled)
    .filter((ae) =>
      ae.suitableTimeRanges?.some(
        (tr) => tr.dayOfTheWeek === transformWeekday(day)
      )
    )
    .filter((ae) =>
      ae.suitableTimeRanges?.some((tr) =>
        isInsideSelection(selectedInterval, tr)
      )
    );
  const resUnits = filterNonNullable(
    aesForThisUnit?.flatMap((ae) => ae.reservationUnitOptions)
  );
  const allocated = resUnits
    .filter((a) =>
      a.allocatedTimeSlots?.some(
        (ts) => ts.dayOfTheWeek === transformWeekday(day)
      )
    )
    .filter((ae) =>
      ae.allocatedTimeSlots?.some((tr) =>
        isInsideSelection(selectedInterval, tr)
      )
    );

  // check if something is already allocated and push it down to the Card components
  const hasSelection = selection != null && selection.length > 0;
  const isRoundAllocable =
    applicationRoundStatus === ApplicationRoundStatusChoice.InAllocation;

  const allocatedPks = filterNonNullable(
    allocated
      .flatMap((ruo) =>
        ruo.allocatedTimeSlots?.map(
          (ts) => ts.reservationUnitOption.applicationSection
        )
      )
      .map((as) => as?.pk)
  );

  const allocatedSections = aesForThisUnit.filter(
    (as) => as.pk != null && allocatedPks.includes(as.pk)
  );
  const doesCollideToOtherAllocations = relatedAllocations[day].some((slot) => {
    return (
      slot.day === day &&
      slot.beginTime < endHour * 60 &&
      slot.endTime > startHour * 60
    );
  });
  const canAllocateSelection =
    allocatedSections.length === 0 && !doesCollideToOtherAllocations;
  const canAllocate = hasSelection && canAllocateSelection && isRoundAllocable;

  // TODO check that the same event has not already been allocated on the same day
  // (the backend filtering didn't seem to remove invalid events)
  // but can't allocate twice on the same day
  // Could also remove them from the Calendar component
  // dunno why the backend filtering doesn't remove them
  // Requires a bit more investigation.

  // TODO empty state when no selection (current is ok placeholder), don't remove from DOM
  return (
    <Wrapper>
      <CloseBtn type="button" onClick={() => setSelection([])}>
        <IconCross />
      </CloseBtn>
      <TimeLabel>{getTimeLabel(selection ?? [], t)}</TimeLabel>
      <StyledShowAllContainer
        showAllLabel={t("Allocation.changeTime")}
        maximumNumber={0}
      >
        <TimeSelection />
      </StyledShowAllContainer>
      {/* TODO what order should these be in? */}
      {allocatedSections.map((as) => (
        <AllocatedCard
          key={as.pk}
          applicationSection={as}
          refetchApplicationEvents={refetchApplicationEvents}
          // TODO define a partial function
          allocatedTimeSlot={getAllocatedTimeSlot(as, {
            day,
            startHour,
            endHour,
          })}
        />
      ))}
      {timeslots.map((as) => (
        <AllocationCard
          key={as.pk}
          applicationSection={as}
          reservationUnitOption={as.reservationUnitOptions?.find(
            (ruo) => ruo.reservationUnit?.pk === reservationUnit?.pk
          )}
          selection={selection ?? []}
          isAllocationEnabled={canAllocate}
          refetchApplicationEvents={refetchApplicationEvents}
          // TODO define a partial function
          timeSlot={getSuitableTimeSlot(as, { day, startHour, endHour })}
        />
      ))}
      {timeslots.length + allocated.length === 0 && (
        <EmptyState>{t("Allocation.noRequestedTimes")}</EmptyState>
      )}
    </Wrapper>
  );
}
