import {
  ApplicantTypeChoice,
  ApplicationStatusChoice,
} from "common/types/gql-types";
import { VALID_ALLOCATION_APPLICATION_STATUSES } from "@/common/const";

export function transformApplicationStatuses(
  filters: string[]
): ApplicationStatusChoice[] {
  if (filters.length === 0) {
    return VALID_ALLOCATION_APPLICATION_STATUSES;
  }
  return filters
    .map((filter) => {
      switch (filter) {
        case ApplicationStatusChoice.Received:
          return ApplicationStatusChoice.Received;
        case ApplicationStatusChoice.Handled:
          return ApplicationStatusChoice.Handled;
        case ApplicationStatusChoice.ResultsSent:
          return ApplicationStatusChoice.ResultsSent;
        case ApplicationStatusChoice.InAllocation:
          return ApplicationStatusChoice.InAllocation;
        default:
          undefined;
      }
    })
    .filter((f) => f != null) as ApplicationStatusChoice[];
}

export function transformApplicantType(
  filters: string[]
): ApplicantTypeChoice[] {
  return filters
    .map((filter) => {
      switch (filter) {
        case ApplicantTypeChoice.Individual:
          return ApplicantTypeChoice.Individual;
        case ApplicantTypeChoice.Company:
          return ApplicantTypeChoice.Association;
        case ApplicantTypeChoice.Community:
          return ApplicantTypeChoice.Community;
        default:
          undefined;
      }
    })
    .filter((f) => f != null) as ApplicantTypeChoice[];
}