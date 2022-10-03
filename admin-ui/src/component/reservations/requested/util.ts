import {
  formatters as getFormatters,
  getReservationPrice,
  getUnRoundedReservationVolume,
} from "common";

import {
  differenceInHours,
  differenceInMinutes,
  isSameDay,
  parse,
} from "date-fns";
import { TFunction } from "i18next";
import {
  AgeGroupType,
  Maybe,
  ReservationsReservationReserveeTypeChoices,
  ReservationType,
  ReservationUnitType,
  ReservationUnitPricingType,
  ReservationUnitsReservationUnitPricingPricingTypeChoices,
  ReservationUnitsReservationUnitPricingPriceUnitChoices,
} from "../../../common/gql-types";
import { formatDate, formatTime } from "../../../common/util";

export const reservationDateTime = (
  start: string,
  end: string,
  t: TFunction
): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = t(`dayShort.${startDate.getDay()}`);

  const endTimeFormat = endDate.getMinutes() === 0 ? "HH" : "HH:mm";
  const startTimeFormat = startDate.getMinutes() === 0 ? "HH" : "HH:mm";
  return isSameDay(startDate, endDate)
    ? `${startDay} ${formatDate(start)} klo ${formatTime(
        start,
        startTimeFormat
      )} - ${formatTime(end, endTimeFormat)}`
    : `${formatDate(start)} klo ${formatTime(
        start,
        startTimeFormat
      )} - ${formatDate(end, endTimeFormat)} klo ${formatTime(end)}`;
};

export const reservationDuration = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return `${differenceInHours(endDate, startDate)}`;
};

export const reservationUnitName = (
  reservationUnit: Maybe<ReservationUnitType>
): string =>
  reservationUnit
    ? `${reservationUnit.nameFi}, ${reservationUnit.unit?.nameFi || ""}`
    : "-";

export const reservationPrice = (
  reservation: ReservationType,
  t: TFunction
): string => {
  return getReservationPrice(
    reservation.price as number,
    t("RequestedReservation.noPrice")
  );
};

const parseDate = (date: string) => parse(date, "yyyy-MM-dd", new Date());

/** returns reservation unit pricing at given date */
export const getReservatinUnitPricing = (
  reservationUnit: ReservationUnitType,
  datetime: string
): ReservationUnitPricingType => {
  const reservationDate = parseDate(datetime);
  reservationUnit.pricings?.sort(
    (a, b) => parseDate(b?.begins).getTime() - parseDate(a?.begins).getTime()
  );

  console.log("sorted", reservationUnit.pricings);

  const defaultPrice = {
    begins: "1970-01-01",
    pricingType: ReservationUnitsReservationUnitPricingPricingTypeChoices.Free,
  } as ReservationUnitPricingType;

  if (!reservationUnit.pricings) {
    return defaultPrice;
  }

  return (
    (reservationUnit.pricings || []) as ReservationUnitPricingType[]
  ).reduce((prev, current) => {
    if (parseDate(current?.begins) < reservationDate) {
      return current;
    }
    return prev;
  }, defaultPrice);
};

export const getReservationPriceDetails = (
  reservation: ReservationType,
  t: TFunction
): string => {
  const durationMinutes = differenceInMinutes(
    new Date(reservation.end),
    new Date(reservation.begin)
  );

  const pricing = getReservatinUnitPricing(
    reservation.reservationUnits?.[0] as ReservationUnitType,
    reservation.begin
  );

  const { priceUnit } = pricing;
  const volume = getUnRoundedReservationVolume(
    durationMinutes,
    priceUnit as string
  );

  const maxPrice =
    pricing.pricingType ===
    ReservationUnitsReservationUnitPricingPricingTypeChoices.Paid
      ? pricing.highestPrice
      : 0;
  const formatters = getFormatters("fi");

  return priceUnit ===
    ReservationUnitsReservationUnitPricingPriceUnitChoices.Fixed
    ? getReservationPrice(maxPrice, t("RequestedReservation.noPrice"))
    : t("RequestedReservation.ApproveDialog.priceBreakdown", {
        volume: formatters.strippedDecimal.format(volume),
        units: t(`RequestedReservation.ApproveDialog.priceUnits.${priceUnit}`),
        vatPercent: formatters.whole.format(reservation.taxPercentageValue),
        unit: t(`RequestedReservation.ApproveDialog.priceUnit.${priceUnit}`),
        unitPrice: getReservationPrice(maxPrice, ""),
        price: getReservationPrice(
          volume * maxPrice,
          t("RequestedReservation.noPrice"),
          "fi"
        ),
      });
};

export const ageGroup = (
  group: Maybe<AgeGroupType> | undefined
): string | null => (group ? `${group.minimum}-${group.maximum || ""}` : null);

export const getTranslationKeyForType = (
  type: ReservationsReservationReserveeTypeChoices,
  isUnregisteredAssociation: boolean
): string => {
  switch (type) {
    case ReservationsReservationReserveeTypeChoices.Business:
    case ReservationsReservationReserveeTypeChoices.Individual: {
      return `ReserveeType.${type}`;
    }
    default:
      return `ReserveeType.${type}.${
        isUnregisteredAssociation ? "UNREGISTERED" : "REGISTERED"
      }`;
  }
};
