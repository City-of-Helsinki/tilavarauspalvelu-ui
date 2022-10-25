import { get as mockGet } from "lodash";
import {
  ReservationsReservationReserveeTypeChoices,
  ReservationType,
} from "../gql-types";
import {
  canUserCancelReservation,
  getDurationOptions,
  getReservationApplicationFields,
  getReservationApplicationMutationValues,
} from "../reservation";
import mockTranslations from "../../public/locales/fi/prices.json";

jest.mock("next-i18next", () => ({
  i18n: {
    t: (str: string) => {
      const path = str.replace("prices:", "");
      return mockGet(mockTranslations, path);
    },
    language: "fi",
  },
}));

jest.mock("next/config", () => () => ({
  serverRuntimeConfig: {},
  publicRuntimeConfig: {},
}));

describe("getDurationOptions", () => {
  test("works", () => {
    expect(getDurationOptions(null, 5400)).toEqual([]);
    expect(getDurationOptions(5400, null)).toEqual([]);
    expect(getDurationOptions(null, null)).toEqual([]);
    expect(getDurationOptions(1800, 5400)).toEqual([
      {
        label: "0:30",
        value: "0:30",
      },
      {
        label: "0:45",
        value: "0:45",
      },
      {
        label: "1:00",
        value: "1:00",
      },
      {
        label: "1:15",
        value: "1:15",
      },
      {
        label: "1:30",
        value: "1:30",
      },
    ]);
    expect(getDurationOptions(1800, 30600, "02:00:00")).toEqual([
      {
        label: "0:30",
        value: "0:30",
      },
      {
        label: "2:30",
        value: "2:30",
      },
      {
        label: "4:30",
        value: "4:30",
      },
      {
        label: "6:30",
        value: "6:30",
      },
      {
        label: "8:30",
        value: "8:30",
      },
    ]);
  });
});

describe("canUseCancelReservation", () => {
  test("that needs handling", () => {
    const reservation = {
      begin: new Date().toISOString(),
      reservationUnits: [
        {
          cancellationRule: {
            needsHandling: true,
          },
        },
      ],
    } as ReservationType;
    expect(canUserCancelReservation(reservation)).toBe(false);
  });

  test("that does not need handling", () => {
    const reservation = {
      begin: new Date().toISOString(),
      reservationUnits: [
        {
          cancellationRule: {
            needsHandling: false,
          },
        },
      ],
    } as ReservationType;
    expect(canUserCancelReservation(reservation)).toBe(true);
  });

  test("that does not need handling", () => {
    const reservation = {
      begin: new Date().toISOString(),
      reservationUnits: [
        {
          cancellationRule: {
            needsHandling: false,
          },
        },
      ],
    } as ReservationType;
    expect(canUserCancelReservation(reservation)).toBe(true);
  });

  test("with 0 secs of buffer time", () => {
    const reservation = {
      begin: new Date().toISOString(),
      reservationUnits: [
        {
          cancellationRule: {
            needsHandling: false,
            canBeCancelledTimeBefore: 0,
          },
        },
      ],
    } as ReservationType;
    expect(canUserCancelReservation(reservation)).toBe(true);
  });

  test("with 1 sec of buffer time", () => {
    const reservation = {
      begin: new Date().toISOString(),
      reservationUnits: [
        {
          cancellationRule: {
            needsHandling: false,
            canBeCancelledTimeBefore: 1,
          },
        },
      ],
    } as ReservationType;
    expect(canUserCancelReservation(reservation)).toBe(false);
  });

  test("without cancellation rule", () => {
    const reservation = {
      begin: new Date().toISOString(),
      reservationUnits: [{}],
    } as ReservationType;
    expect(canUserCancelReservation(reservation)).toBe(false);
  });
});

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

describe("getReservationApplcationMutationValues", () => {
  test("with empty input", () => {
    expect(
      getReservationApplicationMutationValues(
        {},
        [],
        ReservationsReservationReserveeTypeChoices.Individual
      )
    ).toEqual({
      reserveeType: ReservationsReservationReserveeTypeChoices.Individual,
    });
  });

  test("with sane input", () => {
    const payload = {
      name: "Nimi",
      reserveeId: "123456-7",
      reserveeFirstName: "Etunimi",
    };
    expect(
      getReservationApplicationMutationValues(
        payload,
        ["name", "reservee_id", "reservee_first_name"],
        ReservationsReservationReserveeTypeChoices.Individual
      )
    ).toEqual({
      name: "Nimi",
      reserveeFirstName: "Etunimi",
      reserveeType: ReservationsReservationReserveeTypeChoices.Individual,
    });
  });
});
