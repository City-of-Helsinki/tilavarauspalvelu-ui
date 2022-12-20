import { camelCase, get } from "lodash";
import { reservationApplicationFields } from "../../../admin-ui/src/component/my-units/create-reservation/types";
import { ReservationsReservationReserveeTypeChoices } from "../../types/gql-types";

export const getReservationApplicationFields = (
  supportedFields: string[],
  reserveeType: ReservationsReservationReserveeTypeChoices | "common",
  camelCaseOutput = false
): string[] => {
  if (!supportedFields || supportedFields?.length === 0 || !reserveeType)
    return [];

  const fields = get(
    reservationApplicationFields,
    reserveeType.toLocaleLowerCase()
  ).filter((field: string) => supportedFields.includes(field));

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].includes("billing_")) {
      fields.splice(i, 0, "show_billing_address");
      break;
    }
  }

  return camelCaseOutput ? fields.map(camelCase) : fields;
};
