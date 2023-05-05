import uniqBy from "lodash/uniqBy";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import { TFunction } from "i18next";
import {
  rejectApplicationEventSchedule,
  setApplicationEventScheduleResultStatus,
  setDeclinedApplicationEventReservationUnits,
} from "./api";
import {
  type AllocationResult,
  type ExtendedAllocationResult,
  type GroupedAllocationResult,
} from "./types";
import {
  convertHMSToHours,
  extendedApplicationEventStatus,
  secondsToHms,
} from "./util";

interface IReservationAllocation {
  seconds: number;
  volume: number;
}

export interface IAllocationCapacity {
  hours: number;
  volume: number;
  percentage: number;
}

const getReservationAllocations = (
  allocationResults: AllocationResult[] | ExtendedAllocationResult[]
): IReservationAllocation => {
  return uniqBy(allocationResults, (n) => n.applicationEventScheduleId)
    .filter(
      (n) =>
        n.aggregatedData.durationTotal &&
        n.aggregatedData.reservationsTotal &&
        extendedApplicationEventStatus(n) === "validated"
    )
    .reduce(
      (acc: IReservationAllocation, cur) => {
        return {
          seconds: acc.seconds + cur.aggregatedData.durationTotal,
          volume: acc.volume + cur.aggregatedData.reservationsTotal,
        };
      },
      { seconds: 0, volume: 0 }
    );
};

export const getAllocationCapacity = (
  allocationResults: AllocationResult[] | ExtendedAllocationResult[],
  totalHourCapacity = 0,
  totalReservationDuration = 0
): IAllocationCapacity | null => {
  if (!totalHourCapacity) return null;
  const reservations = getReservationAllocations(allocationResults);
  const reservedHMS = secondsToHms(reservations.seconds);
  const hours = convertHMSToHours(reservedHMS);
  return {
    hours,
    volume: reservations.volume,
    percentage: Number(
      ((hours / (totalHourCapacity - totalReservationDuration)) * 100).toFixed(
        1
      )
    ),
  };
};

interface IModifyAllocationResults {
  data: AllocationResult[] | ExtendedAllocationResult[];
  selections: number[];
  action: "ignore" | "approve" | "decline";
  notifyError: (s: string) => void;
  t: TFunction;
  callback: () => void;
}

export const modifyAllocationResults = async ({
  data,
  selections,
  action,
  notifyError,
  t,
  callback,
}: IModifyAllocationResults): Promise<void> => {
  try {
    if (action === "ignore") {
      const allocationResults = data.filter(
        (n) =>
          n.applicationEventScheduleId &&
          selections.includes(n.applicationEventScheduleId)
      );
      allocationResults.forEach((row) => {
        if (!row.allocatedReservationUnitId) return;

        const payload = [
          ...row.applicationEvent.declinedReservationUnitIds,
          row.allocatedReservationUnitId,
        ];

        setDeclinedApplicationEventReservationUnits(
          row.applicationEvent.id,
          payload
        );
      });
    } else if (action === "approve") {
      await Promise.all(
        selections.map((id) =>
          setApplicationEventScheduleResultStatus(id, true)
        )
      );
    } else if (action === "decline") {
      await Promise.all(
        selections.map((id) => rejectApplicationEventSchedule(id))
      );
    }
  } catch (error) {
    notifyError(t("errors.errorSavingRecommendation"));
  } finally {
    callback();
  }
};

export const processAllocationResult = (
  allocationResults: AllocationResult[]
): ExtendedAllocationResult[] =>
  allocationResults.map((allocationResult) => ({
    ...allocationResult,
    applicationEvent: {
      ...allocationResult.applicationEvent,
      status: extendedApplicationEventStatus(allocationResult),
    },
  }));

export const prepareAllocationResults = (
  results: AllocationResult[] | ExtendedAllocationResult[]
): GroupedAllocationResult[] => {
  const groups = groupBy(results, (n) => n.allocatedReservationUnitName);
  return Object.keys(groups).map(
    (key: string, index: number): GroupedAllocationResult => {
      const row = groups[key][0];
      return {
        id: index + 1,
        space: {
          id: row.allocatedReservationUnitId,
          name: row.allocatedReservationUnitName,
        },
        reservationUnit: {
          name: row.unitName,
        },
        data: get(groups, key),
      };
    }
  );
};
