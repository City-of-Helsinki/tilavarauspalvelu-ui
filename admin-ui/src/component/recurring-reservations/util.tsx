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
  appEventHours,
  numTurns,
  getFilteredApplicationStatus,
} from "../applications/util";

export type ApplicationView = {
  pk: number;
  eventId: number;
  key: string;
  applicant?: string;
  name: string;
  type: string;
  units: UnitType[];
  applicationCount: string;
  status?: ApplicationStatus;
  statusView: JSX.Element;
};

export type ApplicationEventView = {
  applicationId: number;
  pk: number;
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
  const { status } = app;

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
  const eventId = app.applicationEvents?.find(() => true)?.pk;

  return {
    key: `${app.pk}-${eventId || "-"} `,
    pk: app.pk ?? 0,
    eventId: eventId && !Number.isNaN(Number(eventId)) ? Number(eventId) : 0,
    applicant: applicantName(app),
    type: app.applicantType
      ? t(`Application.applicantTypes.${app.applicantType.toLowerCase()}`)
      : "",
    units,
    name,
    status: status ?? undefined,
    statusView: (
      <StyledStatusCell
        status={status ?? undefined}
        text={`ApplicationStatus.${status}`}
        type="application"
        withArrow={false}
      />
    ),
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
  const applicationStatusView =
    round.status === ApplicationRoundStatus.Allocated
      ? "approved"
      : "in_review";

  const status = getFilteredApplicationStatus(
    appEvent.application.status ?? ApplicationStatus.Draft,
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
    pk: eventId && !Number.isNaN(eventId) ? eventId : 0,
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
