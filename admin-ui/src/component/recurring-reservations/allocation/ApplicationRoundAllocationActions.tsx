import { IconCross, Select } from "hds-react";
import React, { useCallback, useMemo } from "react";
import { TFunction, useTranslation } from "react-i18next";
import styled from "styled-components";
import { ALLOCATION_CALENDAR_TIMES } from "../../../common/const";
import {
  ApplicationEventType,
  ApplicationType,
} from "../../../common/gql-types";
import { OptionType } from "../../../common/types";
import Accordion from "../../Accordion";
import {
  getSlotApplicationEvents,
  getTimeSlotOptions,
} from "../modules/applicationRoundAllocation";
import ApplicationEventScheduleCard from "./ApplicationEventScheduleCard";
import { parseDuration } from "../../../common/util";
import { FontBold, FontMedium } from "../../../styles/typography";

type Props = {
  applications: ApplicationType[];
  applicationEvents: ApplicationEventType[];
  paintedApplicationEvents: ApplicationEventType[];
  paintApplicationEvents: (val: ApplicationEventType[]) => void;
  selection: string[] | null;
  setSelection: (val: string[]) => void;
  isSelecting: boolean;
};

const Wrapper = styled.div`
  position: relative;
  border: 1px solid var(--color-black-30);
  margin-top: var(--spacing-layout-l);
  padding: var(--spacing-s);
  height: fit-content;
`;

const CloseBtn = styled.button`
  background-color: transparent;
  border: none;
  position: absolute;
  top: var(--spacing-s);
  right: var(--spacing-2-xs);
  cursor: pointer;
`;

const TimeAccordion = styled(Accordion)`
  > div:first-of-type {
    justify-content: flex-start;
    border: 0;
    margin-bottom: 0;

    h2 {
      ${FontMedium};
      font-size: var(--fontsize-body-m);
      display: inline-block;
      color: var(--color-bus);
      padding-left: 4px;
    }

    button {
      color: var(--color-bus);
    }
  }

  > div:nth-of-type(2) {
    padding: 0;
  }

  margin-top: var(--spacing-xs);
`;

const TimeSelectWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: var(--spacing-s);

  > * {
    width: calc(50% - var(--spacing-xs));
  }

  label {
    ${FontMedium};
    margin-bottom: 0;
  }
`;

const TimeLabel = styled.div`
  background-color: var(--color-black-5);
  padding: var(--spacing-3-xs) var(--spacing-xs);
  ${FontMedium};
  font-size: var(--fontsize-body-m);
  display: inline-block;
`;

const Heading = styled.div`
  ${FontBold};
  font-size: var(--fontsize-body-m);
  margin: var(--spacing-xs) 0 var(--spacing-s);
  padding-bottom: 0;
`;

const StyledAccordion = styled(Accordion)`
  --border-color: transparent;
  --header-font-size: var(--fontsize-body-m);

  > div {
    &:nth-of-type(2) {
      padding: 0;
    }
    margin: 0;
  }
`;

const EmptyState = styled.div`
  font-size: var(--fontsize-body-l);
  margin-bottom: var(--spacing-m);
`;

const getTimeLabel = (selection: string[], t: TFunction): string => {
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

const ApplicationRoundAllocationActions = ({
  applications,
  applicationEvents,
  paintedApplicationEvents,
  paintApplicationEvents,
  selection,
  setSelection,
  isSelecting,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();

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

  const timeSlotStartOptions = useMemo(() => getOptions("start"), [getOptions]);
  const timeSlotEndOptions = useMemo(() => getOptions("end"), [getOptions]);

  const selectionDuration = useMemo(
    () => selection && parseDuration(selection.length * 30 * 60),
    [selection]
  );

  // eslint-disable-next-line consistent-return
  const setSelectedTime = (startValue?: number, endValue?: number): void => {
    if (!selection) return undefined;
    const start = startValue || selection[0];
    const end = endValue || selection[selection.length - 1];
    const [, startHours, startMinutes] = start.toString().split("-");
    const [, endHours, endMinutes] = end.toString().split("-");
    const timeSlots = getTimeSlotOptions(
      selection[0].split("-")[0],
      Number(startHours),
      Number(startMinutes),
      Number(endHours)
    ).map((n) => n.value as string);

    if (endValue && endMinutes === "00") timeSlots.pop();
    setSelection(timeSlots);
    paintApplicationEvents(
      getSlotApplicationEvents(timeSlots, applicationEvents)
    );
  };

  const primaryApplicationEvents = useMemo(
    () =>
      paintedApplicationEvents.filter((applicationEvent) =>
        applicationEvent.applicationEventSchedules?.some(
          (applicationEventSchedule) =>
            applicationEventSchedule?.priority === 300
        )
      ),
    [paintedApplicationEvents]
  );

  const otherApplicationEvents = useMemo(
    () =>
      paintedApplicationEvents.filter((applicationEvent) =>
        applicationEvent.applicationEventSchedules?.some(
          (applicationEventSchedule) =>
            applicationEventSchedule?.priority === 200
        )
      ),
    [paintedApplicationEvents]
  );

  if (isSelecting) return null;

  return selection && selection.length > 0 ? (
    <Wrapper>
      <CloseBtn type="button" onClick={() => setSelection([])}>
        <IconCross />
      </CloseBtn>
      <TimeLabel>{getTimeLabel(selection, t)}</TimeLabel>
      <TimeAccordion heading="Muuta aikaa">
        <TimeSelectWrapper>
          <Select
            label="Aloitusaika"
            options={timeSlotStartOptions}
            value={timeSlotStartOptions.find((n) => n.value === selection[0])}
            onChange={(val: OptionType) => {
              const [startHours, startMinutes] = val.label
                .split(":")
                .map(Number);
              const startTime = new Date().setHours(startHours, startMinutes);
              const endOption = timeSlotEndOptions.find(
                (n) => n.value === selection[selection.length - 1]
              ) as OptionType;
              const [endHours, endMinutes] = endOption?.label
                ?.split(":")
                .map(Number) as number[];
              const endTime = new Date().setHours(endHours, endMinutes);

              const startIndex = timeSlotStartOptions.indexOf(val);
              const endValue =
                startTime >= endTime
                  ? (timeSlotEndOptions[startIndex + 1].value as number)
                  : undefined;
              setSelectedTime(val.value as number, endValue);
            }}
          />
          <Select
            label="Päättymisaika"
            options={timeSlotEndOptions}
            value={timeSlotEndOptions.find(
              (n) => n.value === selection[selection.length - 1]
            )}
            onChange={(val: OptionType) =>
              setSelectedTime(undefined, val.value as number)
            }
            isOptionDisabled={(option) => {
              const [startHours, startMinutes] = timeSlotStartOptions
                .find((n) => n.value === selection[0])
                ?.label?.split(":")
                .map(Number) as number[];
              const startTime = new Date().setHours(startHours, startMinutes);
              const [endHours, endMinutes] = option.label
                .split(":")
                .map(Number);
              const endTime = new Date().setHours(endHours, endMinutes);

              return endTime <= startTime && endHours !== 0;
            }}
          />
        </TimeSelectWrapper>
      </TimeAccordion>
      {(primaryApplicationEvents?.length > 0 ||
        otherApplicationEvents?.length > 0) && (
        <>
          <Heading>Ensisijaiset</Heading>
          {primaryApplicationEvents?.length > 0 ? (
            primaryApplicationEvents?.map((applicationEvent) => (
              <ApplicationEventScheduleCard
                key={applicationEvent.pk}
                applications={applications}
                applicationEvent={applicationEvent}
                selectionDuration={selectionDuration}
              />
            ))
          ) : (
            <EmptyState>Ei ensisijaisia aikatoiveita.</EmptyState>
          )}
        </>
      )}
      {otherApplicationEvents?.length > 0 && (
        <StyledAccordion
          heading="Muut"
          defaultOpen={primaryApplicationEvents?.length === 0}
          key={selection.join("-")}
        >
          {otherApplicationEvents.map((applicationEvent) => (
            <ApplicationEventScheduleCard
              key={applicationEvent.pk}
              applications={applications}
              applicationEvent={applicationEvent}
              selectionDuration={selectionDuration}
            />
          ))}
        </StyledAccordion>
      )}
      {primaryApplicationEvents?.length === 0 &&
        otherApplicationEvents?.length === 0 && (
          <EmptyState>Ei aikatoiveita.</EmptyState>
        )}
    </Wrapper>
  ) : null;
};

export default ApplicationRoundAllocationActions;
