import { get as mockGet } from "lodash";
import { addDays, addHours, addMinutes, format, startOfToday } from "date-fns";
import {
  PaymentOrderType,
  ReservationsReservationReserveeTypeChoices,
  ReservationsReservationStateChoices,
  ReservationType,
  ReservationUnitByPkType,
  ReservationUnitsReservationUnitReservationStartIntervalChoices,
} from "common/types/gql-types";
import {
  CanReservationBeChangedProps,
  canReservationTimeBeChanged,
  canUserCancelReservation,
  getCheckoutUrl,
  getDurationOptions,
  getNormalizedReservationOrderStatus,
  getReservationApplicationMutationValues,
  getReservationCancellationReason,
  isReservationInThePast,
} from "../reservation";
import mockTranslations from "../../public/locales/fi/prices.json";
import { Language } from "common";

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
  test("empty inputs", () => {
    expect(
      getDurationOptions(
        null,
        5400,
        ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_90Mins
      )
    ).toEqual([]);
    expect(getDurationOptions(5400, null, null)).toEqual([]);
    expect(
      getDurationOptions(
        null,
        null,
        ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_90Mins
      )
    ).toEqual([]);
  });

  test("with 15 min intervals", () => {
    expect(
      getDurationOptions(
        1800,
        5400,
        ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_15Mins
      )
    ).toEqual([
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
  });

  test("with 90 min intervals", () => {
    expect(
      getDurationOptions(
        1800,
        30600,
        ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_90Mins
      )
    ).toEqual([
      {
        label: "1:30",
        value: "1:30",
      },
      {
        label: "3:00",
        value: "3:00",
      },
      {
        label: "4:30",
        value: "4:30",
      },
      {
        label: "6:00",
        value: "6:00",
      },
      {
        label: "7:30",
        value: "7:30",
      },
    ]);
  });
});

describe("canUserCancelReservation", () => {
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
      begin: addMinutes(new Date(), 10).toISOString(),
      state: ReservationsReservationStateChoices.Confirmed,
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
      state: ReservationsReservationStateChoices.Confirmed,
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

  test("with non-confirmed state", () => {
    const reservation = {
      begin: new Date().toISOString(),
      state: ReservationsReservationStateChoices.RequiresHandling,
      reservationUnits: [
        {
          cancellationRule: {
            needsHandling: false,
          },
        },
      ],
    } as ReservationType;
    expect(canUserCancelReservation(reservation)).toBe(false);
  });

  test("with 0 secs of buffer time", () => {
    const reservation = {
      begin: new Date().toISOString(),
      state: ReservationsReservationStateChoices.Confirmed,
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

describe("isReservationInThePast", () => {
  test("with valid data", () => {
    expect(
      isReservationInThePast({
        begin: new Date(),
      } as unknown as ReservationType)
    ).toBe(true);

    expect(
      isReservationInThePast({
        begin: addMinutes(new Date(), 10),
      } as unknown as ReservationType)
    ).toBe(false);

    expect(
      isReservationInThePast({
        begin: addMinutes(new Date(), -10),
      } as unknown as ReservationType)
    ).toBe(true);
  });

  test("with invalid data", () => {
    expect(isReservationInThePast({} as ReservationType)).toBe(null);
  });
});

describe("getReservationCancellationReason", () => {
  const reservation = {
    begin: addMinutes(new Date(), 60).toISOString(),
    reservationUnits: [
      {
        cancellationRule: {
          id: "fr8ejifod",
          canBeCancelledTimeBefore: 10,
          needsHandling: false,
        },
      },
    ],
  };

  test("with no reservation unit", () => {
    expect(
      getReservationCancellationReason({
        ...reservation,
        reservationUnits: [],
      } as ReservationType)
    ).toBe(null);
  });

  test("with no cancellation rule", () => {
    const reservationUnit = {
      ...reservation.reservationUnits[0],
      cancellationRule: null,
    };

    expect(
      getReservationCancellationReason({
        ...reservation,
        reservationUnits: [reservationUnit],
      } as ReservationType)
    ).toBe("NO_CANCELLATION_RULE");
  });

  test("with required handling", () => {
    const reservationUnit = {
      ...reservation.reservationUnits[0],
    };
    reservationUnit.cancellationRule = {
      ...reservationUnit.cancellationRule,
      needsHandling: true,
    };

    expect(
      getReservationCancellationReason({
        ...reservation,
        reservationUnits: [reservationUnit],
      } as ReservationType)
    ).toBe("REQUIRES_HANDLING");
  });

  test("with cancellation period", () => {
    expect(
      getReservationCancellationReason({
        ...reservation,
      } as ReservationType)
    ).toBe(null);
  });

  test("with cancellation period and long enough buffer", () => {
    const reservationUnit = {
      ...reservation.reservationUnits[0],
    };
    reservationUnit.cancellationRule = {
      ...reservationUnit.cancellationRule,
      canBeCancelledTimeBefore: 3500,
    };

    expect(
      getReservationCancellationReason({
        ...reservation,
        reservationUnits: [reservationUnit],
      } as ReservationType)
    ).toBe(null);
  });

  test("with cancellation period and too short buffer", () => {
    const reservationUnit = {
      ...reservation.reservationUnits[0],
    };
    reservationUnit.cancellationRule = {
      ...reservationUnit.cancellationRule,
      canBeCancelledTimeBefore: 3600,
    };

    expect(
      getReservationCancellationReason({
        ...reservation,
        reservationUnits: [reservationUnit],
      } as ReservationType)
    ).toBe("BUFFER");
  });
});

describe("getNormalizedReservationOrderStatus", () => {
  test("return correct value", () => {
    expect(
      getNormalizedReservationOrderStatus({
        state: "CANCELLED",
        orderStatus: "DRAFT",
      } as ReservationType)
    ).toBe("DRAFT");

    expect(
      getNormalizedReservationOrderStatus({
        state: "CANCELLED",
        orderStatus: "PAID",
      } as ReservationType)
    ).toBe("PAID");

    expect(
      getNormalizedReservationOrderStatus({
        state: "CONFIRMED",
        orderStatus: "PAID_MANUALLY",
      } as ReservationType)
    ).toBe("PAID_MANUALLY");

    expect(
      getNormalizedReservationOrderStatus({
        state: "DENIED",
        orderStatus: "SOMETHING_ELSE",
      } as ReservationType)
    ).toBe("SOMETHING_ELSE");
  });

  test("return null", () => {
    expect(getNormalizedReservationOrderStatus({} as ReservationType)).toBe(
      null
    );

    expect(
      getNormalizedReservationOrderStatus({
        state: "CREATED",
        orderStatus: "DRAFT",
      } as ReservationType)
    ).toBe(null);

    expect(
      getNormalizedReservationOrderStatus({
        state: "WAITING_FOR_PAYMENT",
        orderStatus: "DRAFT",
      } as ReservationType)
    ).toBe(null);

    expect(
      getNormalizedReservationOrderStatus({
        state: "REQUIRES_HANDLING",
        orderStatus: "DRAFT",
      } as ReservationType)
    ).toBe(null);
  });
});

describe("canReservationBeChanged", () => {
  const reservation = {
    id: "123f4w90",
    state: "CONFIRMED",
    price: 0,
    begin: addHours(startOfToday(), 34).toISOString(),
    reservationUnits: [
      {
        cancellationRule: {
          needsHandling: false,
        },
      },
    ],
  };

  const reservationUnit = {
    reservationBegins: addDays(new Date(), -1).toISOString(),
    reservationEnds: addDays(new Date(), 100).toISOString(),
    openingHours: {
      openingTimes: Array.from(Array(100)).map((val, index) => {
        const date = format(addDays(new Date(), index), "yyyy-MM-dd");
        return {
          date,
          startTime: `${date}T07:00:00+00:00`,
          endTime: `${date}T20:00:00+00:00`,
          state: "open",
          periods: null,
          isReservable: true,
        };
      }),
    },
    reservations: [],
  } as ReservationUnitByPkType;

  test("returns false with incomplete data", () => {
    expect(
      canReservationTimeBeChanged({} as CanReservationBeChangedProps)
    ).toStrictEqual([false]);
  });

  test("returns true with default data", () => {
    expect(
      canReservationTimeBeChanged({
        reservation,
      } as CanReservationBeChangedProps)
    ).toStrictEqual([true]);
  });

  test("returns false with non-confirmed reservation", () => {
    expect(
      canReservationTimeBeChanged({
        reservation: { ...reservation, state: "CREATED" },
      } as CanReservationBeChangedProps)
    ).toStrictEqual([false, "RESERVATION_MODIFICATION_NOT_ALLOWED"]);
  });

  test("handles past reservation check", () => {
    expect(
      canReservationTimeBeChanged({
        reservation: {
          ...reservation,
          begin: addHours(new Date(), -1).toISOString(),
        },
      } as CanReservationBeChangedProps)
    ).toStrictEqual([false, "RESERVATION_BEGIN_IN_PAST"]);
  });

  test("handles cancellation rule check", () => {
    expect(
      canReservationTimeBeChanged({
        reservation: {
          ...reservation,
          reservationUnits: [
            {
              ...reservation.reservationUnits[0],
              cancellationRule: null,
            },
          ],
        },
      } as CanReservationBeChangedProps)
    ).toStrictEqual([false, "RESERVATION_MODIFICATION_NOT_ALLOWED"]);

    expect(
      canReservationTimeBeChanged({
        reservation: {
          ...reservation,
          reservationUnits: [
            {
              ...reservation.reservationUnits[0],
              cancellationRule: {
                needsHandling: true,
              },
            },
          ],
        },
      } as CanReservationBeChangedProps)
    ).toStrictEqual([false, "RESERVATION_MODIFICATION_NOT_ALLOWED"]);
  });

  test("handles cancellation rule buffer check", () => {
    expect(
      canReservationTimeBeChanged({
        reservation: {
          ...reservation,
          begin: addHours(new Date(), 1).toISOString(),
          reservationUnits: [
            {
              ...reservation.reservationUnits[0],
              cancellationRule: {
                ...reservation.reservationUnits[0].cancellationRule,
                canBeCancelledTimeBefore: 3000,
              },
            },
          ],
        },
      } as CanReservationBeChangedProps)
    ).toStrictEqual([true]);

    expect(
      canReservationTimeBeChanged({
        reservation: {
          ...reservation,
          begin: addHours(new Date(), 1).toISOString(),
          reservationUnits: [
            {
              ...reservation.reservationUnits[0],
              cancellationRule: {
                ...reservation.reservationUnits[0].cancellationRule,
                canBeCancelledTimeBefore: 3601,
              },
            },
          ],
        },
      } as CanReservationBeChangedProps)
    ).toStrictEqual([false, "CANCELLATION_TIME_PAST"]);
  });

  test("handles situation when reservation has been handled", () => {
    expect(
      canReservationTimeBeChanged({
        reservation: { ...reservation, isHandled: true },
      } as CanReservationBeChangedProps)
    ).toStrictEqual([false, "RESERVATION_MODIFICATION_NOT_ALLOWED"]);
  });

  test("handles new reservation price check", () => {
    expect(
      canReservationTimeBeChanged({
        reservation,
        newReservation: { ...reservation, price: 2.02 },
      } as CanReservationBeChangedProps)
    ).toStrictEqual([false, "RESERVATION_MODIFICATION_NOT_ALLOWED"]);
  });

  describe("handles new reservation general validation", () => {
    test("with incomplete data", () => {
      expect(
        canReservationTimeBeChanged({
          reservation,
          newReservation: {
            ...reservation,
            begin: addHours(startOfToday(), 12).toISOString(),
          },
          reservationUnit,
          activeApplicationRounds: [],
        } as CanReservationBeChangedProps)
      ).toStrictEqual([false, "RESERVATION_TIME_INVALID"]);

      expect(
        canReservationTimeBeChanged({
          reservation,
          newReservation: {
            ...reservation,
            begin: undefined,
            end: addHours(startOfToday(), 12).toISOString(),
          },
          reservationUnit,
          activeApplicationRounds: [],
        } as CanReservationBeChangedProps)
      ).toStrictEqual([false, "RESERVATION_TIME_INVALID"]);

      expect(
        canReservationTimeBeChanged({
          reservation,
          newReservation: {
            ...reservation,
            begin: addHours(startOfToday(), 10).toString(),
            end: addHours(startOfToday(), 12).toString(),
          },
          reservationUnit: {
            ...reservationUnit,
            openingHours: {
              openingTimes: [],
            },
          },
          activeApplicationRounds: [],
        } as CanReservationBeChangedProps)
      ).toStrictEqual([false, "RESERVATION_TIME_INVALID"]);
    });

    test("with reservation start buffer", () => {
      expect(
        canReservationTimeBeChanged({
          reservation,
          newReservation: {
            ...reservation,
            begin: addHours(startOfToday(), 10).toString(),
            end: addHours(startOfToday(), 12).toString(),
          },
          reservationUnit: {
            ...reservationUnit,
            reservationsMinDaysBefore: 10,
          },
          activeApplicationRounds: [],
        } as CanReservationBeChangedProps)
      ).toStrictEqual([false, "RESERVATION_TIME_INVALID"]);
    });

    test("with reservation time missing reservation units reservation time slot", () => {
      expect(
        canReservationTimeBeChanged({
          reservation,
          newReservation: {
            ...reservation,
            begin: addHours(new Date(), 1).toString(),
            end: addHours(new Date(), 2).toString(),
          },
          reservationUnit: {
            ...reservationUnit,
            reservationBegins: addDays(new Date(), 1).toString(),
          },
          activeApplicationRounds: [],
        } as CanReservationBeChangedProps)
      ).toStrictEqual([false, "RESERVATION_TIME_INVALID"]);

      expect(
        canReservationTimeBeChanged({
          reservation,
          newReservation: {
            ...reservation,
            begin: addHours(new Date(), 1).toString(),
            end: addHours(new Date(), 2).toString(),
          },
          reservationUnit: {
            ...reservationUnit,
            reservationEnds: addDays(new Date(), -1).toString(),
          },
          activeApplicationRounds: [],
        } as CanReservationBeChangedProps)
      ).toStrictEqual([false, "RESERVATION_TIME_INVALID"]);
    });

    test("with conflicting application round", () => {
      expect(
        canReservationTimeBeChanged({
          reservation,
          newReservation: {
            ...reservation,
            begin: addHours(startOfToday(), 10).toString(),
            end: addHours(startOfToday(), 12).toString(),
          },
          reservationUnit,
          activeApplicationRounds: [
            {
              reservationPeriodBegin: addHours(startOfToday(), 1).toISOString(),
              reservationPeriodEnd: addHours(startOfToday(), 20).toISOString(),
            },
          ],
        } as CanReservationBeChangedProps)
      ).toStrictEqual([false, "RESERVATION_TIME_INVALID"]);
    });

    test("valid data", () => {
      expect(
        canReservationTimeBeChanged({
          reservation,
          newReservation: {
            ...reservation,
            begin: addHours(startOfToday(), 35).toString(),
            end: addHours(startOfToday(), 36).toString(),
          },
          reservationUnit,
        } as CanReservationBeChangedProps)
      ).toStrictEqual([true]);
    });
  });
});

describe("getCheckoutUrl", () => {
  const order: PaymentOrderType = {
    id: "order-id",
    checkoutUrl: "https://checkout.url/path?user=1111-2222-3333-4444",
  };

  test("returns checkout url", () => {
    expect(getCheckoutUrl(order, "sv")).toBe(
      "https://checkout.url/path/paymentmethod?user=1111-2222-3333-4444&lang=sv"
    );

    expect(getCheckoutUrl(order, "fi")).toBe(
      "https://checkout.url/path/paymentmethod?user=1111-2222-3333-4444&lang=fi"
    );
  });

  test("returns null with falsy input", () => {
    expect(getCheckoutUrl(order, null as unknown as Language)).toBe(null);

    expect(getCheckoutUrl({ ...order, checkoutUrl: undefined }, "fi")).toBe(
      null
    );

    expect(
      getCheckoutUrl(
        {
          ...order,
          checkoutUrl: "checkout.url?user=1111-2222-3333-4444",
        },
        "fi"
      )
    ).toBe(null);

    expect(
      getCheckoutUrl(
        {
          ...order,
          checkoutUrl: "https://checkout.url/path",
        },
        "fi"
      )
    ).toBe(null);
  });
});
