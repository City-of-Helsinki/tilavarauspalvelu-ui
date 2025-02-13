import React, { useState } from "react";
import {
  Button,
  ButtonVariant,
  IconArrowRight,
  Notification,
  NotificationSize,
} from "hds-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import styled from "styled-components";
import { useForm, useFormContext } from "react-hook-form";
import type { ApplicationEventSchedulePriority } from "common/types/common";
import {
  Priority,
  type ApplicationQuery,
  type ApplicationRoundTimeSlotNode,
} from "@gql/gql-types";
import { filterNonNullable, getLocalizationLang } from "common/src/helpers";
import type {
  ApplicationSectionFormValue,
  ApplicationEventScheduleFormType,
  ApplicationFormValues,
  SuitableTimeRangeFormValues,
} from "./Form";
import { getTranslationSafe } from "common/src/common/util";
import {
  convertWeekday,
  transformWeekday,
  type Day,
} from "common/src/conversion";
import { getReadableList } from "@/modules/util";
import { AccordionWithState as Accordion } from "@/components/Accordion";
import { TimeSelector, TimeSelectorFormValues } from "./TimeSelector";
import { errorToast, successToast } from "common/src/common/toast";
import { ButtonContainer } from "common/styles/util";

type Node = NonNullable<ApplicationQuery["application"]>;
type Props = {
  application: Node;
  onNext: (appToSave: ApplicationFormValues) => void;
};

type OpeningHourPeriod = {
  begin: string;
  end: string;
} | null;

type DailyOpeningHours = Pick<
  ApplicationRoundTimeSlotNode,
  "weekday" | "closed" | "reservableTimes"
>[];

const StyledNotification = styled(Notification)`
  margin-top: var(--spacing-m);
`;

function cellLabel(row: number): string {
  return `${row} - ${row + 1}`;
}

function getListOfApplicationEventTitles(
  applicationSections: ApplicationSectionFormValue[],
  ids: number[]
): string {
  return getReadableList(ids.map((id) => `"${applicationSections[id].name}"`));
}

function getOpeningHours(
  day: number,
  openingHours?: DailyOpeningHours
): OpeningHourPeriod[] | null {
  if (!openingHours) {
    return null;
  }
  const dayOpeningHours = openingHours.find((oh) => oh.weekday === day);
  if (!dayOpeningHours) {
    return null;
  }
  if (dayOpeningHours.closed) {
    return null;
  }
  return dayOpeningHours.reservableTimes ?? null;
}

function aesToCells(
  schedule: ApplicationEventScheduleFormType[],
  openingHours?: DailyOpeningHours
): Cell[][] {
  const firstSlotStart = 7;
  const lastSlotStart = 23;

  const cells: Cell[][] = [];

  for (let j = 0; j < 7; j += 1) {
    const day = [];
    const openingHoursForADay = getOpeningHours(j, openingHours);
    const dayOpeningHours =
      openingHoursForADay?.map((t) => {
        return {
          begin: t && +t.begin.split(":")[0],
          end: t && +t.end.split(":")[0] === 0 ? 24 : t && +t.end.split(":")[0],
        };
      }) ?? [];
    // state is 50 if the cell is outside the opening hours, 100 if it's inside
    for (let i = firstSlotStart; i <= lastSlotStart; i += 1) {
      const isAvailable = dayOpeningHours.some(
        (t) => t.begin != null && t.end != null && t?.begin <= i && t?.end > i
      );
      day.push({
        key: `${i}-${j}`,
        hour: i,
        label: cellLabel(i),
        state: isAvailable ? 100 : 50,
      });
    }
    cells.push(day);
  }

  schedule.forEach((applicationEventSchedule) => {
    const { day, priority } = applicationEventSchedule;
    if (day == null) {
      return;
    }
    const hourBegin =
      Number(applicationEventSchedule.begin.substring(0, 2)) - firstSlotStart;

    const hourEnd =
      (Number(applicationEventSchedule.end.substring(0, 2)) || 24) -
      firstSlotStart;

    for (let h = hourBegin; h < hourEnd; h += 1) {
      const cell = cells[day][h];
      cell.state = (priority ?? 100) as ApplicationEventSchedulePriority;
    }
  });

  return cells;
}

const formatNumber = (n: number): string => `0${n > 23 ? 0 : n}`.slice(-2);

type Timespan = {
  begin: number;
  end: number;
  priority: ApplicationEventSchedulePriority;
};

type Cell = {
  hour: number;
  label: string;
  state: ApplicationEventSchedulePriority;
  key: string;
};

// TODO improve the typing
type ApplicationEventScheduleType = {
  day: Day;
  begin: string;
  end: string;
  priority: number;
};

// TODO the return type is not good (it's gql type, but it doesn't really match the data)
// better to use a custom type here and convert it when sending / receiving from backend
function cellsToApplicationEventSchedules(
  cells: Cell[][]
): ApplicationEventScheduleType[] {
  const daySchedules: ApplicationEventScheduleType[] = [];
  if (cells.length > 7) {
    throw new Error("Too many days");
  }
  const range = [0, 1, 2, 3, 4, 5, 6] as const;
  for (const day of range) {
    const dayCells = cells[day];
    dayCells
      .filter((cell) => cell.state)
      .map((cell) => ({
        begin: cell.hour,
        end: cell.hour + 1,
        priority: cell.state,
      }))
      .reduce<Timespan[]>((prev, current) => {
        if (!prev.length) {
          return [current];
        }
        if (
          prev[prev.length - 1].end === current.begin &&
          prev[prev.length - 1].priority === current.priority
        ) {
          return [
            ...prev.slice(0, prev.length - 1),
            {
              begin: prev[prev.length - 1].begin,
              end: prev[prev.length - 1].end + 1,
              priority: prev[prev.length - 1].priority,
            },
          ];
        }
        return [...prev, current];
      }, [])
      .map((cell) => {
        return {
          day,
          begin: `${formatNumber(cell.begin)}:00`,
          end: `${formatNumber(cell.end)}:00`,
          priority: cell.priority,
        };
      })
      .forEach((e) => daySchedules.push(e));
  }
  return daySchedules;
}

const getLongestChunks = (selectorData: Cell[][][]): number[] =>
  selectorData.map((n) => {
    const primarySchedules = cellsToApplicationEventSchedules(
      n.map((nn) => nn.filter((nnn) => nnn.state === 300))
    );
    const secondarySchedules = cellsToApplicationEventSchedules(
      n.map((nn) => nn.filter((nnn) => nnn.state === 200))
    );

    return [...primarySchedules, ...secondarySchedules].reduce((acc, cur) => {
      const start = parseInt(cur.begin, 10);
      const end = cur.end === "00:00" ? 24 : parseInt(cur.end, 10);
      const length = end - start;
      return length > acc ? length : acc;
    }, 0);
  });

const getApplicationEventsWhichMinDurationsIsNotFulfilled = (
  applicationSections: ApplicationSectionFormValue[],
  selectorData: Cell[][][]
): number[] => {
  const selectedHours = getLongestChunks(selectorData);
  return filterNonNullable(
    applicationSections.map((ae, index) => {
      const minDuration = ae.minDuration ?? 0;
      return selectedHours[index] < minDuration / 3600 ? index : null;
    })
  );
};

function Page2({ application, onNext }: Props): JSX.Element {
  const { t, i18n } = useTranslation();
  const initialReservationUnitPks =
    application?.applicationSections?.map(
      (n) => n.reservationUnitOptions[0].reservationUnit.pk ?? 0
    ) ?? [];

  const timeSelectorForm = useForm<TimeSelectorFormValues>({
    defaultValues: {
      reservationUnitPks: initialReservationUnitPks,
      priority: 300,
    },
  });

  const [minDurationMsg, setMinDurationMsg] = useState(true);
  const router = useRouter();
  const { getValues, setValue, watch, handleSubmit } =
    useFormContext<ApplicationFormValues>();

  const allOpeningHours = filterNonNullable(
    application.applicationSections
  ).map((as) =>
    as.reservationUnitOptions.map((ruo) => ({
      pk: ruo.reservationUnit.pk ?? 0,
      openingHours: ruo.reservationUnit.applicationRoundTimeSlots,
    }))
  );

  const { watch: timeSelectorWatch } = timeSelectorForm;
  const reservationUnitPks = timeSelectorWatch("reservationUnitPks");
  const reservationUnitOpeningHours = filterNonNullable(
    application?.applicationSections
  ).map(
    (_as, index) =>
      allOpeningHours[index].find((n) => n.pk === reservationUnitPks[index])
        ?.openingHours
  );

  const applicationSections = filterNonNullable(watch("applicationSections"));

  // TODO type properly the input and move to free function
  const convertToSchedule = (
    b: (typeof applicationSections)[0]
  ): ApplicationEventScheduleFormType[] => {
    return (
      b.suitableTimeRanges?.map((range) => {
        return {
          day: range ? convertWeekday(range.dayOfTheWeek) : 0,
          begin: range?.beginTime ?? "",
          end: range?.endTime ?? "",
          priority: range?.priority === Priority.Primary ? 300 : 200,
        };
      }) ?? []
    );
  };
  const selectorData = applicationSections.map((ae, index) =>
    aesToCells(convertToSchedule(ae), reservationUnitOpeningHours[index])
  );
  const setSelectorData = (selected: typeof selectorData) => {
    // So this returns them as:
    // applicationSections (N)
    // - ApplicationEventSchedule[][]: Array(7) (i is the day)
    // - ApplicationEventSchedule[]: Array(M) (j is the continuous block)
    // priority: 200 | 300 (200 is secondary, 300 is primary)
    // priority: 100 (? assuming it's not selected)
    const selectedAppEvents = selected
      .map((cell) => cellsToApplicationEventSchedules(cell))
      .map((aes) =>
        aes.filter((ae) => ae.priority === 300 || ae.priority === 200)
      );
    // this seems to work except
    // TODO: day is incorrect (empty days at the start are missing, and 200 / 300 priority on the same day gets split into two days)
    // TODO refactor the Cell -> ApplicationEventSchedule conversion to use FormTypes
    for (const i of selectedAppEvents.keys()) {
      const appEventSchedule = selectedAppEvents[i];
      const val: SuitableTimeRangeFormValues[] = appEventSchedule.map(
        (appEvent) => {
          const { day } = appEvent;
          // debug check
          if (day == null || day < 0 || day > 6) {
            throw new Error("Day is out of range");
          }
          return {
            beginTime: appEvent.begin,
            endTime: appEvent.end,
            // The default will never happen (it's already filtered)
            // TODO type this better
            priority:
              appEvent.priority === 300 ? Priority.Primary : Priority.Secondary,
            dayOfTheWeek: transformWeekday(day),
          };
        }
      );
      setValue(`applicationSections.${i}.suitableTimeRanges`, val);
    }
  };

  const updateCells = (index: number, newCells: Cell[][]) => {
    const updated = [...selectorData];
    updated[index] = newCells;
    setSelectorData(updated);
  };

  // TODO should remove the cell not set a priority
  const resetCells = (index: number) => {
    const updated = [...selectorData];
    updated[index] = selectorData[index].map((n) =>
      n.map((nn) => ({ ...nn, state: 100 }))
    );
    setSelectorData(updated);
  };

  const copyCells = (index: number) => {
    const updated = [...selectorData];
    const srcCells = updated[index];
    srcCells.forEach((day, i) => {
      day.forEach((cell, j) => {
        const { state } = cell;
        for (let k = 0; k < updated.length; k += 1) {
          if (k !== index) {
            updated[k][i][j].state = state;
          }
        }
      });
    });
    setSelectorData(updated);
    successToast({
      label: t("application:Page2.notification.copyCells"),
      text: t("application:Page2.notification.copyCells"),
      duration: 3,
      dataTestId: "application__page2--notification-success",
    });
  };

  const onSubmit = (data: ApplicationFormValues) => {
    // TODO test the checking of that there is at least one primary or secondary
    // TODO this should be a form refinement, but we need separate refinements
    // for pages or a Page specific checker
    const selectedAppEvents = selectorData
      .map((cell) => cellsToApplicationEventSchedules(cell))
      .map((aes) =>
        aes.filter((ae) => ae.priority === 300 || ae.priority === 200)
      )
      .flat();
    if (selectedAppEvents.length === 0) {
      errorToast({
        label: t("application:error.missingSchedule"),
        text: t("application:error.missingSchedule"),
        dataTestId: "application__page2--notification-error",
      });
      return;
    }
    onNext(data);
  };

  const applicationEventsForWhichMinDurationIsNotFulfilled: number[] =
    getApplicationEventsWhichMinDurationsIsNotFulfilled(
      applicationSections,
      selectorData
    );

  const shouldShowMinDurationMessage =
    minDurationMsg &&
    applicationEventsForWhichMinDurationIsNotFulfilled.length > 0;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      {applicationSections.map((event, index) => {
        // TODO there is something funny with this one on the first render
        // (it's undefined and not Array as expected).
        const schedules =
          getValues(`applicationSections.${index}.suitableTimeRanges`) ?? [];
        const summaryDataPrimary = schedules
          .filter((n) => n.priority === Priority.Primary)
          .map((a) => ({
            begin: a.beginTime,
            end: a.endTime,
            priority: 300 as const,
            day: convertWeekday(a.dayOfTheWeek),
          }));
        const summaryDataSecondary = schedules
          .filter((n) => n.priority === Priority.Secondary)
          .map((a) => ({
            begin: a.beginTime,
            end: a.endTime,
            priority: 200 as const,
            day: convertWeekday(a.dayOfTheWeek),
          }));
        const reservationUnitOptions = filterNonNullable(
          application?.applicationSections?.[index].reservationUnitOptions
        )
          .map((n) => n.reservationUnit)
          .map((n) => ({
            value: n?.pk ?? 0,
            label: getTranslationSafe(
              n,
              "name",
              getLocalizationLang(i18n.language)
            ),
          }));

        return (
          <Accordion
            open={index === 0}
            key={event.pk ?? "NEW"}
            id={`timeSelector-${index}`}
            heading={event.name ?? ""}
            theme="thin"
          >
            <StyledNotification
              label={t("application:Page2.info")}
              size={NotificationSize.Small}
              type="info"
            >
              {t("application:Page2.info")}
            </StyledNotification>
            <TimeSelector
              index={index}
              cells={selectorData[index]}
              updateCells={updateCells}
              copyCells={applicationSections.length > 1 ? copyCells : null}
              resetCells={() => resetCells(index)}
              summaryData={[summaryDataPrimary, summaryDataSecondary]}
              reservationUnitOptions={reservationUnitOptions}
              form={timeSelectorForm}
            />
          </Accordion>
        );
      })}
      {shouldShowMinDurationMessage && (
        <Notification
          type="alert"
          label={t("application:Page2.notification.minDuration.title")}
          dismissible
          onClose={() => setMinDurationMsg(false)}
          closeButtonLabelText={t("common:close")}
          data-testid="application__page2--notification-min-duration"
          style={{ marginBottom: "var(--spacing-m)" }}
        >
          {applicationSections?.length === 1
            ? t("application:Page2.notification.minDuration.bodySingle")
            : t("application:Page2.notification.minDuration.body", {
                title: getListOfApplicationEventTitles(
                  applicationSections,
                  applicationEventsForWhichMinDurationIsNotFulfilled
                ),
                count:
                  applicationEventsForWhichMinDurationIsNotFulfilled.length,
              })}
        </Notification>
      )}
      <ButtonContainer>
        <Button
          variant={ButtonVariant.Secondary}
          onClick={() => router.push(`${application.pk}/page1`)}
        >
          {t("common:prev")}
        </Button>
        <Button
          id="button__application--next"
          iconEnd={<IconArrowRight aria-hidden="true" />}
          type="submit"
        >
          {t("common:next")}
        </Button>
      </ButtonContainer>
    </form>
  );
}

export default Page2;
