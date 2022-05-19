import React from "react";
import styled from "styled-components";
import { orderBy, trim, uniqBy } from "lodash";
import { TFunction } from "react-i18next";
import {
  ApplicationRound as ApplicationRoundType,
  ApplicationRoundStatus,
} from "../../common/types";

import {
  applicantName,
  applicationHours,
  applicationTurns,
  getNormalizedApplicationStatus,
} from "../applications/util";
import StatusCell from "../StatusCell";
import { formatNumber } from "../../common/util";
import {
  ApplicationType,
  ApplicationStatus,
  UnitType,
} from "../../common/gql-types";

export type ApplicationView = {
  id: number;
  eventId: number;
  key: string;
  applicant?: string;
  applicantSort: string;
  name: string;
  nameSort: string;
  type: string;
  units: UnitType[];
  unitsSort: string;
  applicationCount: string;
  applicationCountSort: number;
  status: ApplicationStatus;
  statusView: JSX.Element;
  statusType: ApplicationStatus;
};

export const appMapper = (
  round: ApplicationRoundType,
  app: ApplicationType,
  t: TFunction
): ApplicationView => {
  let applicationStatusView: ApplicationRoundStatus;
  switch (round.status) {
    case "approved":
      applicationStatusView = "approved";
      break;
    default:
      applicationStatusView = "in_review";
  }

  const units = orderBy(
    uniqBy(
      (app.applicationEvents || [])
        .flatMap((ae) => ae.eventReservationUnits)
        .flatMap((eru) => ({
          ...eru?.reservationUnitDetails?.unit,
          priority: eru?.priority as number,
        })),
      "id"
    ),
    "priority",
    "asc"
  ) as UnitType[];

  const name = app.applicationEvents?.find(() => true)?.name || "-";
  const eventId = app.applicationEvents?.find(() => true)
    ?.id as unknown as number;

  const StyledStatusCell = styled(StatusCell)`
    gap: 0 !important;
    > div {
      gap: 0 !important;
    }
  `;

  const status = getNormalizedApplicationStatus(
    app.status as ApplicationStatus,
    applicationStatusView
  );

  const applicant = applicantName(app);

  return {
    key: `${app.id}-${eventId || "-"} `,
    id: app.pk as number,
    eventId,
    applicant,
    applicantSort: applicant.toLowerCase(),
    type: app.applicantType
      ? t(`Application.applicantTypes.${app.applicantType}`)
      : "",
    units,
    unitsSort: units.find(() => true)?.nameFi || "",
    name,
    nameSort: name.toLowerCase(),
    status: status as ApplicationStatus,
    statusView: (
      <StyledStatusCell
        status={status}
        text={`Application.statuses.${status}`}
        type="application"
        withArrow={false}
      />
    ),
    statusType: app.status as ApplicationStatus,
    applicationCount: trim(
      `${formatNumber(
        applicationTurns(app),
        t("common.volumeUnit")
      )} / ${applicationHours(app)} t`,
      " / "
    ),
    applicationCountSort: applicationTurns(app) || 0,
  };
};

export const truncate = (val: string, maxLen: number): string =>
  val.length > maxLen ? `${val.substring(0, maxLen)}…` : val;
