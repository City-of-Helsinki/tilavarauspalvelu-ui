import { ApplicationEventScheduleType } from "common/types/gql-types";
import { ApplicationEventSchedulePriority } from "../../../common/types";

export type Cell = {
  hour: number;
  label: string;
  state?: ApplicationEventSchedulePriority;
  key: string;
};

const cellLabel = (row: number): string => {
  return `${row} - ${row + 1}`;
};

type ScheduleWithDay = Omit<ApplicationEventScheduleType, "day"> & {
  day: number;
};

export const applicationEventSchedulesToCells = (
  applicationEventSchedules: ApplicationEventScheduleType[]
): Cell[][] => {
  const firstSlotStart = 7;
  const lastSlotStart = 23;

  const cells = [] as Cell[][];

  for (let j = 0; j < 7; j += 1) {
    const day = [];
    for (let i = firstSlotStart; i <= lastSlotStart; i += 1) {
      day.push({
        key: `${i}-${j}`,
        hour: i,
        label: cellLabel(i),
      } as Cell);
    }
    cells.push(day);
  }

  applicationEventSchedules
    .filter((x): x is ScheduleWithDay => x.day != null)
    .forEach((applicationEventSchedule) => {
      const { day } = applicationEventSchedule;
      const hourBegin =
        Number(applicationEventSchedule.begin.substring(0, 2)) - firstSlotStart;

      const hourEnd =
        (Number(applicationEventSchedule.end.substring(0, 2)) || 24) -
        firstSlotStart;

      for (let h = hourBegin; h < hourEnd; h += 1) {
        const cell = cells[day][h];
        const convertPriority = (x?: number) => {
          if (!x) {
            return 100;
          }
          if (x > 299) {
            return 300;
          }
          if (x > 199) {
            return 200;
          }
          return 100;
        };
        cell.state = convertPriority(
          applicationEventSchedule.priority ?? undefined
        );
      }
    });

  return cells;
};
