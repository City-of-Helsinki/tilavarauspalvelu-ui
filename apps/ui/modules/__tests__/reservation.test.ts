import { get as mockGet } from "lodash";
import { addDays, addHours, addMinutes, format, startOfToday } from "date-fns";
import {
  PaymentOrderType,
  ReservationsReservationReserveeTypeChoices,
  ReservationsReservationStateChoices,
  ReservationType,
  ReservationUnitByPkType,
  ReservationUnitsReservationUnitReservationStartIntervalChoices,
  ReservationUnitsReservationUnitAuthenticationChoices,
  ReservationUnitsReservationUnitReservationKindChoices,
  ReservationUnitCancellationRuleType,
  ReservationUnitType,
  ReservationsReservationPriorityChoices,
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
import {toApiDate} from "common/src/common/util";

jest.mock("next-i18next", () => ({
  i18n: {
    t: (str: string) => {
      const path = str.replace("prices:", "");
      return mockGet(mockTranslations, path);
    },
    language: "fi",
  },
}));

describe("getDurationOptions", () => {
  test("empty inputs", () => {
    const interval90 = ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_90Mins
    const interval60 = ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_60Mins
    expect(getDurationOptions( 0, 5400, interval90)).toEqual([]);
    expect(getDurationOptions(5400, 0, interval60)).toEqual([]);
    expect(getDurationOptions( 0, 0, interval90)).toEqual([]);
  });

  test("with 15 min intervals", () => {
    const interval15 = ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_15Mins
    expect( getDurationOptions( 1800, 5400, interval15)).toEqual([
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
    const interval90 = ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_90Mins
    expect( getDurationOptions( 1800, 30600, interval90)).toEqual([
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

const reservationUnit: ReservationUnitByPkType = {
  authentication: ReservationUnitsReservationUnitAuthenticationChoices.Weak,
  canApplyFreeOfCharge: false,
  contactInformation: "",
  id: "123f4w90",
  uuid: "123f4w90",
  images: [],
  isArchived: false,
  isDraft: false,
  requireIntroduction: false,
  reservationKind: ReservationUnitsReservationUnitReservationKindChoices.Direct,
  reservationStartInterval: ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_15Mins,
  reservationBegins: addDays(new Date(), -1).toISOString(),
  reservationEnds: undefined, // addDays(new Date(), 200).toISOString(),
  reservableTimeSpans: Array.from(Array(100)).map((_val, index) => {
      return {
        startDatetime: `${toApiDate(addDays(new Date(), index))}T07:00:00+00:00`,
        endDatetime: `${toApiDate(addDays(new Date(), index))}T20:00:00+00:00`,
      };
    }),
  cancellationRule: {
    id: "fr8ejifod",
    needsHandling: false,
  },
  reservations: [],
  allowReservationsWithoutOpeningHours: false,
  requireReservationHandling: false,
};

const reservation: ReservationType = {
  id: "123f4w90",
  state: ReservationsReservationStateChoices.Confirmed,
  price: 0,
  begin: addHours(startOfToday(), 34).toISOString(),
  end: addHours(startOfToday(), 35).toISOString(),
  reservationUnits: [reservationUnit as ReservationUnitType],
  handlingDetails: "",
  priority: ReservationsReservationPriorityChoices.A_300,
};

describe("canUserCancelReservation", () => {
  test("that needs handling", () => {
    const res: ReservationType = {
      ...reservation,
      begin: new Date().toISOString(),
      end: addHours(new Date(), 1).toISOString(),
      id: "123",
      reservationUnits: [
        {
          ...reservationUnit,
          cancellationRule: {
            needsHandling: true,
          } as ReservationUnitCancellationRuleType,
        } as ReservationUnitType,
      ],
    } ;
    expect(canUserCancelReservation(res)).toBe(false);
  });

  test("that does not need handling", () => {
    const res: ReservationType = {
      ...reservation,
      begin: addMinutes(new Date(), 10).toISOString(),
      state: ReservationsReservationStateChoices.Confirmed,
      reservationUnits: [
        {
          ...reservationUnit,
          cancellationRule: {
            needsHandling: false,
          } as ReservationUnitCancellationRuleType,
        } as ReservationUnitType,
      ],
    };
    expect(canUserCancelReservation(res)).toBe(true);
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
    expect(isReservationInThePast({} as ReservationType)).toBe(false);
  });
});

describe("getReservationCancellationReason", () => {
  const reservation2: ReservationType = {
    ...reservation,
    begin: addMinutes(new Date(), 60).toISOString(),
    reservationUnits: [
      {
        ...reservationUnit,
        cancellationRule: {
          id: "fr8ejifod",
          canBeCancelledTimeBefore: 10,
          needsHandling: false,
        } as ReservationUnitCancellationRuleType,
      } as ReservationUnitType,
    ],
  };

  test("with no reservation unit", () => {
    expect(
      getReservationCancellationReason({
        ...reservation2,
        reservationUnits: [],
      })
    ).toBe(null);
  });

  test("with no cancellation rule", () => {
    const resUnit: ReservationUnitType = {
      ...reservationUnit,
      cancellationRule: null,
    } as ReservationUnitType;

    expect(
      getReservationCancellationReason({
        ...reservation,
        reservationUnits: [resUnit],
      })
    ).toBe("NO_CANCELLATION_RULE");
  });

  test("with required handling", () => {
    const resUnit: ReservationUnitType = {
      ...reservationUnit,
      cancellationRule: {
        ...reservationUnit.cancellationRule,
        needsHandling: true,
      } as ReservationUnitCancellationRuleType,
    } as ReservationUnitType;
    expect(
      getReservationCancellationReason({
        ...reservation,
        reservationUnits: [resUnit],
      })
    ).toBe("REQUIRES_HANDLING");
  });

  test("with cancellation period", () => {
    expect(
      getReservationCancellationReason({
        ...reservation,
      } as ReservationType)
    ).toBe(null);
  });

  test("can be cancelled when the reservation is outside the cancellation buffer", () => {
    const resUnit = {
      ...reservationUnit,
      cancellationRule: {
        ...reservationUnit.cancellationRule,
        canBeCancelledTimeBefore: 3600,
      } as ReservationUnitCancellationRuleType,
    } as ReservationUnitType;

    expect(
      getReservationCancellationReason({
        ...reservation,
        // duplicating these to be explicit what is tested
        begin: addHours(startOfToday(), 34).toISOString(),
        end: addHours(startOfToday(), 35).toISOString(),
        reservationUnits: [resUnit],
      } )
    ).toBe(null);
  });

  test("can't cancel if the reservation is too close to the start time", () => {
    const resUnit: ReservationUnitType= {
      ...reservationUnit,
      cancellationRule: {
        ...reservationUnit.cancellationRule,
        canBeCancelledTimeBefore: 3600,
      } as ReservationUnitCancellationRuleType,
    } as ReservationUnitType;

    expect(
      getReservationCancellationReason({
        ...reservation,
        begin: addHours(startOfToday(), 12).toISOString(),
        end: addHours(startOfToday(), 13).toISOString(),
        reservationUnits: [resUnit],
      })
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


  test("returns false with incomplete data", () => {
    expect(canReservationTimeBeChanged({})).toStrictEqual([false]);
  });

  test("returns true with default data", () => {
    expect(
      canReservationTimeBeChanged({ reservation, })).toStrictEqual([true]);
  });

  test("returns false with non-confirmed reservation", () => {
    expect(
      canReservationTimeBeChanged({
        reservation: { ...reservation, state: ReservationsReservationStateChoices.Created },
      })
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
              ...reservationUnit,
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
              ...reservationUnit,
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
              ...reservationUnit,
              cancellationRule: {
                ...reservationUnit.cancellationRule,
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
              ...reservationUnit,
              cancellationRule: {
                ...reservationUnit.cancellationRule,
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
        })
      ).toStrictEqual([false, "RESERVATION_TIME_INVALID"]);

      expect(
        canReservationTimeBeChanged({
          reservation,
          newReservation: {
            ...reservation,
            begin: "",
            end: addHours(startOfToday(), 12).toISOString(),
          },
          reservationUnit,
          activeApplicationRounds: [],
        })
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
            reservableTimeSpans: [],
          },
          activeApplicationRounds: [],
        })
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
        })
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
        })
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
        })
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
        })
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
          activeApplicationRounds: [],
        })
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

  test("returns undefined with falsy input", () => {
    expect(getCheckoutUrl({ ...order, checkoutUrl: undefined })).not.toBeDefined();

    expect(
      getCheckoutUrl({
        ...order,
        checkoutUrl: "checkout.url?user=1111-2222-3333-4444",
      })
    ).not.toBeDefined();

    expect(
      getCheckoutUrl({
        ...order,
        checkoutUrl: "https://checkout.url/path",
      })
    ).not.toBeDefined();
  });
});
