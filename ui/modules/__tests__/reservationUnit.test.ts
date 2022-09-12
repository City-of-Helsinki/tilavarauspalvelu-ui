import { get as mockGet } from "lodash";
import { addMinutes } from "date-fns";
import { ReservationState, ReservationUnit } from "common/types/common";
import {
  EquipmentType,
  ReservationsReservationStateChoices,
  ReservationUnitByPkType,
  ReservationUnitType,
  UnitType,
} from "../gql-types";
import {
  getEquipmentCategories,
  getEquipmentList,
  getOldReservationUnitName,
  getPrice,
  getReservationUnitInstructionsKey,
  getReservationUnitName,
  getUnitName,
  isReservationUnitPublished,
} from "../reservationUnit";
import mockTranslations from "../../public/locales/fi/prices.json";

jest.mock("next/config", () => () => ({
  serverRuntimeConfig: {},
  publicRuntimeConfig: {},
}));

jest.mock("next-i18next", () => ({
  i18n: {
    t: (str: string) => {
      const path = str.replace("prices:", "");
      return mockGet(mockTranslations, path);
    },
    language: "fi",
  },
}));

describe("getPrice", () => {
  test("price range", () => {
    const reservationUnit = {
      lowestPrice: 10,
      highestPrice: 50.5,
      priceUnit: "PER_15_MINS",
    };

    expect(getPrice(reservationUnit as ReservationUnitByPkType)).toBe(
      "10 - 50,5 € / 15 min"
    );
  });

  test("price range with no min", () => {
    const reservationUnit = {
      lowestPrice: 0.0,
      highestPrice: 50.5,
      priceUnit: "PER_15_MINS",
    };

    expect(getPrice(reservationUnit as ReservationUnitByPkType)).toBe(
      "0 - 50,5 € / 15 min"
    );
  });

  test("fixed price", () => {
    const reservationUnit = {
      lowestPrice: 50,
      highestPrice: 50,
      priceUnit: "FIXED",
    };

    expect(getPrice(reservationUnit as ReservationUnitByPkType)).toBe("50 €");
  });

  test("fixed price with decimals", () => {
    const reservationUnit = {
      lowestPrice: 50,
      highestPrice: 50,
      priceUnit: "FIXED",
    };

    expect(
      getPrice(reservationUnit as ReservationUnitByPkType, undefined, true)
    ).toBe("50,00 €");
  });

  test("no price", () => {
    const reservationUnit = {
      priceUnit: "FIXED",
    };

    expect(getPrice(reservationUnit as ReservationUnitByPkType)).toBe(
      "Maksuton"
    );
  });

  test("total price with minutes", () => {
    const reservationUnit = {
      lowestPrice: 0.0,
      highestPrice: 50.5,
      priceUnit: "PER_15_MINS",
    };

    expect(getPrice(reservationUnit as ReservationUnitByPkType, 180)).toBe(
      "0 - 606 €"
    );
  });

  test("total price with minutes and decimals", () => {
    const reservationUnit = {
      lowestPrice: 0.0,
      highestPrice: 50.5,
      priceUnit: "PER_15_MINS",
    };

    expect(
      getPrice(reservationUnit as ReservationUnitByPkType, 180, true)
    ).toBe("0 - 606,00 €");
  });
});

describe("isReservationPublished", () => {
  expect(isReservationUnitPublished({} as ReservationUnitByPkType)).toBe(true);

  test("with just publishBegins", () => {
    expect(
      isReservationUnitPublished({
        publishBegins: addMinutes(new Date(), -1),
      } as ReservationUnitByPkType)
    ).toBe(true);

    expect(
      isReservationUnitPublished({
        publishBegins: addMinutes(new Date(), 1),
      } as ReservationUnitByPkType)
    ).toBe(false);

    expect(
      isReservationUnitPublished({
        publishBegins: new Date(),
      } as ReservationUnitByPkType)
    ).toBe(true);
  });

  test("with just publishEnds", () => {
    expect(
      isReservationUnitPublished({
        publishEnds: addMinutes(new Date(), -1),
      } as ReservationUnitByPkType)
    ).toBe(false);

    expect(
      isReservationUnitPublished({
        publishEnds: addMinutes(new Date(), 1),
      } as ReservationUnitByPkType)
    ).toBe(true);

    expect(
      isReservationUnitPublished({
        publishEnds: new Date(),
      } as ReservationUnitByPkType)
    ).toBe(true);
  });

  test("with both dates", () => {
    expect(
      isReservationUnitPublished({
        publishBegins: new Date(),
        publishEnds: new Date(),
      } as ReservationUnitByPkType)
    ).toBe(true);

    expect(
      isReservationUnitPublished({
        publishBegins: addMinutes(new Date(), -1),
        publishEnds: new Date(),
      } as ReservationUnitByPkType)
    ).toBe(true);

    expect(
      isReservationUnitPublished({
        publishBegins: addMinutes(new Date(), 1),
        publishEnds: new Date(),
      } as ReservationUnitByPkType)
    ).toBe(false);

    expect(
      isReservationUnitPublished({
        publishBegins: new Date(),
        publishEnds: addMinutes(new Date(), -1),
      } as ReservationUnitByPkType)
    ).toBe(false);

    expect(
      isReservationUnitPublished({
        publishBegins: new Date(),
        publishEnds: addMinutes(new Date(), 1),
      } as ReservationUnitByPkType)
    ).toBe(true);
  });
});

describe("getEquipmentCategories", () => {
  test("with equipment out of predefined order", () => {
    const equipment: EquipmentType[] = [
      {
        id: "1",
        nameFi: "Item A",
        category: {
          id: "1",
          nameFi: "Category A",
        },
      },
      {
        id: "2",
        nameFi: "Item B",
        category: {
          id: "2",
          nameFi: "Category B",
        },
      },
      {
        id: "3",
        nameFi: "Item C",
        category: {
          id: "3",
          nameFi: "Category C",
        },
      },
    ];

    expect(getEquipmentCategories(equipment)).toStrictEqual(["Muu"]);
  });

  test("with equipment in predefined order", () => {
    const equipment: EquipmentType[] = [
      {
        id: "1",
        nameFi: "Item A",
        category: {
          id: "1",
          nameFi: "Liittimet",
        },
      },
      {
        id: "2",
        nameFi: "Item B",
        category: {
          id: "2",
          nameFi: "Keittiö",
        },
      },
      {
        id: "3",
        nameFi: "Item C",
        category: {
          id: "3",
          nameFi: "Foobar",
        },
      },
      {
        id: "4",
        nameFi: "Item D",
        category: {
          id: "4",
          nameFi: "Pelikonsoli",
        },
      },
      {
        id: "5",
        nameFi: "Item ABC 2",
        category: {
          id: "2",
          nameFi: "Keittiö",
        },
      },
      {
        id: "6",
        nameFi: "Item ABC 1",
        category: {
          id: "2",
          nameFi: "Keittiö",
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
    const equipment: EquipmentType[] = [
      {
        id: "1",
        nameFi: "Item A",
        category: {
          id: "1",
          nameFi: "Category A",
        },
      },
      {
        id: "2",
        nameFi: "Item B",
        category: {
          id: "2",
          nameFi: "Category B",
        },
      },
      {
        id: "3",
        nameFi: "Item C",
        category: {
          id: "3",
          nameFi: "Category C",
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
    const equipment: EquipmentType[] = [
      {
        id: "1",
        nameFi: "Item A",
        category: {
          id: "1",
          nameFi: "Category C",
        },
      },
      {
        id: "2",
        nameFi: "Item B",
        category: {
          id: "2",
          nameFi: "Category B",
        },
      },
      {
        id: "3",
        nameFi: "Item C",
        category: {
          id: "3",
          nameFi: "Category A",
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
    const equipment: EquipmentType[] = [
      {
        id: "1",
        nameFi: "Item A",
        category: {
          id: "1",
          nameFi: "Liittimet",
        },
      },
      {
        id: "2",
        nameFi: "Item B",
        category: {
          id: "2",
          nameFi: "Keittiö",
        },
      },
      {
        id: "3",
        nameFi: "Item C 2",
        category: {
          id: "3",
          nameFi: "Foobar",
        },
      },
      {
        id: "4",
        nameFi: "Item D",
        category: {
          id: "4",
          nameFi: "Pelikonsoli",
        },
      },
      {
        id: "5",
        nameFi: "Item ABC 2",
        category: {
          id: "2",
          nameFi: "Keittiö",
        },
      },
      {
        id: "6",
        nameFi: "Item ABC 1",
        category: {
          id: "2",
          nameFi: "Keittiö",
        },
      },
      {
        id: "6",
        nameFi: "Item C 1",
        category: {
          id: "2",
          nameFi: "Barfoo",
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
    } as ReservationUnitType;

    expect(getReservationUnitName(reservationUnit)).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the current language", () => {
    const reservationUnit = {
      nameFi: "Unit 1 FI",
      nameEn: "Unit 1 EN",
      nameSv: "Unit 1 SV",
    } as ReservationUnitType;

    expect(getReservationUnitName(reservationUnit, "sv")).toEqual("Unit 1 SV");
  });

  it("should return the name of the unit in the default language", () => {
    const reservationUnit = {
      nameFi: "Unit 1 FI",
      nameEn: "",
      nameSv: "",
    } as ReservationUnitType;

    expect(getReservationUnitName(reservationUnit, "sv")).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the default language", () => {
    const reservationUnit = {
      nameFi: "Unit 1 FI",
    } as ReservationUnitType;

    expect(getReservationUnitName(reservationUnit, "sv")).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the default language", () => {
    const reservationUnit = {
      nameFi: "Unit 1 FI",
      nameEn: null,
      nameSv: null,
    } as ReservationUnitType;

    expect(getReservationUnitName(reservationUnit, "sv")).toEqual("Unit 1 FI");
  });
});

describe("getOldReservationUnitName", () => {
  it("should return the name of the unit", () => {
    const reservationUnit = {
      name: {
        fi: "Unit 1 FI",
        en: "Unit 1 EN",
        sv: "Unit 1 SV",
      },
    } as ReservationUnit;

    expect(getOldReservationUnitName(reservationUnit)).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the current language", () => {
    const reservationUnit = {
      name: {
        fi: "Unit 1 FI",
        en: "Unit 1 EN",
        sv: "Unit 1 SV",
      },
    } as ReservationUnit;

    expect(getOldReservationUnitName(reservationUnit, "sv")).toEqual(
      "Unit 1 SV"
    );
  });

  it("should return the name of the unit in the default language", () => {
    const reservationUnit = {
      name: {
        fi: "Unit 1 FI",
        en: "",
        sv: "",
      },
    } as ReservationUnit;

    expect(getOldReservationUnitName(reservationUnit, "sv")).toEqual(
      "Unit 1 FI"
    );
  });

  it("should return the name of the unit in the default language", () => {
    const reservationUnit = {
      name: {
        fi: "Unit 1 FI",
      },
    } as ReservationUnit;

    expect(getOldReservationUnitName(reservationUnit, "sv")).toEqual(
      "Unit 1 FI"
    );
  });

  it("should return the name of the unit in the default language", () => {
    const reservationUnit = {
      name: {
        fi: "Unit 1 FI",
        en: null,
        sv: null,
      },
    } as ReservationUnit;

    expect(getOldReservationUnitName(reservationUnit, "sv")).toEqual(
      "Unit 1 FI"
    );
  });
});

describe("getUnitName", () => {
  it("should return the name of the unit", () => {
    const unit = {
      nameFi: "Unit 1 FI",
      nameEn: "Unit 1 EN",
      nameSv: "Unit 1 SV",
    } as UnitType;

    expect(getUnitName(unit)).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the current language", () => {
    const unit = {
      nameFi: "Unit 1 FI",
      nameEn: "Unit 1 EN",
      nameSv: "Unit 1 SV",
    } as UnitType;

    expect(getUnitName(unit, "sv")).toEqual("Unit 1 SV");
  });

  it("should return the name of the unit in the default language", () => {
    const unit = {
      nameFi: "Unit 1 FI",
      nameEn: "",
      nameSv: "",
    } as UnitType;

    expect(getUnitName(unit, "sv")).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the default language", () => {
    const unit = {
      nameFi: "Unit 1 FI",
    } as UnitType;

    expect(getUnitName(unit, "sv")).toEqual("Unit 1 FI");
  });

  it("should return the name of the unit in the default language", () => {
    const unit = {
      nameFi: "Unit 1 FI",
      nameEn: null,
      nameSv: null,
    } as UnitType;

    expect(getUnitName(unit, "sv")).toEqual("Unit 1 FI");
  });
});

describe("getReservationUnitInstructionsKey", () => {
  it("should return correct key pending states", () => {
    expect(getReservationUnitInstructionsKey("initial")).toEqual(
      "reservationPendingInstructions"
    );
    expect(getReservationUnitInstructionsKey("created")).toEqual(
      "reservationPendingInstructions"
    );
    expect(getReservationUnitInstructionsKey("requested")).toEqual(
      "reservationPendingInstructions"
    );
    expect(getReservationUnitInstructionsKey("waiting for payment")).toEqual(
      "reservationPendingInstructions"
    );
    expect(
      getReservationUnitInstructionsKey(
        ReservationsReservationStateChoices.Created
      )
    ).toEqual("reservationPendingInstructions");
    expect(
      getReservationUnitInstructionsKey(
        ReservationsReservationStateChoices.RequiresHandling
      )
    ).toEqual("reservationPendingInstructions");
  });

  it("should return correct key cancelled states", () => {
    expect(getReservationUnitInstructionsKey("cancelled")).toEqual(
      "reservationCancelledInstructions"
    );
    expect(
      getReservationUnitInstructionsKey(
        ReservationsReservationStateChoices.Cancelled
      )
    ).toEqual("reservationCancelledInstructions");
  });

  it("should return correct key confirmed states", () => {
    expect(getReservationUnitInstructionsKey("confirmed")).toEqual(
      "reservationConfirmedInstructions"
    );
    expect(
      getReservationUnitInstructionsKey(
        ReservationsReservationStateChoices.Confirmed
      )
    ).toEqual("reservationConfirmedInstructions");
  });

  it("should return no key for rest", () => {
    expect(getReservationUnitInstructionsKey("denied")).toEqual(null);
    expect(
      getReservationUnitInstructionsKey(
        ReservationsReservationStateChoices.Denied
      )
    ).toEqual(null);
    expect(getReservationUnitInstructionsKey("" as ReservationState)).toEqual(
      null
    );
  });
});
