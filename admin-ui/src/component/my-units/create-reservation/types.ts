import { Reservation } from "common/src/reservation-form/types";

export enum ReservationType {
  STAFF = "STAFF",
  NORMAL = "NORMAL",
  BLOCKED = "BLOCKED",
}

export type ReservationFormType = Reservation & {
  date: string;
  startTime: string;
  endTime?: string;
  workingMemo?: string;
  type?: ReservationType;
  bufferTimeAfter: boolean;
  bufferTimeBefore: boolean;
};

export type ReserveeType = "individual" | "nonprofit" | "business";

export const reservationApplicationFields = {
  individual: [
    "reservee_first_name",
    "reservee_last_name",
    "reservee_address_street",
    "reservee_address_zip",
    "reservee_address_city",
    "reservee_email",
    "reservee_phone",
    "billing_first_name",
    "billing_last_name",
    "billing_phone",
    "billing_email",
    "billing_address_street",
    "billing_address_zip",
    "billing_address_city",
  ],
  nonprofit: [
    "reservee_organisation_name",
    "home_city",
    "reservee_is_unregistered_association",
    "reservee_id",
    "reservee_first_name",
    "reservee_last_name",
    "reservee_address_street",
    "reservee_address_zip",
    "reservee_address_city",
    "reservee_email",
    "reservee_phone",
    "billing_first_name",
    "billing_last_name",
    "billing_phone",
    "billing_email",
    "billing_address_street",
    "billing_address_zip",
    "billing_address_city",
  ],
  business: [
    "reservee_organisation_name",
    "home_city",
    "reservee_id",
    "reservee_first_name",
    "reservee_last_name",
    "reservee_address_street",
    "reservee_address_zip",
    "reservee_address_city",
    "reservee_email",
    "reservee_phone",
    "billing_first_name",
    "billing_last_name",
    "billing_phone",
    "billing_email",
    "billing_address_street",
    "billing_address_zip",
    "billing_address_city",
  ],
  common: [
    "reservee_type",
    "name",
    "purpose",
    "num_persons",
    "age_group",
    "description",
    "applying_for_free_of_charge",
    "free_of_charge_reason",
  ],
};
