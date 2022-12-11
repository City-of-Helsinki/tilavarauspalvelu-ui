import { OptionType } from "common/types/common";

export enum ReservationType {
  STAFF = "STAFF",
  NORMAL = "NORMAL",
  BLOCKED = "BLOCKED",
}

export type ReservationForm = {
  date: string;
  startTime: string;
  endTime?: string;
  workingMemo?: string;
  type?: ReservationType;
  bufferTimeAfter: boolean;
  bufferTimeBefore: boolean;
  purpose?: OptionType;
  ageGroup?: OptionType;
  numPersons?: number;
  description?: string;
  applyingForFreeOfCharge?: boolean;
};
