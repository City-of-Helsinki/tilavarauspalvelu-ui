import { graphql } from "msw";
import { ReservationUnit, OpeningHours, OpeningTime } from "../modules/types";

type Variables = {
  pk: number;
};

type ReturnType = {
  reservationUnit: ReservationUnit;
};

type OpeningHoursReturnVariables = {
  pk: number;
  openingHoursFrom: string;
  openingHoursTo: string;
};

type OpeningHoursReturnType = {
  reservationUnit: OpeningHours;
};

export const handlers = [
  graphql.query<ReturnType, Variables>(
    "SelectedReservationUnit",
    async (req, res, ctx) => {
      const { pk: id } = req.variables;

      const response = id
        ? await import(`../cypress/fixtures/query/reservationUnit/${id}.json`)
        : Promise.resolve();

      const reservationUnit = await response;
      return res(ctx.data({ reservationUnit }));
    }
  ),
  graphql.query<OpeningHoursReturnType, OpeningHoursReturnVariables>(
    "ReservationUnitOpeningHours",
    async (req, res, ctx) => {
      const { pk: id, openingHoursFrom, openingHoursTo } = req.variables;

      const response = id
        ? await import(
            `../cypress/fixtures/query/reservationUnitOpeningHours/${id}.json`
          )
        : Promise.resolve();

      const reservationUnitOpeningHours = await response;

      const openingTimes: OpeningTime[] =
        reservationUnitOpeningHours.data.reservationUnit.openingHours.openingTimes.filter(
          (openingTime: OpeningTime) => {
            return (
              openingTime.date >= openingHoursFrom &&
              openingTime.date <= openingHoursTo
            );
          }
        );

      return res(
        ctx.data({
          reservationUnit: { openingHours: { openingTimes } } as OpeningHours,
        })
      );
    }
  ),
];
