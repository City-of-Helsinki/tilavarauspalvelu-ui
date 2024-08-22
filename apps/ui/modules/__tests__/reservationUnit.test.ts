import { get as mockGet } from "lodash";
import {
  addDays,
  addHours,
  endOfDay,
  format,
  getHours,
  startOfDay,
  startOfToday,
} from "date-fns";
import { toApiDateUnsafe } from "common/src/common/util";
import {
  type EquipmentNode,
  ReservationStateChoice,
  PriceUnit,
  PricingType,
  ReservationUnitState,
  type ReservationUnitNode,
  Status,
  Authentication,
  ReservationKind,
  ReservationStartInterval,
  ReservationState,
  type PriceReservationUnitFragment,
} from "@gql/gql-types";
import {
  type GetReservationUnitPriceProps,
  getDayIntervals,
  getEquipmentCategories,
  getEquipmentList,
  getFuturePricing,
  getPossibleTimesForDay,
  getPriceString,
  getReservationUnitInstructionsKey,
  getReservationUnitName,
  getReservationUnitPrice,
  getUnitName,
  isReservationUnitPaidInFuture,
  isReservationUnitPublished,
  isReservationUnitReservable,
  GetPriceType,
} from "../reservationUnit";
import mockTranslations from "../../public/locales/fi/prices.json";
import { type ReservableMap, dateToKey, type RoundPeriod } from "../reservable";
import { createMockReservationUnit } from "@/test/testUtils";
import { base64encode } from "common/src/helpers";

jest.mock("next-i18next", () => ({
  i18n: {
    t: (str: string) => {
      const path = str.replace("prices:", "");
      return mockGet(mockTranslations, path);
    },
    language: "fi",
  },
}));

// Turn into describe block and spec the tests
describe("getPossibleTimesForDay", () => {
  beforeAll(() => {
    jest.useFakeTimers({
      doNotFake: ["performance"],
      // use two numbers for hour so we don't need to pad with 0
      now: new Date(2024, 0, 1, 10, 0, 0),
    });
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  function mockReservableTimes(): ReservableMap {
    const map: ReservableMap = new Map();
    for (let i = 0; i < 30; i++) {
      const date = addDays(startOfToday(), i);
      const key = format(date, "yyyy-MM-dd");
      const value = [{ start: startOfDay(date), end: endOfDay(date) }];
      map.set(key, value);
    }
    return map;
  }

  function createInput({
    date,
    interval,
    duration,
    reservableTimes,
  }: {
    date: Date;
    interval?: ReservationStartInterval;
    duration?: number;
    bufferTimeBefore?: number;
    bufferTimeAfter?: number;
    reservableTimes?: ReservableMap;
  }) {
    const reservationUnit = createMockReservationUnit({});
    return {
      date,
      interval: interval ?? ReservationStartInterval.Interval_30Mins,
      reservationUnit,
      activeApplicationRounds: [] as const,
      reservableTimes: reservableTimes ?? mockReservableTimes(),
      durationValue: duration ?? 30,
    };
  }

  // Doesn't care about the time (outside of can't be in the past) only the day
  test("returns a list of possible times for today in the future", () => {
    const date = startOfToday();
    const hour = getHours(new Date());
    const input = createInput({ date });
    const output: { label: string; value: string }[] = [];
    for (let i = hour; i < 24; i++) {
      // now is not in the set
      if (i !== hour) {
        output.push({ label: `${i}:00`, value: `${i}:00` });
      }
      output.push({ label: `${i}:30`, value: `${i}:30` });
    }
    expect(getPossibleTimesForDay(input)).toStrictEqual(output);
  });

  test("interval is 60 mins", () => {
    const date = startOfToday();
    const hour = getHours(new Date()) + 1;
    const input = createInput({
      date,
      interval: ReservationStartInterval.Interval_60Mins,
    });
    const output: { label: string; value: string }[] = [];
    for (let i = hour; i < 24; i++) {
      output.push({ label: `${i}:00`, value: `${i}:00` });
    }
    expect(getPossibleTimesForDay(input)).toStrictEqual(output);
  });

  test("interval is 120 mins", () => {
    const date = startOfToday();
    const hour = getHours(new Date()) + 2;
    const input = createInput({
      date,
      interval: ReservationStartInterval.Interval_120Mins,
    });
    const output: { label: string; value: string }[] = [];
    for (let i = hour; i < 24; i += 2) {
      output.push({ label: `${i}:00`, value: `${i}:00` });
    }
    expect(getPossibleTimesForDay(input)).toStrictEqual(output);
  });

  test("no ranges for past days", () => {
    const date = addDays(startOfToday(), -1);
    const input = createInput({ date });
    expect(getPossibleTimesForDay(input)).toStrictEqual([]);
  });

  test("no reservable times for the date", () => {
    const date = startOfToday();
    const reservableTimes = mockReservableTimes();
    reservableTimes.delete(dateToKey(date));
    const input = createInput({ date, reservableTimes });
    expect(getPossibleTimesForDay(input)).toStrictEqual([]);
  });

  test("multiple reservable times for the date", () => {
    const date = startOfToday();
    const reservableTimes = mockReservableTimes();
    reservableTimes.set(dateToKey(date), [
      { start: addHours(date, 12), end: addHours(date, 14) },
      { start: addHours(date, 16), end: addHours(date, 17) },
    ]);
    const input = createInput({ date, reservableTimes });
    const output = ["12:00", "12:30", "13:00", "13:30", "16:00", "16:30"].map(
      (label) => ({ label, value: label })
    );
    expect(getPossibleTimesForDay(input)).toStrictEqual(output);
  });

  test("duration is longer than the available times", () => {
    const date = startOfToday();
    const reservableTimes = mockReservableTimes();
    reservableTimes.set(dateToKey(date), [
      { start: addHours(date, 10), end: addHours(date, 11) },
      { start: addHours(date, 12), end: addHours(date, 14) },
      { start: addHours(date, 16), end: addHours(date, 18) },
      { start: addHours(date, 19), end: addHours(date, 20) },
    ]);
    const input = createInput({ date, duration: 150, reservableTimes });
    expect(getPossibleTimesForDay(input)).toStrictEqual([]);
  });

  // getPossibleTimesForDay does multiple calls to isRangeReservable which is heavy
  // a lot of array copying / generation
  test("performance", () => {
    const date = startOfToday();
    const reservableTimes = mockReservableTimes();
    reservableTimes.set(dateToKey(date), [
      { start: addHours(date, 10), end: addHours(date, 11) },
      { start: addHours(date, 12), end: addHours(date, 14) },
      { start: addHours(date, 16), end: addHours(date, 18) },
      { start: addHours(date, 19), end: addHours(date, 20) },
    ]);
    const input = createInput({ date, reservableTimes });
    const start = performance.now();
    getPossibleTimesForDay(input);
    const end = performance.now();
    expect(end - start).toBeLessThan(20);
  });
});

describe("getPriceString", () => {
  function constructInput({
    lowestPrice,
    highestPrice,
    priceUnit,
    minutes,
  }: {
    lowestPrice?: number;
    highestPrice?: number;
    priceUnit?: PriceUnit;
    minutes?: number;
  }): GetPriceType {
    return {
      pricing: constructPricing({
        lowestPrice,
        highestPrice,
        priceUnit,
      }),
      minutes: minutes ?? undefined,
    };
  }

  test("price range", () => {
    const input = constructInput({
      lowestPrice: 10,
      highestPrice: 50.5,
      priceUnit: PriceUnit.Per_15Mins,
    });
    expect(getPriceString(input)).toBe("10,00 - 50,50 € / 15 min");
  });

  test("price range with no min", () => {
    const input = constructInput({
      lowestPrice: 0.0,
      highestPrice: 50.5,
      priceUnit: PriceUnit.Per_15Mins,
    });
    expect(getPriceString(input)).toBe("0 - 50,50 € / 15 min");
  });

  test("price range with minutes", () => {
    const input = constructInput({
      lowestPrice: 0.0,
      highestPrice: 60.5,
      minutes: 60,
    });
    expect(getPriceString(input)).toBe("0 - 60,50 €");
  });

  test("price range with minutes", () => {
    const input = constructInput({
      lowestPrice: 0.0,
      highestPrice: 60.5,
      minutes: 61,
    });
    expect(getPriceString(input)).toBe("0 - 75,63 €");
  });

  test("price range with minutes", () => {
    const input = constructInput({
      lowestPrice: 0.0,
      highestPrice: 100,
      minutes: 61,
    });
    expect(getPriceString(input)).toBe("0 - 125,00 €");
  });

  test("price range with minutes", () => {
    const input = constructInput({
      lowestPrice: 0.0,
      highestPrice: 100,
      minutes: 90,
    });
    expect(getPriceString(input)).toBe("0 - 150,00 €");
  });

  test("price range with minutes", () => {
    const input = constructInput({
      lowestPrice: 0.0,
      highestPrice: 100,
      minutes: 91,
    });
    expect(getPriceString(input)).toBe("0 - 175,00 €");
  });

  test("price range with minutes", () => {
    const input = constructInput({
      lowestPrice: 0.0,
      highestPrice: 30,
      minutes: 60,
      priceUnit: PriceUnit.Per_15Mins,
    });
    expect(getPriceString(input)).toBe("0 - 120,00 €");
  });

  test("price range with minutes", () => {
    const input = constructInput({
      lowestPrice: 0.0,
      highestPrice: 30,
      minutes: 60,
      priceUnit: PriceUnit.Per_30Mins,
    });
    expect(getPriceString(input)).toBe("0 - 60,00 €");
  });

  test("price range with minutes", () => {
    const input = constructInput({
      lowestPrice: 0.0,
      highestPrice: 30,
      minutes: 61,
      priceUnit: PriceUnit.Per_30Mins,
    });
    expect(getPriceString(input)).toBe("0 - 75,00 €");
  });

  test("price range with minutes and fixed unit", () => {
    const input = constructInput({
      lowestPrice: 10,
      highestPrice: 100,
      minutes: 61,
      priceUnit: PriceUnit.PerHalfDay,
    });
    expect(getPriceString(input)).toBe("10,00 - 100,00 €");
  });

  test("price range with minutes and fixed unit", () => {
    const input = constructInput({
      lowestPrice: 10,
      highestPrice: 100,
      minutes: 1234,
      priceUnit: PriceUnit.PerDay,
    });
    expect(getPriceString(input)).toBe("10,00 - 100,00 €");
  });

  test("price range with minutes and fixed unit", () => {
    const input = constructInput({
      lowestPrice: 10,
      highestPrice: 100,
      minutes: 1234,
      priceUnit: PriceUnit.PerWeek,
    });
    expect(getPriceString(input)).toBe("10,00 - 100,00 €");
  });

  test("fixed price", () => {
    const input = constructInput({
      lowestPrice: 50,
      highestPrice: 50,
      priceUnit: PriceUnit.Fixed,
    });
    expect(getPriceString(input)).toBe("50,00 €");
  });

  test("no price", () => {
    const input = constructInput({
      lowestPrice: 0,
      highestPrice: 0,
    });
    expect(getPriceString(input)).toBe("Maksuton");
  });

  test("total price with minutes", () => {
    const input = constructInput({
      lowestPrice: 0,
      highestPrice: 50.5,
      minutes: 180,
      priceUnit: PriceUnit.Per_15Mins,
    });
    expect(getPriceString(input)).toBe("0 - 606,00 €");
  });
});

describe("isReservationUnitPublished", () => {
  test("without state", () => {
    expect(isReservationUnitPublished({} as ReservationUnitNode)).toBe(false);
  });

  test("with valid states", () => {
    expect(
      isReservationUnitPublished({ state: ReservationUnitState.Published })
    ).toBe(true);

    expect(
      isReservationUnitPublished({
        state: ReservationUnitState.ScheduledHiding,
      })
    ).toBe(true);
  });

  test("with invalid states", () => {
    expect(
      isReservationUnitPublished({ state: ReservationUnitState.Archived })
    ).toBe(false);

    expect(
      isReservationUnitPublished({ state: ReservationUnitState.Draft })
    ).toBe(false);

    expect(
      isReservationUnitPublished({ state: ReservationUnitState.Hidden })
    ).toBe(false);

    expect(
      isReservationUnitPublished({
        state: ReservationUnitState.ScheduledPeriod,
      })
    ).toBe(false);

    expect(
      isReservationUnitPublished({
        state: ReservationUnitState.ScheduledPublishing,
      })
    ).toBe(false);
  });
});

describe("getEquipmentCategories", () => {
  test("with equipment out of predefined order", () => {
    const equipment: EquipmentNode[] = [
      {
        id: "1",
        nameFi: "Item A",
        name: "Item A",
        category: {
          id: "1",
          nameFi: "Category A",
          name: "Category A",
        },
      },
      {
        id: "2",
        nameFi: "Item B",
        name: "Item B",
        category: {
          id: "2",
          nameFi: "Category B",
          name: "Category B",
        },
      },
      {
        id: "3",
        nameFi: "Item C",
        name: "Item C",
        category: {
          id: "3",
          nameFi: "Category C",
          name: "Category C",
        },
      },
    ];

    expect(getEquipmentCategories(equipment)).toStrictEqual(["Muu"]);
  });

  test("with equipment in predefined order", () => {
    const equipment: EquipmentNode[] = [
      {
        id: "1",
        nameFi: "Item A",
        name: "Item A",
        category: {
          id: "1",
          nameFi: "Liittimet",
          name: "Liittimet",
        },
      },
      {
        id: "2",
        nameFi: "Item B",
        name: "Item B",
        category: {
          id: "2",
          nameFi: "Keittiö",
          name: "Keittiö",
        },
      },
      {
        id: "3",
        nameFi: "Item C",
        name: "Item C",
        category: {
          id: "3",
          nameFi: "Foobar",
          name: "Foobar",
        },
      },
      {
        id: "4",
        nameFi: "Item D",
        name: "Item D",
        category: {
          id: "4",
          nameFi: "Pelikonsoli",
          name: "Pelikonsoli",
        },
      },
      {
        id: "5",
        nameFi: "Item ABC 2",
        name: "Item ABC 2",
        category: {
          id: "2",
          nameFi: "Keittiö",
          name: "Keittiö",
        },
      },
      {
        id: "6",
        nameFi: "Item ABC 1",
        name: "Item ABC 1",
        category: {
          id: "2",
          nameFi: "Keittiö",
          name: "Keittiö",
        },
      },
    ];

    expect(getEquipmentCategories(equipment)).toStrictEqual([
      "Keittiö",
      "Pelikonsoli",
      "Liittimet",
      "Muu",
    ]);
  });

  test("without categories", () => {
    expect(getEquipmentCategories([])).toStrictEqual([]);
  });
});

describe("getEquipmentList", () => {
  test("with equipment out of predefined order", () => {
    const equipment: EquipmentNode[] = [
      {
        id: "1",
        nameFi: "Item A",
        name: "Item A",
        category: {
          id: "1",
          nameFi: "Category A",
          name: "Category A",
        },
      },
      {
        id: "2",
        nameFi: "Item B",
        name: "Item B",
        category: {
          id: "2",
          nameFi: "Category B",
          name: "Category B",
        },
      },
      {
        id: "3",
        nameFi: "Item C",
        name: "Item C",
        category: {
          id: "3",
          nameFi: "Category C",
          name: "Category C",
        },
      },
    ];

    expect(getEquipmentList(equipment)).toStrictEqual([
      "Item A",
      "Item B",
      "Item C",
    ]);
  });

  test("with equipment out of predefined order", () => {
    const equipment: EquipmentNode[] = [
      {
        id: "1",
        nameFi: "Item A",
        name: "Item A",
        category: {
          id: "1",
          nameFi: "Category C",
          name: "Category C",
        },
      },
      {
        id: "2",
        nameFi: "Item B",
        name: "Item B",
        category: {
          id: "2",
          nameFi: "Category B",
          name: "Category B",
        },
      },
      {
        id: "3",
        nameFi: "Item C",
        name: "Item C",
        category: {
          id: "3",
          nameFi: "Category A",
          name: "Category A",
        },
      },
    ];

    expect(getEquipmentList(equipment)).toStrictEqual([
      "Item A",
      "Item B",
      "Item C",
    ]);
  });

  test("with equipment in predefined order", () => {
    const equipment: EquipmentNode[] = [
      {
        id: "1",
        nameFi: "Item A",
        name: "Item A",
        category: {
          id: "1",
          nameFi: "Liittimet",
          name: "Liittimet",
        },
      },
      {
        id: "2",
        nameFi: "Item B",
        name: "Item B",
        category: {
          id: "2",
          nameFi: "Keittiö",
          name: "Keittiö",
        },
      },
      {
        id: "3",
        nameFi: "Item C 2",
        name: "Item C 2",
        category: {
          id: "3",
          nameFi: "Foobar",
          name: "Foobar",
        },
      },
      {
        id: "4",
        nameFi: "Item D",
        name: "Item D",
        category: {
          id: "4",
          nameFi: "Pelikonsoli",
          name: "Pelikonsoli",
        },
      },
      {
        id: "5",
        nameFi: "Item ABC 2",
        name: "Item ABC 2",
        category: {
          id: "2",
          nameFi: "Keittiö",
          name: "Keittiö",
        },
      },
      {
        id: "6",
        nameFi: "Item ABC 1",
        name: "Item ABC 1",
        category: {
          id: "2",
          nameFi: "Keittiö",
          name: "Keittiö",
        },
      },
      {
        id: "6",
        nameFi: "Item C 1",
        name: "Item C 1",
        category: {
          id: "2",
          nameFi: "Barfoo",
          name: "Barfoo",
        },
      },
    ];

    expect(getEquipmentList(equipment)).toStrictEqual([
      "Item ABC 1",
      "Item ABC 2",
      "Item B",
      "Item D",
      "Item A",
      "Item C 1",
      "Item C 2",
    ]);
  });

  test("without equipment", () => {
    expect(getEquipmentList([])).toStrictEqual([]);
  });
});

describe("getReservationUnitName", () => {
  it("should return the name of the unit", () => {
    const reservationUnit = {
      nameFi: "Unit 1 FI",
      nameEn: "Unit 1 EN",
      nameSv: "Unit 1 SV",
    } as ReservationUnitNode;

    expect(getReservationUnitName(reservationUnit)).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the current language", () => {
    const reservationUnit = {
      nameFi: "Unit 1 FI",
      nameEn: "Unit 1 EN",
      nameSv: "Unit 1 SV",
    } as ReservationUnitNode;

    expect(getReservationUnitName(reservationUnit, "sv")).toEqual("Unit 1 SV");
  });

  it("should return the name of the unit in the default language", () => {
    const reservationUnit = {
      nameFi: "Unit 1 FI",
      nameEn: "",
      nameSv: "",
    };

    expect(getReservationUnitName(reservationUnit, "sv")).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the default language", () => {
    const reservationUnit = {
      nameFi: "Unit 1 FI",
    };

    expect(getReservationUnitName(reservationUnit, "sv")).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the default language", () => {
    const reservationUnit = {
      nameFi: "Unit 1 FI",
      nameEn: null,
      nameSv: null,
    };

    expect(getReservationUnitName(reservationUnit, "sv")).toEqual("Unit 1 FI");
  });
});

describe("getUnitName", () => {
  it("should return the name of the unit", () => {
    const unit = {
      nameFi: "Unit 1 FI",
      nameEn: "Unit 1 EN",
      nameSv: "Unit 1 SV",
    };

    expect(getUnitName(unit)).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the current language", () => {
    const unit = {
      nameFi: "Unit 1 FI",
      nameEn: "Unit 1 EN",
      nameSv: "Unit 1 SV",
    };

    expect(getUnitName(unit, "sv")).toEqual("Unit 1 SV");
  });

  it("should return the name of the unit in the default language", () => {
    const unit = {
      nameFi: "Unit 1 FI",
      nameEn: "",
      nameSv: "",
    };

    expect(getUnitName(unit, "sv")).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the default language", () => {
    const unit = {
      nameFi: "Unit 1 FI",
    };

    expect(getUnitName(unit, "sv")).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the default language", () => {
    const unit = {
      nameFi: "Unit 1 FI",
      nameEn: null,
      nameSv: null,
    };

    expect(getUnitName(unit, "sv")).toEqual("Unit 1 FI");
  });
});

describe("getReservationUnitInstructionsKey", () => {
  it("should return correct key pending states", () => {
    expect(
      getReservationUnitInstructionsKey(ReservationStateChoice.Created)
    ).toEqual("reservationPendingInstructions");
    expect(
      getReservationUnitInstructionsKey(ReservationStateChoice.RequiresHandling)
    ).toEqual("reservationPendingInstructions");
  });

  it("should return correct key cancelled states", () => {
    expect(
      getReservationUnitInstructionsKey(ReservationStateChoice.Cancelled)
    ).toEqual("reservationCancelledInstructions");
  });

  it("should return correct key confirmed states", () => {
    expect(
      getReservationUnitInstructionsKey(ReservationStateChoice.Confirmed)
    ).toEqual("reservationConfirmedInstructions");
  });

  it("should return no key for rest", () => {
    expect(
      getReservationUnitInstructionsKey(ReservationStateChoice.Denied)
    ).toEqual(null);
  });
});

describe("getFuturePricing", () => {
  function constructInput({
    reservationBegins,
    reservationEnds,
    days,
  }: {
    reservationBegins?: Date;
    reservationEnds?: Date;
    days: readonly Date[];
  }) {
    return {
      reservationBegins: reservationBegins?.toISOString() ?? null,
      reservationEnds: reservationEnds?.toISOString() ?? null,
      pricings: days.map((date) =>
        constructPricing({
          begins: date,
          lowestPrice: 0,
          highestPrice: 10,
          status: Status.Future,
          pricingType: PricingType.Paid,
        })
      ),
    };
  }

  const days: readonly Date[] = [
    addDays(new Date(), 10),
    addDays(new Date(), 20),
    addDays(new Date(), 5),
  ];

  test("should sort items correctly", () => {
    const d1 = constructInput({ days });
    expect(getFuturePricing(d1)).toEqual(d1.pricings[2]);
    const d2 = constructInput({ days: days.toReversed() });
    expect(getFuturePricing(d2)).toEqual(d1.pricings[2]);
    const d3 = constructInput({ days: [...days, addDays(new Date(), 1)] });
    expect(getFuturePricing(d3)).toEqual(d3.pricings[3]);
    const d4 = constructInput({ days: [addDays(new Date(), 1), ...days] });
    expect(getFuturePricing(d4)).toEqual(d4.pricings[0]);
  });

  test("should return undefined if no future pricing", () => {
    const data = constructInput({ days });
    expect(getFuturePricing(data)).toEqual(data.pricings[2]);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data.pricings[0]!.status = Status.Past;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data.pricings[1]!.status = Status.Active;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data.pricings[2]!.status = Status.Past;
    expect(getFuturePricing(data)).toBeNull();
  });

  test("with reservation begin time", () => {
    const data = constructInput({ days });
    expect(getFuturePricing(data)).toEqual(data.pricings[2]);

    const d1 = constructInput({
      reservationBegins: addDays(new Date(), 19),
      days,
    });
    expect(getFuturePricing(d1)).toEqual(data.pricings[1]);

    const d2 = constructInput({
      reservationBegins: addDays(new Date(), 20),
      days,
    });
    expect(getFuturePricing(d2)).toBeNull();
  });

  test("with reservation end time", () => {
    const data = constructInput({ days });
    expect(getFuturePricing(data)).toEqual(data.pricings[2]);

    const d1 = constructInput({
      reservationEnds: addDays(new Date(), 1),
      days,
    });
    expect(getFuturePricing(d1)).toBeNull();

    const d2 = constructInput({
      reservationEnds: addDays(new Date(), 5),
      days,
    });
    expect(getFuturePricing(d2)).toEqual(data.pricings[2]);
  });

  test("with both reservation times", () => {
    const data = constructInput({ days });
    if (data.pricings == null || data.pricings.length < 2) {
      throw new Error("Invalid test data");
    }

    expect(getFuturePricing(data)).toEqual(data.pricings[2]);

    data.reservationBegins = addDays(new Date(), 15).toISOString();
    expect(getFuturePricing(data)).toEqual(data.pricings[1]);

    data.reservationEnds = addDays(new Date(), 30).toISOString();
    expect(getFuturePricing(data)).toEqual(data.pricings[1]);
  });

  test("handles active application rounds", () => {
    const data = constructInput({ days });
    const applicationRounds: RoundPeriod[] = [];

    expect(getFuturePricing(data, applicationRounds)).toEqual(data.pricings[2]);

    applicationRounds.push({
      reservationPeriodBegin: addDays(new Date(), 1).toISOString(),
    } as RoundPeriod);
    expect(getFuturePricing(data, applicationRounds)).toEqual(data.pricings[2]);

    applicationRounds[0] = {
      reservationPeriodBegin: addDays(new Date(), 1).toISOString(),
      reservationPeriodEnd: addDays(new Date(), 19).toISOString(),
    };
    expect(getFuturePricing(data, applicationRounds)).toEqual(data.pricings[1]);

    applicationRounds[0] = {
      reservationPeriodBegin: addDays(new Date(), 1).toISOString(),
      reservationPeriodEnd: addDays(new Date(), 20).toISOString(),
    };
    expect(getFuturePricing(data, applicationRounds)).toBeNull();
  });

  test("handles date lookups", () => {
    const data = constructInput({ days });
    const date1 = addDays(new Date(), 15);
    expect(getFuturePricing(data, [], date1)).toEqual(data.pricings[0]);
    const date2 = addDays(new Date(), 5);
    expect(getFuturePricing(data, [], date2)).toEqual(data.pricings[2]);
    const date3 = addDays(new Date(), 20);
    expect(getFuturePricing(data, [], date3)).toEqual(data.pricings[1]);
  });
});

function constructPricing({
  lowestPrice,
  highestPrice,
  taxPercentage,
  begins,
  status,
  pricingType,
  priceUnit,
}: {
  begins?: Date;
  lowestPrice?: number;
  highestPrice?: number;
  taxPercentage?: number;
  status?: Status;
  pricingType?: PricingType;
  priceUnit?: PriceUnit;
}): NonNullable<PriceReservationUnitFragment>["pricings"][0] {
  const p = highestPrice ?? lowestPrice ?? 0;
  return {
    id: "1",
    begins: toApiDateUnsafe(begins ?? new Date()),
    pricingType: pricingType ?? PricingType.Paid,
    priceUnit: priceUnit ?? PriceUnit.PerHour,
    lowestPrice: lowestPrice?.toString() ?? p.toString(),
    highestPrice: highestPrice?.toString() ?? p.toString(),
    taxPercentage: {
      id: "1",
      value: (taxPercentage ?? 24).toString(),
    },
    status: status ?? Status.Future,
  };
}

describe("getReservationUnitPrice", () => {
  function connstructInput({
    date,
  }: {
    date: Date;
  }): GetReservationUnitPriceProps {
    return {
      pricingDate: date,
      reservationUnit: {
        pricings: [
          constructPricing({
            begins: addDays(new Date(), 10),
            lowestPrice: 10,
            highestPrice: 20,
            taxPercentage: 24,
          }),
          constructPricing({
            begins: addDays(new Date(), 20),
            lowestPrice: 20,
            highestPrice: 30,
            taxPercentage: 24,
          }),
          constructPricing({
            begins: addDays(new Date(), 5),
            lowestPrice: 40,
            highestPrice: 50,
            taxPercentage: 24,
          }),
          constructPricing({
            begins: addDays(new Date(), 5),
            lowestPrice: 0,
            highestPrice: 10,
            taxPercentage: 24,
            status: Status.Active,
          }),
        ],
      },
    };
  }

  test("returns future data based on date lookup", () => {
    const input = connstructInput({ date: addDays(new Date(), 5) });
    expect(getReservationUnitPrice(input)).toEqual("40,00 - 50,00 € / tunti");

    const input2 = connstructInput({ date: addDays(new Date(), 11) });
    expect(getReservationUnitPrice(input2)).toEqual("10,00 - 20,00 € / tunti");
  });

  test.todo("Tax change should work");
});

describe("isReservationUnitPaidInFuture", () => {
  it("return true if active and future are paid", () => {
    const pricings = [
      constructPricing({
        begins: addDays(new Date(), 10),
        lowestPrice: 0,
        highestPrice: 20,
        status: Status.Future,
      }),
      constructPricing({
        begins: addDays(new Date(), 20),
        lowestPrice: 0,
        highestPrice: 10,
        status: Status.Active,
      }),
    ];

    expect(isReservationUnitPaidInFuture(pricings)).toBe(true);
  });

  it("return true if only active is paid", () => {
    const pricings = [
      constructPricing({
        begins: addDays(new Date(), 10),
        lowestPrice: 0,
        highestPrice: 0,
        status: Status.Future,
        pricingType: PricingType.Free,
      }),
      constructPricing({
        begins: addDays(new Date(), 20),
        lowestPrice: 0,
        highestPrice: 10,
        status: Status.Active,
      }),
    ];

    expect(isReservationUnitPaidInFuture(pricings)).toBe(true);
  });

  it("return true if only future one paid", () => {
    const pricings = [
      constructPricing({
        begins: addDays(new Date(), -10),
        lowestPrice: 0,
        highestPrice: 0,
        status: Status.Active,
        pricingType: PricingType.Free,
      }),
      constructPricing({
        begins: addDays(new Date(), 20),
        lowestPrice: 0,
        highestPrice: 20,
        status: Status.Future,
      }),
    ];

    expect(isReservationUnitPaidInFuture(pricings)).toBe(true);
  });

  it("returns false if future one if paid but price is set in zero", () => {
    const pricings = [
      constructPricing({
        begins: addDays(new Date(), 10),
        lowestPrice: 0,
        highestPrice: 0,
        status: Status.Future,
      }),
      constructPricing({
        begins: addDays(new Date(), 20),
        lowestPrice: 0,
        highestPrice: 0,
        status: Status.Active,
        pricingType: PricingType.Free,
      }),
    ];

    expect(isReservationUnitPaidInFuture(pricings)).toBe(false);
  });

  it("returns false all are free", () => {
    const pricings = [
      constructPricing({
        begins: addDays(new Date(), 10),
        lowestPrice: 0,
        highestPrice: 20,
        status: Status.Future,
        pricingType: PricingType.Free,
      }),
      constructPricing({
        begins: addDays(new Date(), 20),
        lowestPrice: 0,
        highestPrice: 20,
        status: Status.Active,
        pricingType: PricingType.Free,
      }),
    ];

    expect(isReservationUnitPaidInFuture(pricings)).toBe(false);
  });
});

describe("isReservationUnitReservable", () => {
  function constructReservationUnitNode({
    minReservationDuration = 3600,
    maxReservationDuration = 3600,
    reservationState = ReservationState.Reservable,
  }: {
    minReservationDuration?: number;
    maxReservationDuration?: number;
    reservationState?: ReservationState;
  }) {
    const date = new Date().toISOString().split("T")[0];
    const reservationUnit: ReservationUnitNode = {
      pk: 1,
      id: base64encode("ReservationUnitNode:1"),
      allowReservationsWithoutOpeningHours: true,
      applicationRoundTimeSlots: [],
      applicationRounds: [],
      bufferTimeAfter: 0,
      bufferTimeBefore: 0,
      authentication: Authentication.Strong,
      canApplyFreeOfCharge: false,
      contactInformation: "",
      description: "",
      equipments: [],
      images: [],
      isArchived: false,
      isDraft: false,
      name: "",
      paymentTypes: [],
      pricings: [],
      purposes: [],
      qualifiers: [],
      requireIntroduction: false,
      requireReservationHandling: false,
      reservationBlockWholeDay: false,
      reservationCancelledInstructions: "",
      reservationConfirmedInstructions: "",
      reservationKind: ReservationKind.Direct,
      reservationPendingInstructions: "",
      reservationStartInterval: ReservationStartInterval.Interval_15Mins,
      resources: [],
      services: [],
      spaces: [],
      maxPersons: 10,
      uuid: "be4fa7a2-05b7-11ee-be56-0242ac120004",
      minReservationDuration,
      maxReservationDuration,
      metadataSet: {
        id: "1234",
        name: "metadata",
        supportedFields: [
          {
            id: "1234",
            fieldName: "name",
          },
        ],
        requiredFields: [] as const,
      },
      reservationState,
      reservableTimeSpans: [
        {
          startDatetime: `${date}T04:00:00+00:00`,
          endDatetime: `${date}T20:00:00+00:00`,
        },
      ],
    };
    return reservationUnit;
  }

  test("returns true for a unit that is reservable", () => {
    const [res1] = isReservationUnitReservable(
      constructReservationUnitNode({})
    );
    expect(res1).toBe(true);

    const [res2] = isReservationUnitReservable(
      constructReservationUnitNode({
        reservationState: ReservationState.ScheduledClosing,
      })
    );
    expect(res2).toBe(true);
  });

  test("returns false for a unit that is not reservable", () => {
    const [res1] = isReservationUnitReservable({
      ...constructReservationUnitNode({}),
      reservableTimeSpans: undefined,
      reservationState: ReservationState.ReservationClosed,
    });
    expect(res1).toBe(false);

    const [res2] = isReservationUnitReservable({
      ...constructReservationUnitNode({}),
      reservationState: ReservationState.ReservationClosed,
    });
    expect(res2).toBe(false);

    const [res5] = isReservationUnitReservable({
      ...constructReservationUnitNode({}),
      reservationState: ReservationState.ScheduledReservation,
    });
    expect(res5).toBe(false);

    const [res6] = isReservationUnitReservable({
      ...constructReservationUnitNode({}),
      reservationState: ReservationState.ScheduledPeriod,
    });
    expect(res6).toBe(false);
  });

  test("returns correct value with buffer days", () => {
    const [res1] = isReservationUnitReservable({
      ...constructReservationUnitNode({}),
      reservationBegins: addDays(new Date(), 5).toISOString(),
      reservationsMaxDaysBefore: 5,
    });
    expect(res1).toBe(false);

    const [res2] = isReservationUnitReservable({
      ...constructReservationUnitNode({}),
      reservationBegins: addDays(new Date(), 5).toISOString(),
      reservationsMaxDaysBefore: 4,
      reservableTimeSpans: undefined,
    });
    expect(res2).toBe(false);
  });
});

describe("getDayIntervals", () => {
  test("getDayIntervals from 9 to 17 with 30 min interval", () => {
    const input = {
      startTime: { h: 9, m: 0 },
      endTime: { h: 17, m: 0 },
      interval: ReservationStartInterval.Interval_30Mins,
    };
    const output: { h: number; m: number }[] = [];
    for (let i = 9; i < 17; i++) {
      output.push({ h: i, m: 0 });
      output.push({ h: i, m: 30 });
    }
    const res = getDayIntervals(input.startTime, input.endTime, input.interval);
    expect(res).toEqual(output);
  });
  test("getDayIntervals from 9 to 17 with 15 min interval", () => {
    const input = {
      startTime: { h: 9, m: 0 },
      endTime: { h: 17, m: 0 },
      interval: ReservationStartInterval.Interval_15Mins,
    };
    const output: { h: number; m: number }[] = [];
    for (let i = 9; i < 17; i++) {
      output.push({ h: i, m: 0 });
      output.push({ h: i, m: 15 });
      output.push({ h: i, m: 30 });
      output.push({ h: i, m: 45 });
    }
    const res = getDayIntervals(input.startTime, input.endTime, input.interval);
    expect(res).toEqual(output);
  });
  test("getDayIntervals from 9 to 17 with 60 min interval", () => {
    const input = {
      startTime: { h: 9, m: 0 },
      endTime: { h: 17, m: 0 },
      interval: ReservationStartInterval.Interval_60Mins,
    };
    const output: { h: number; m: number }[] = [];
    for (let i = 9; i < 17; i++) {
      output.push({ h: i, m: 0 });
    }
    const res = getDayIntervals(input.startTime, input.endTime, input.interval);
    expect(res).toEqual(output);
  });
  test("getDayIntervals from 0 to 24 with 30 min interval", () => {
    const input = {
      startTime: { h: 0, m: 0 },
      endTime: { h: 24, m: 0 },
      interval: ReservationStartInterval.Interval_30Mins,
    };
    const output: { h: number; m: number }[] = [];
    for (let i = 0; i < 24; i++) {
      output.push({ h: i, m: 0 });
      output.push({ h: i, m: 30 });
    }
    const res = getDayIntervals(input.startTime, input.endTime, input.interval);
    expect(res).toEqual(output);
  });
  test("getDayIntervals with invalid range", () => {
    const input = {
      startTime: { h: 17, m: 0 },
      endTime: { h: 9, m: 0 },
      interval: ReservationStartInterval.Interval_30Mins,
    };
    const res = getDayIntervals(input.startTime, input.endTime, input.interval);
    expect(res).toEqual([]);
  });
  test("getDayIntervals with 0 size range", () => {
    const input = {
      startTime: { h: 17, m: 0 },
      endTime: { h: 17, m: 0 },
      interval: ReservationStartInterval.Interval_30Mins,
    };
    const res = getDayIntervals(input.startTime, input.endTime, input.interval);
    expect(res).toEqual([]);
  });
  test("getDayIntervals with uneven times", () => {
    const input = {
      startTime: { h: 9, m: 20 },
      endTime: { h: 17, m: 20 },
      interval: ReservationStartInterval.Interval_30Mins,
    };
    const output: { h: number; m: number }[] = [];
    for (let i = 9; i < 17; i++) {
      output.push({ h: i, m: 20 });
      output.push({ h: i, m: 50 });
    }
    const res = getDayIntervals(input.startTime, input.endTime, input.interval);
    expect(res).toEqual(output);
  });
  test("getDayIntervals with uneven times", () => {
    const input = {
      startTime: { h: 9, m: 20 },
      endTime: { h: 17, m: 0 },
      interval: ReservationStartInterval.Interval_30Mins,
    };
    const output: { h: number; m: number }[] = [];
    for (let i = 9; i < 17; i++) {
      output.push({ h: i, m: 20 });
      if (i < 16) {
        output.push({ h: i, m: 50 });
      }
    }
    const res = getDayIntervals(input.startTime, input.endTime, input.interval);
    expect(res).toEqual(output);
  });
});
