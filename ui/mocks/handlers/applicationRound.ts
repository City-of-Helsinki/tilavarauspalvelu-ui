import { addDays, addMonths } from "date-fns";
import { graphql } from "msw";
import {
  Query,
  ApplicationRoundTypeConnection,
  QueryApplicationRoundsArgs,
  ReservationUnitType,
  Status,
} from "../../modules/gql-types";
import { toApiDate } from "../../modules/util";

const applicationRounds = graphql.query<Query, QueryApplicationRoundsArgs>(
  "ApplicationRounds",
  async (req, res, ctx) => {
    const result: ApplicationRoundTypeConnection = {
      edges: [
        {
          node: {
            id: "fq02394feaw",
            pk: 2,
            nameFi:
              "Ruoholahden nuorisotalon vakiovuorot syksy 2021 - kevät 2022 FI",
            nameEn:
              "Ruoholahden nuorisotalon vakiovuorot syksy 2021 - kevät 2022 EN",
            nameSv:
              "Ruoholahden nuorisotalon vakiovuorot syksy 2021 - kevät 2022 SV",
            applicationPeriodBegin: "2021-04-19T06:00:00+00:00",
            applicationPeriodEnd: addDays(new Date(), 7).toISOString(),
            reservationPeriodBegin: "2021-08-16",
            reservationPeriodEnd: toApiDate(addMonths(new Date(), 1)),
            publicDisplayBegin: "2021-04-16T06:00:00+00:00",
            publicDisplayEnd: addDays(new Date(), 7).toISOString(),
            status: Status.Draft,
            reservationUnits: [
              {
                pk: 2,
              } as ReservationUnitType,
              {
                pk: 6,
              } as ReservationUnitType,
            ],
            allocating: false,
            criteriaFi: "Criteria FI",
            criteriaEn: "Criteria EN",
            criteriaSv: "Criteria SV",
          },
          cursor: null,
        },
        {
          node: {
            id: "fm8q904wfj",
            pk: 3,
            nameFi:
              "Jakomäen nuorisotalon vakiovuorot syksy 2021 - kevät 2022 FI",
            nameEn:
              "Jakomäen nuorisotalon vakiovuorot syksy 2021 - kevät 2022 EN",
            nameSv:
              "Jakomäen nuorisotalon vakiovuorot syksy 2021 - kevät 2022 SV",
            applicationPeriodBegin: "2021-04-19T06:00:00+00:00",
            applicationPeriodEnd: "2021-04-30T13:00:00+00:00",
            reservationPeriodBegin: "2021-08-16",
            reservationPeriodEnd: toApiDate(addMonths(new Date(), 1)),
            publicDisplayBegin: "2021-04-16T06:00:00+00:00",
            publicDisplayEnd: addDays(new Date(), 7).toISOString(),
            status: Status.Draft,
            reservationUnits: [
              {
                pk: 7,
              } as ReservationUnitType,
              {
                pk: 1,
              } as ReservationUnitType,
            ],
            allocating: false,
            criteriaFi: "Criteria FI",
            criteriaEn: "Criteria EN",
            criteriaSv: "Criteria SV",
          },
          cursor: null,
        },
        {
          node: {
            id: "fgnq8793e4airug",
            pk: 8,
            nameFi:
              "Fallkullan, Malmin ja Pukinmäen nuorisotalojen vakiovuorot syksy 2021 - kevät 2022 FI",
            nameEn:
              "Fallkullan, Malmin ja Pukinmäen nuorisotalojen vakiovuorot syksy 2021 - kevät 2022 EN",
            nameSv:
              "Fallkullan, Malmin ja Pukinmäen nuorisotalojen vakiovuorot syksy 2021 - kevät 2022 SV",
            applicationPeriodBegin: "2021-04-19T06:00:00Z",
            applicationPeriodEnd: "2021-04-30T13:00:00Z",
            reservationPeriodBegin: "2021-08-16",
            reservationPeriodEnd: toApiDate(addMonths(new Date(), 1)),
            publicDisplayBegin: "2021-04-16T06:00:00Z",
            publicDisplayEnd: addDays(new Date(), 7).toISOString(),
            status: Status.InReview,
            reservationUnits: [
              {
                pk: 7,
              } as ReservationUnitType,
            ],
            allocating: false,
            criteriaFi: "Criteria FI",
            criteriaEn: "Criteria EN",
            criteriaSv: "Criteria SV",
          },
          cursor: null,
        },
        {
          node: {
            id: "fnvq9384ahwefjcd",
            pk: 9,
            nameFi:
              "Nuorten ympäristötilan (Laajasalo) vakiovuorot syksy 2021 - kevät 2022 FI",
            nameEn:
              "Nuorten ympäristötilan (Laajasalo) vakiovuorot syksy 2021 - kevät 2022 EN",
            nameSv:
              "Nuorten ympäristötilan (Laajasalo) vakiovuorot syksy 2021 - kevät 2022 SV",
            applicationPeriodBegin: addDays(new Date(), 7).toISOString(),
            applicationPeriodEnd: addDays(new Date(), 17).toISOString(),
            reservationPeriodBegin: "2021-08-16",
            reservationPeriodEnd: toApiDate(addMonths(new Date(), 1)),
            publicDisplayBegin: "2021-04-16T06:00:00Z",
            publicDisplayEnd: addDays(new Date(), 7).toISOString(),
            status: Status.Draft,
            reservationUnits: [
              {
                pk: 9,
              } as ReservationUnitType,
              {
                pk: 6,
              } as ReservationUnitType,
              {
                pk: 7,
              } as ReservationUnitType,
            ],
            allocating: false,
            criteriaFi: "Criteria FI",
            criteriaEn: "Criteria EN",
            criteriaSv: "Criteria SV",
          },
          cursor: null,
        },
        {
          node: {
            id: "g9834jg8934gjh",
            pk: 7,
            nameFi:
              "Hertsin nuorisotalon vakiovuorot syksy 2021 - kevät 2022 FI",
            nameEn:
              "Hertsin nuorisotalon vakiovuorot syksy 2021 - kevät 2022 EN",
            nameSv:
              "Hertsin nuorisotalon vakiovuorot syksy 2021 - kevät 2022 SV",
            applicationPeriodBegin: "2021-04-19T06:00:00Z",
            applicationPeriodEnd: "2021-04-30T13:00:00Z",
            reservationPeriodBegin: "2021-09-01",
            reservationPeriodEnd: toApiDate(addMonths(new Date(), 1)),
            publicDisplayBegin: "2021-04-16T06:00:00Z",
            publicDisplayEnd: addDays(new Date(), 7).toISOString(),
            status: Status.Draft,
            reservationUnits: [
              {
                pk: 9,
              } as ReservationUnitType,
              {
                pk: 6,
              } as ReservationUnitType,
              {
                pk: 7,
              } as ReservationUnitType,
            ],
            allocating: false,
            criteriaFi: "Criteria FI",
            criteriaEn: "Criteria EN",
            criteriaSv: "Criteria SV",
          },
          cursor: null,
        },
        {
          node: {
            id: "woeis4gjmfiogmiero",
            pk: 1,
            nameFi: "Nuorten liikuntavuorot kevät 2021 FI",
            nameEn: "Nuorten liikuntavuorot kevät 2021 EN",
            nameSv: "Nuorten liikuntavuorot kevät 2021 SV",
            applicationPeriodBegin: "2021-01-01T00:00:00Z",
            applicationPeriodEnd: "2021-01-31T00:00:00Z",
            reservationPeriodBegin: "2021-01-01",
            reservationPeriodEnd: "2021-06-01",
            publicDisplayBegin: "2021-01-01T00:00:00Z",
            publicDisplayEnd: addDays(new Date(), 7).toISOString(),
            status: Status.Draft,
            reservationUnits: [
              {
                pk: 2,
              } as ReservationUnitType,
              {
                pk: 6,
              } as ReservationUnitType,
              {
                pk: 7,
              } as ReservationUnitType,
            ],
            allocating: false,
            criteriaFi: "Criteria FI",
            criteriaEn: "Criteria EN",
            criteriaSv: "Criteria SV",
          },
          cursor: null,
        },
        {
          node: {
            id: "v3j45098t",
            pk: 2,
            nameFi: "Toimistotilojen haku kevät 2021 FI",
            nameEn: "Toimistotilojen haku kevät 2021 EN",
            nameSv: "Toimistotilojen haku kevät 2021 SV",
            applicationPeriodBegin: "2020-12-18T08:01:01Z",
            applicationPeriodEnd: "2020-12-31T22:01:06Z",
            reservationPeriodBegin: "2021-01-01",
            reservationPeriodEnd: "2021-06-01",
            publicDisplayBegin: "2020-12-18T00:00:00Z",
            publicDisplayEnd: addDays(new Date(), 7).toISOString(),
            status: Status.Draft,
            reservationUnits: [
              {
                pk: 9,
              } as ReservationUnitType,
              {
                pk: 6,
              } as ReservationUnitType,
              {
                pk: 7,
              } as ReservationUnitType,
            ],
            allocating: false,
            criteriaFi: "Criteria FI",
            criteriaEn: "Criteria EN",
            criteriaSv: "Criteria SV",
          },
          cursor: null,
        },
        {
          node: {
            id: "g083rejioadmv",
            pk: 5,
            nameFi:
              "Arabian, Koskelan ja Pasilan nuorisotalojen vakiovuorot syksy 2021 - kevät 2022 FI",
            nameEn:
              "Arabian, Koskelan ja Pasilan nuorisotalojen vakiovuorot syksy 2021 - kevät 2022 EN",
            nameSv:
              "Arabian, Koskelan ja Pasilan nuorisotalojen vakiovuorot syksy 2021 - kevät 2022 SV",
            applicationPeriodBegin: "2021-04-19T06:00:00Z",
            applicationPeriodEnd: "2021-12-30T13:00:00Z",
            reservationPeriodBegin: toApiDate(addMonths(new Date(), 1)),
            reservationPeriodEnd: toApiDate(addMonths(new Date(), 5)),
            publicDisplayBegin: "2021-04-16T06:00:00Z",
            publicDisplayEnd: addDays(new Date(), 7).toISOString(),
            status: Status.Draft,
            reservationUnits: [
              {
                pk: 9,
              } as ReservationUnitType,
              {
                pk: 6,
              } as ReservationUnitType,
              {
                pk: 7,
              } as ReservationUnitType,
            ],
            allocating: false,
            criteriaFi: "Criteria FI",
            criteriaEn: "Criteria EN",
            criteriaSv: "Criteria SV",
          },
          cursor: null,
        },
      ],
      pageInfo: null,
    };
    return res(ctx.data({ applicationRounds: result }));
  }
);

export const applicationRoundHandlers = [applicationRounds];
