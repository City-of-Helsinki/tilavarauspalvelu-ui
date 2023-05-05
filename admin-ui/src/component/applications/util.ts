import { differenceInWeeks } from "date-fns";
import { sum } from "lodash";
import {
  type ApplicationType,
  ApplicationStatus,
  ApplicationRoundStatus,
} from "common/types/gql-types";
import { Application, ExtendedApplicationStatus } from "../../common/types";

export const applicantName = (app: Application | ApplicationType): string => {
  return app.applicantType === "individual" ||
    app.applicantType === "INDIVIDUAL"
    ? `${app.contactPerson?.firstName || "-"} ${
        app.contactPerson?.lastName || "-"
      }`
    : app.organisation?.name || "-";
};

export const getApplicationStatusColor = (
  status: ExtendedApplicationStatus,
  size: "s" | "l"
): string => {
  switch (status) {
    case "draft":
    case "in_review":
      return "var(--color-info)";
    case "review_done":
      return "var(--color-success)";
    case "sent":
      return "var(--color-white)";
    case "cancelled": {
      if (size === "s") {
        return "var(--color-error)";
      }
      return "var(--color-error-dark)";
    }
    default:
      return "";
  }
};

export const getFilteredApplicationStatus = (
  status: ApplicationStatus,
  view?: "approved" | "in_review" | ""
): ExtendedApplicationStatus => {
  if (view === "in_review" && status === "in_review") {
    return "review_done";
  }
  if (
    view === "approved" &&
    (status === "in_review" || status === "review_done")
  ) {
    return "approved";
  }

  return status;
};

export const getNormalizedApplicationStatus = (
  status: ApplicationStatus,
  view: ApplicationRoundStatus
): ExtendedApplicationStatus => {
  if (
    (view === "draft" || view === "in_review" || view === "allocated") &&
    status === "in_review"
  ) {
    return "review_done";
  }

  return status;
};

export const numTurns = (
  startDate: string,
  endDate: string,
  biWeekly: boolean,
  eventsPerWeek: number
): number =>
  (differenceInWeeks(new Date(endDate), new Date(startDate)) /
    (biWeekly ? 2 : 1)) *
  eventsPerWeek;

export const apiDurationToMinutes = (duration: string): number => {
  if (!duration) {
    return 0;
  }
  const parts = duration.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
};

export const appEventHours = (
  startDate: string,
  endDate: string,
  biWeekly: boolean,
  eventsPerWeek: number,
  minDuration: number
): number => {
  const turns = numTurns(startDate, endDate, biWeekly, eventsPerWeek);
  return (turns * minDuration) / 3600;
};

export const applicationHours = (
  application: Application | ApplicationType
): number =>
  sum(
    (application.applicationEvents || []).map((ae) =>
      appEventHours(
        ae?.begin as string,
        ae?.end as string,
        ae?.biweekly as boolean,
        ae?.eventsPerWeek as number,
        ae?.minDuration as number
      )
    )
  );

export const applicationTurns = (application: Application): number =>
  sum(
    (application.applicationEvents || []).map((ae) =>
      numTurns(
        ae?.begin as string,
        ae?.end as string,
        ae?.biweekly as boolean,
        ae?.eventsPerWeek as number
      )
    )
  );
