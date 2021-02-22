import { format, parseISO } from "date-fns";
import camelCase from "lodash/camelCase";
import {
  Application as ApplicationType,
  ApplicationEventSchedule,
  ApplicationStatus,
} from "./types";

export const formatDate = (date: string | null): string | null => {
  return date ? format(parseISO(date), "d.M.yyyy") : null;
};

export const formatNumber = (
  input?: number | null,
  suffix?: string
): string => {
  if (!input) return "";

  const number = new Intl.NumberFormat("fi").format(input);

  return `${number}${suffix}`;
};

interface IFormatDurationOutput {
  hours: number;
  minutes: number;
}

export const formatDuration = (time: string): IFormatDurationOutput => {
  const [hours, minutes] = time.split(":");
  return {
    hours: Number(hours),
    minutes: Number(minutes),
  };
};

export const processApplication = (
  application: ApplicationType
): ApplicationType => {
  const processedData = application.aggregatedData.reduce(
    (acc, cur) => ({
      ...acc,
      [camelCase(String(cur.name))]: cur.value,
    }),
    {}
  );

  return {
    ...application,
    processedData,
  };
};

export const processApplications = (
  applications: ApplicationType[]
): ApplicationType[] => {
  return applications.map((application) => {
    return processApplication(application);
  });
};

export const getNormalizedStatus = (
  status: ApplicationStatus,
  view: number
): ApplicationStatus => {
  let normalizedStatus: ApplicationStatus = status;
  if (view === 1) {
    if (status === "in_review") {
      normalizedStatus = "review_done";
    }
  }

  return normalizedStatus;
};

export const parseApplicationEventSchedules = (
  applicationEventSchedules: ApplicationEventSchedule[],
  index: number
): string => {
  return (
    applicationEventSchedules
      .filter((s) => s.day === index)
      .reduce((acc: string, cur: ApplicationEventSchedule) => {
        let begin = cur.begin.substring(0, 5);
        const end = cur.end.substring(0, 5);
        let prev = acc;
        let rangeChar = " - ";
        let divider = prev.length ? ", " : "";
        if (acc.endsWith(begin)) {
          begin = "";
          prev = `${prev.slice(0, -5)}`;
          rangeChar = "";
          divider = "";
        }
        return `${prev}${divider}${begin}${rangeChar}${end}`;
      }, "") || "-"
  );
};
