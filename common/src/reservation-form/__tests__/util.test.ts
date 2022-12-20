import { getReservationApplicationFields } from "../util";
import { ReservationsReservationReserveeTypeChoices } from "../../../types/gql-types";

describe("getReservationApplicationFields", () => {
  test("with emrty input", () => {
    expect(
      getReservationApplicationFields(
        [],
        ReservationsReservationReserveeTypeChoices.Individual
      )
    ).toEqual([]);
  });

  const fields = ["reservee_id", "reservee_organisation_name", "name"];

  test("with individual input", () => {
    expect(
      getReservationApplicationFields(
        fields,
        ReservationsReservationReserveeTypeChoices.Individual
      )
    ).toEqual([]);
  });

  test("with common input", () => {
    expect(getReservationApplicationFields(fields, "common")).toEqual(["name"]);
  });

  test("with business input", () => {
    expect(
      getReservationApplicationFields(
        fields,
        ReservationsReservationReserveeTypeChoices.Business
      )
    ).toEqual(["reservee_organisation_name", "reservee_id"]);
  });

  test("with nonprofit input, camelCased", () => {
    expect(
      getReservationApplicationFields(
        fields,
        ReservationsReservationReserveeTypeChoices.Nonprofit,
        true
      )
    ).toEqual(["reserveeOrganisationName", "reserveeId"]);
  });
});
