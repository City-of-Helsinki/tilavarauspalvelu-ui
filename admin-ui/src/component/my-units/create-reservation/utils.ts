import { get, pick, zipObject } from "lodash";
import {
  type ReservationFormType,
  type RecurringReservationForm,
} from "app/schemas";

export function flattenMetadata(
  values: ReservationFormType | RecurringReservationForm,
  metadataSetFields: string[]
) {
  const metadataSetValues = pick(values, metadataSetFields);

  const renamePkFields = ["ageGroup", "homeCity", "purpose"];

  return zipObject(
    Object.keys(metadataSetValues).map((k) =>
      renamePkFields.includes(k) ? `${k}Pk` : k
    ),
    Object.values(metadataSetValues).map((v) => get(v, "value") || v)
  );
}
