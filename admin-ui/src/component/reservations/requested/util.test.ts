import { get } from "lodash";
import { getReservatinUnitPricing, getReservationPriceDetails } from "./util";
import {
  ReservationType,
  ReservationUnitPricingType,
  ReservationUnitsReservationUnitPriceUnitChoices,
  ReservationUnitsReservationUnitPricingPriceUnitChoices,
  ReservationUnitsReservationUnitPricingPricingTypeChoices,
  ReservationUnitsReservationUnitPricingStatusChoices,
  ReservationUnitType,
} from "../../../common/gql-types";
import { getReservationPrice } from "common";

describe("pricingDetails", () => {
  test("renders fixed price", () => {
    const r = {
      begin: "2022-01-01T10:00:00Z",
      end: "2022-01-01T11:00:00Z",
      reservationUnits: [
        {
          pricings: [
            {
              begins: "2022-01-01",
              pricingType:
                ReservationUnitsReservationUnitPricingPricingTypeChoices.Paid,
              id: 1,
              priceUnit:
                ReservationUnitsReservationUnitPricingPriceUnitChoices.Fixed,
              lowestPrice: 120,
              highestPrice: 120,
              taxPercentage: {
                id: "1",
                value: "2",
              },
              status:
                ReservationUnitsReservationUnitPricingStatusChoices.Active,
            } as ReservationUnitPricingType,
          ],
        } as ReservationUnitType,
      ],
    } as ReservationType;

    expect(getReservationPriceDetails(r, (t) => t)).toEqual("120 €");
  });

  test("renders price in hours", () => {
    const r = {
      begin: "2022-01-01T10:00:00Z",
      end: "2022-01-01T11:30:00Z",
      reservationUnits: [
        {
          pricings: [
            {
              begins: "2022-01-01",
              pricingType:
                ReservationUnitsReservationUnitPricingPricingTypeChoices.Paid,
              id: 1,
              priceUnit:
                ReservationUnitsReservationUnitPricingPriceUnitChoices.PerHour,
              lowestPrice: 120,
              highestPrice: 120,
              taxPercentage: {
                id: "1",
                value: "24",
              },
              status:
                ReservationUnitsReservationUnitPricingStatusChoices.Active,
            } as ReservationUnitPricingType,
          ],
        } as ReservationUnitType,
      ],
    } as ReservationType;

    expect(getReservationPriceDetails(r, (t, a) => get(a, "price"))).toEqual(
      "180 €"
    );
    expect(getReservationPriceDetails(r, (t, a) => get(a, "volume"))).toEqual(
      "1,5"
    );
  });
});

describe("getReservatinUnitPricing", () => {
  test("getReservatinUnitPricing", () => {
    const reservationUnit = {
      pricings: [
        {
          begins: "2022-01-01",
          pricingType:
            ReservationUnitsReservationUnitPricingPricingTypeChoices.Paid,
          id: 1,
          priceUnit:
            ReservationUnitsReservationUnitPricingPriceUnitChoices.PerHour,
          lowestPrice: 120,
          highestPrice: 120,
          taxPercentage: {
            id: "1",
            value: "24",
          },
          status: ReservationUnitsReservationUnitPricingStatusChoices.Active,
        } as ReservationUnitPricingType,
      ],
    } as ReservationUnitType;

    const activePricing = getReservatinUnitPricing(
      reservationUnit,
      "2022-01-01"
    );

    expect(activePricing.pricingType).toBe(
      ReservationUnitsReservationUnitPricingPricingTypeChoices.Paid
    );
  });
});
