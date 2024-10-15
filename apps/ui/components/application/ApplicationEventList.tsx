import React from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "next-i18next";
import {
  type AgeGroupNode,
  type ApplicationQuery,
  type Maybe,
  type SuitableTimeRangeNode,
  Priority,
  ApplicationSectionStatusChoice,
} from "@gql/gql-types";
import { getTranslation } from "common/src/common/util";
import { convertWeekday } from "common/src/conversion";
import {
  ApplicationInfoContainer,
  ApplicationSection,
  ApplicationSectionHeader,
  InfoItemContainer,
  InfoItem,
  ScheduleDay,
} from "./styled";
import { ApplicationEventScheduleFormType } from "@/components/application/Form";
import { WEEKDAYS } from "common/src/const";
import { filterNonNullable, fromMondayFirstUnsafe } from "common/src/helpers";
import StatusLabel from "common/src/components/StatusLabel";
import type { StatusLabelType } from "common/src/tags";
import {
  IconCheck,
  IconCross,
  IconQuestionCircleFill,
  Tooltip,
} from "hds-react";
import { apiDateToUIDate } from "@/modules/util";

const filterPrimary = (n: { priority: Priority }) =>
  n.priority === Priority.Primary;
const filterSecondary = (n: { priority: Priority }) =>
  n.priority === Priority.Secondary;

const convertApplicationSchedule = (
  aes: Pick<
    SuitableTimeRangeNode,
    "beginTime" | "endTime" | "dayOfTheWeek" | "priority"
  >
) => ({
  begin: aes.beginTime,
  end: aes.endTime,
  day: convertWeekday(aes.dayOfTheWeek),
  // TODO conversion
  priority: aes.priority === Priority.Primary ? 300 : 200,
});

const formatDurationSeconds = (seconds: number, t: TFunction): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);

  if (hours === 0) {
    return t("common:abbreviations:minute", { count: minutes });
  }
  if (minutes === 0) {
    return t("common:abbreviations:hour", { count: hours });
  }
  return `${t("common:abbreviations:hour", { count: hours })} ${t(
    "common:abbreviations:minute",
    { count: minutes }
  )}`;
};

const getDuration = (begin: number, end: number, t: TFunction): string => {
  const beginHours = formatDurationSeconds(begin, t);
  const endHours = formatDurationSeconds(end, t);
  return `${beginHours} - ${endHours}`;
};

const ageGroupToString = (ag: Maybe<AgeGroupNode> | undefined): string => {
  if (!ag) {
    return "";
  }
  return `${ag.minimum} - ${ag.maximum}`;
};

const getLabelProps = (
  status: ApplicationSectionStatusChoice | undefined | null
): { type: StatusLabelType; icon: JSX.Element } => {
  switch (status) {
    case ApplicationSectionStatusChoice.Handled:
      return { type: "success", icon: <IconCheck /> };
    case ApplicationSectionStatusChoice.Rejected:
      return { type: "error", icon: <IconCross /> };
    default:
      return { type: "info", icon: <IconQuestionCircleFill /> };
  }
};

// NOTE: used by Preview and View
// No form context unlike the edit pages, use application query result
type Node = NonNullable<ApplicationQuery["application"]>;
export function ApplicationEventList({
  application,
}: {
  application: Node;
}): JSX.Element {
  const { t } = useTranslation();

  const aes = filterNonNullable(application.applicationSections);

  const sections = aes.map((applicationEvent, i) => {
    const primaryTimes =
      applicationEvent.suitableTimeRanges
        ?.filter(filterPrimary)
        .map(convertApplicationSchedule) ?? [];
    const secondaryTimes =
      applicationEvent.suitableTimeRanges
        ?.filter(filterSecondary)
        .map(convertApplicationSchedule) ?? [];
    const reservationUnits =
      applicationEvent.reservationUnitOptions?.map((eru, index) => ({
        pk: eru.reservationUnit?.pk ?? 0,
        priority: index,
        nameFi: eru.reservationUnit?.nameFi ?? undefined,
        nameSv: eru.reservationUnit?.nameSv ?? undefined,
        nameEn: eru.reservationUnit?.nameEn ?? undefined,
      })) ?? [];
    const { type, icon } = getLabelProps(applicationEvent.status);
    return (
      <ApplicationSection key={applicationEvent.pk}>
        <ApplicationSectionHeader>
          {applicationEvent.name}
          {/* Show status label only for rejected and handled applicationEvents */}
          {applicationEvent.status ===
            ApplicationSectionStatusChoice.Rejected ||
            (applicationEvent.status ===
              ApplicationSectionStatusChoice.Handled && (
              <StatusLabel
                type={type}
                icon={icon}
                testId="application-section__status"
              >
                {t(
                  `application:preview.applicationEvent.status.${applicationEvent.status}`
                )}
              </StatusLabel>
            ))}
        </ApplicationSectionHeader>
        <ApplicationInfoContainer>
          <InfoItemContainer>
            <InfoItem>
              <h4 className="info-label">
                {t("application:preview.applicationEvent.applicationInfo")}
              </h4>
              <ul>
                <InfoListItem
                  label={t("application:preview.applicationEvent.numPersons")}
                  value={`${applicationEvent.numPersons} ${t("common:peopleSuffixShort")}`}
                />
                <InfoListItem
                  label={t("application:preview.applicationEvent.ageGroup")}
                  value={`${ageGroupToString(applicationEvent.ageGroup)} ${t("common:yearSuffixShort")}`}
                />
                <InfoListItem
                  label={t("application:preview.applicationEvent.duration")}
                  value={getDuration(
                    applicationEvent.reservationMinDuration ?? 0,
                    applicationEvent.reservationMaxDuration ?? 0,
                    t
                  )}
                />
                <InfoListItem
                  label={t(
                    "application:preview.applicationEvent.eventsPerWeek"
                  )}
                  value={`${applicationEvent.appliedReservationsPerWeek} ${t("common:amountSuffixShort")}`}
                />
                <InfoListItem
                  label={t("application:preview.applicationEvent.period")}
                  value={`${apiDateToUIDate(applicationEvent.reservationsBeginDate)} - ${apiDateToUIDate(applicationEvent.reservationsEndDate)}`}
                />
                <InfoListItem
                  label={t("application:preview.applicationEvent.purpose")}
                  value={getTranslation(applicationEvent.purpose ?? {}, "name")}
                />
              </ul>
            </InfoItem>
          </InfoItemContainer>
          <InfoItemContainer>
            <InfoItem>
              <h4 className="info-label">
                {t("application:preview.applicationEvent.appliedSpaces")}
              </h4>
              <ol>
                {reservationUnits?.map((ru) => (
                  <li key={ru?.pk}>
                    {getTranslation(ru ?? {}, "name").trim()}
                  </li>
                ))}
              </ol>
            </InfoItem>
          </InfoItemContainer>
          <InfoItemContainer>
            <InfoItem data-testid={`time-selector__preview-${i}`}>
              <h4 className="info-label">
                <span>
                  {t("application:preview.applicationEvent.schedules")}
                </span>
                <Tooltip placement="top">
                  {t("application:preview.applicationEvent.scheduleTooltip")}
                </Tooltip>
              </h4>
              <div>
                <Weekdays primary={primaryTimes} secondary={secondaryTimes} />
              </div>
            </InfoItem>
          </InfoItemContainer>
        </ApplicationInfoContainer>
      </ApplicationSection>
    );
  });

  // we need to wrap the return value in a fragment to avoid a React warning, since we are essentially returning an array of elements
  return <>{sections}</>;
}

const InfoListItem = ({ label, value }: { label: string; value: string }) => (
  <li>
    {`${label}: `}
    <span className="value">{value}</span>
  </li>
);

function Weekdays({
  primary,
  secondary,
}: {
  primary: ApplicationEventScheduleFormType[];
  secondary: ApplicationEventScheduleFormType[];
}) {
  const { t } = useTranslation();
  function getDayTimes(
    schedule: ApplicationEventScheduleFormType[],
    day: number
  ) {
    return schedule
      .filter((s) => s.day === day)
      .map(
        (cur) =>
          `${Number(cur.begin.substring(0, 2))}-${Number(
            cur.end.startsWith("00") ? 24 : cur.end.substring(0, 2)
          )}`
      )
      .join(", ");
  }
  return (
    <>
      {WEEKDAYS.map((day) => {
        return (
          <ScheduleDay key={day}>
            <span>{t(`common:weekDay.${fromMondayFirstUnsafe(day)}`)}</span>
            <span>{getDayTimes(primary, day) || "-"}</span>
            <span>
              {getDayTimes(secondary, day)
                ? `(${getDayTimes(secondary, day)})`
                : "-"}
            </span>
          </ScheduleDay>
        );
      })}
    </>
  );
}
