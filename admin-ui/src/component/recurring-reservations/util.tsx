import React from "react";
import styled from "styled-components";
import { TFunction } from "i18next";
import { orderBy, trim, uniqBy } from "lodash";
import { parse } from "date-fns";
import {
  ApplicationRoundStatus,
  type ApplicationRoundType,
  ApplicationStatus,
  type ApplicationType,
  type UnitType,
  ApplicationEventType,
} from "common/types/gql-types";
import { formatters as getFormatters } from "common";
import StatusCell from "../StatusCell";
import { formatNumber } from "../../common/util";
import {
  applicantName,
  convertGQLStatusToRest,
  getNormalizedApplicationStatus,
  appEventHours,
  numTurns,
} from "../applications/util";
import {
  ApplicationStatus as ApplicationStatusRest,
  ApplicationRoundStatus as ApplicationRoundStatusRest,
} from "../../common/types";

export type ApplicationView = {
  id: number;
  eventId: number;
  key: string;
  applicant?: string;
  name: string;
  type: string;
  units: UnitType[];
  applicationCount: string;
  status: ApplicationStatusRest;
  statusView: JSX.Element;
  statusType: ApplicationStatusRest;
};

export type ApplicationEventView = {
  applicationId: number;
  id: number;
  applicant?: string;
  name: string;
  units: UnitType[];
  statusView: JSX.Element;
  applicationCount: string;
};

const StyledStatusCell = styled(StatusCell)`
  gap: 0 !important;
  > div {
    gap: 0 !important;
  }
`;

const formatters = getFormatters("fi");

export const appMapper = (
  round: ApplicationRoundType,
  app: ApplicationType,
  t: TFunction
): ApplicationView => {
  let applicationStatusView: ApplicationRoundStatusRest;
  switch (round.status) {
    // TODO is this correct? e.g. what is "approved"
    case ApplicationRoundStatus.Allocated:
      applicationStatusView = "approved";
      break;
    default:
      applicationStatusView = "in_review";
  }

  const units = orderBy(
    uniqBy(
      (app.applicationEvents || [])
        .flatMap((ae) => ae?.eventReservationUnits)
        .flatMap((eru) => ({
          ...eru?.reservationUnit?.unit,
          priority: eru?.priority,
        })),
      "pk"
    ),
    "priority",
    "asc"
  ) as UnitType[];
  const name = app.applicationEvents?.find(() => true)?.name || "-";
  const eventId = app.applicationEvents?.find(() => true)?.id;

  const convertedApplicationStatus = convertGQLStatusToRest(
    app.status ?? ApplicationStatus.Draft
  );
  const status = getNormalizedApplicationStatus(
    convertedApplicationStatus,
    applicationStatusView
  );

  const applicant = applicantName(app);

  return {
    key: `${app.id}-${eventId || "-"} `,
    id: app.pk ?? 0,
    eventId: eventId && !Number.isNaN(Number(eventId)) ? Number(eventId) : 0,
    applicant,
    type: app.applicantType
      ? t(`Application.applicantTypes.${app.applicantType.toLowerCase()}`)
      : "",
    units,
    name,
    status,
    statusView: (
      <StyledStatusCell
        status={status}
        text={`Application.statuses.${status}`}
        type="application"
        withArrow={false}
      />
    ),
    statusType: convertedApplicationStatus,
    applicationCount: trim(
      `${formatNumber(
        app.aggregatedData?.appliedReservationsTotal,
        ""
      )} / ${formatters.oneDecimal.format(
        Number(app.aggregatedData?.appliedMinDurationTotal) / 3600
      )} t`,
      " / "
    ),
  };
};

export const appEventMapper = (
  round: ApplicationRoundType,
  appEvent: ApplicationEventType
): ApplicationEventView => {
  let applicationStatusView: ApplicationRoundStatusRest;
  switch (round.status) {
    case ApplicationRoundStatus.Allocated:
      applicationStatusView = "approved";
      break;
    default:
      applicationStatusView = "in_review";
  }

  const convertedApplicationStatus = convertGQLStatusToRest(
    appEvent.application.status ?? ApplicationStatus.Draft
  );

  const status = getNormalizedApplicationStatus(
    convertedApplicationStatus,
    applicationStatusView
  );

  const fromAPIDate = (date: string): Date =>
    parse(date, "yyyy-MM-dd", new Date());

  const units = orderBy(
    uniqBy(
      appEvent.eventReservationUnits?.flatMap((eru) => ({
        ...eru?.reservationUnit?.unit,
        priority: eru?.priority,
      })),
      "pk"
    ),
    "priority",
    "asc"
  ) as UnitType[];
  const name = appEvent.name || "-";
  const eventId = appEvent.pk;

  const applicant = applicantName(appEvent.application);

  const turns =
    appEvent.begin && appEvent.end
      ? numTurns(
          appEvent.begin,
          appEvent.end,
          appEvent.biweekly,
          appEvent.eventsPerWeek ?? 0
        )
      : 0;

  const totalHours =
    appEvent.begin && appEvent.end
      ? appEventHours(
          fromAPIDate(appEvent.begin).toISOString(),
          fromAPIDate(appEvent.end).toISOString(),
          appEvent.biweekly,
          appEvent.eventsPerWeek ?? 0,
          appEvent.minDuration ?? 0
        )
      : 0;

  return {
    applicationId: appEvent.application.pk ?? 0,
    id: eventId && !Number.isNaN(eventId) ? eventId : 0,
    applicant,
    units,
    name,
    applicationCount: trim(
      `${formatNumber(turns, "")} / ${formatters.oneDecimal.format(
        totalHours
      )} t`,
      " / "
    ),
    statusView: (
      <StyledStatusCell
        status={status}
        text={`Application.statuses.${status}`}
        type="application"
        withArrow={false}
      />
    ),
  };
};

export const truncate = (val: string, maxLen: number): string =>
  val.length > maxLen ? `${val.substring(0, maxLen)}…` : val;
