import { isBefore } from "date-fns";
import { uniq } from "lodash";
import { i18n } from "next-i18next";
import { OpeningTimePeriod, TimeSpan } from "./types";
import { toApiDate } from "./util";

export type ActiveOpeningTime = {
  day: number;
  label: string;
  from: string;
  to: string;
};

export type OpeningHourRow = {
  label: string;
  value: string | number;
  index: number;
};

export const getActiveOpeningTimePeriod = (
  openingTimePeriods: OpeningTimePeriod[],
  date: string
): OpeningTimePeriod | undefined =>
  openingTimePeriods?.find(
    (openingTimePeriod) =>
      isBefore(new Date(openingTimePeriod.startDate), new Date(date)) &&
      isBefore(new Date(date), new Date(openingTimePeriod.endDate))
  );

export const getActiveOpeningTimes = (
  openingTimePeriods: OpeningTimePeriod[]
): ActiveOpeningTime[] => {
  const result = [] as ActiveOpeningTime[];
  const activeOpeningTimePeriod = getActiveOpeningTimePeriod(
    openingTimePeriods,
    toApiDate(new Date())
  );
  const timeSpans = activeOpeningTimePeriod?.timeSpans;
  const weekdays = uniq(
    timeSpans?.reduce((acc, timeSpan) => acc.concat(timeSpan.weekdays), [])
  ).sort();
  weekdays.forEach((weekday) => {
    const activeTimeSpans: TimeSpan[] = timeSpans?.filter((n) =>
      n.weekdays.includes(weekday)
    );
    activeTimeSpans.forEach((timeSpan) => {
      result.push({
        day: weekday,
        label: i18n.t(`common:weekDay.${weekday}`),
        from: timeSpan.startTime,
        to: timeSpan.endTime,
      });
    });
  });

  return result;
};

export const getDayOpeningTimes = (
  openingTime: { label: string; from: string; to: string },
  index: number
): OpeningHourRow => {
  const { label } = openingTime;

  const from = openingTime.from.split(":");
  const fromDate = new Date();
  fromDate.setHours(Number(from[0]));
  fromDate.setMinutes(Number(from[1]));
  const fromStr = i18n.t("common:time", { date: fromDate });

  const to = openingTime.to.split(":");
  const toDate = new Date();
  toDate.setHours(Number(to[0]));
  toDate.setMinutes(Number(to[1]));
  const toStr = i18n.t("common:time", { date: toDate });

  return { label, value: `${fromStr} - ${toStr}`, index };
};
