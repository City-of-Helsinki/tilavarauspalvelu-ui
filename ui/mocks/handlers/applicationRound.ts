import { addDays, addMonths } from "date-fns";
import { graphql, rest } from "msw";
import {
  Query,
  ApplicationRoundTypeConnection,
  QueryApplicationRoundsArgs,
  ReservationUnitType,
  Status,
  ApplicationsApplicationRoundTargetGroupChoices,
} from "../../modules/gql-types";
import { ApplicationRound } from "../../modules/types";
import { toApiDate } from "../../modules/util";

const applicationRoundsGQL = graphql.query<Query, QueryApplicationRoundsArgs>(
  "ApplicationRounds",
  async (req, res, ctx) => {
    const result: ApplicationRoundTypeConnection = {
      edges: [
        {
          node: {
            id: "fq02394feaw",
            pk: 2,
            targetGroup: ApplicationsApplicationRoundTargetGroupChoices.Public,
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
                unit: {
                  pk: 3,
                },
              } as ReservationUnitType,
              {
                pk: 6,
                unit: {
                  pk: 2,
                },
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
            targetGroup: ApplicationsApplicationRoundTargetGroupChoices.Public,
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
                unit: {
                  pk: 5,
                },
              } as ReservationUnitType,
              {
                pk: 1,
                unit: {
                  pk: 3,
                },
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
            targetGroup: ApplicationsApplicationRoundTargetGroupChoices.Public,
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
                unit: {
                  pk: 5,
                },
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
            targetGroup: ApplicationsApplicationRoundTargetGroupChoices.Public,
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
                unit: {
                  pk: 5,
                },
              } as ReservationUnitType,
              {
                pk: 6,
                unit: {
                  pk: 5,
                },
              } as ReservationUnitType,
              {
                pk: 7,
                unit: {
                  pk: 5,
                },
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
            targetGroup: ApplicationsApplicationRoundTargetGroupChoices.Public,
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
                unit: {
                  pk: 5,
                },
              } as ReservationUnitType,
              {
                pk: 6,
                unit: {
                  pk: 5,
                },
              } as ReservationUnitType,
              {
                pk: 7,
                unit: {
                  pk: 5,
                },
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
            targetGroup: ApplicationsApplicationRoundTargetGroupChoices.Public,
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
                unit: {
                  pk: 1,
                },
              } as ReservationUnitType,
              {
                pk: 6,
                unit: {
                  pk: 2,
                },
              } as ReservationUnitType,
              {
                pk: 7,
                unit: {
                  pk: 3,
                },
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
            targetGroup: ApplicationsApplicationRoundTargetGroupChoices.Public,
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
                unit: {
                  pk: 5,
                },
              } as ReservationUnitType,
              {
                pk: 6,
                unit: {
                  pk: 5,
                },
              } as ReservationUnitType,
              {
                pk: 7,
                unit: {
                  pk: 5,
                },
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
            targetGroup: ApplicationsApplicationRoundTargetGroupChoices.Public,
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
                unit: {
                  pk: 5,
                },
              } as ReservationUnitType,
              {
                pk: 6,
                unit: {
                  pk: 5,
                },
              } as ReservationUnitType,
              {
                pk: 7,
                unit: {
                  pk: 5,
                },
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

const applicationRoundsREST = rest.get(
  "http://localhost:8000/v1/application_round/",
  (req, res, ctx) => {
    const result: ApplicationRound[] = [
      {
        id: 2,
        name: "Ruoholahden nuorisotalon vakiovuorot syksy 2021 - kevät 2022",
        reservationUnitIds: [32, 33],
        applicationPeriodBegin: "2021-04-19T06:00:00Z",
        applicationPeriodEnd: "2022-04-30T13:00:00Z",
        reservationPeriodBegin: "2021-08-16",
        reservationPeriodEnd: "2022-05-29",
        publicDisplayBegin: "2021-04-16T06:00:00Z",
        publicDisplayEnd: addDays(new Date(), 7).toISOString(),
        purposeIds: [5, 6, 7, 8],
        serviceSectorId: 1,
        status: "allocated",
        statusTimestamp: "2021-05-12T08:25:09.113700Z",
        applicationRoundBaskets: [
          {
            id: 28,
            name: "",
            purposeIds: [5, 6, 7, 8],
            mustBeMainPurposeOfApplicant: true,
            customerType: ["nonprofit"],
            ageGroupIds: [5, 1, 2, 3, 4],
            homeCityId: 1,
            allocationPercentage: 0,
            orderNumber: 1,
          },
          {
            id: 29,
            name: "",
            purposeIds: [9, 10, 11],
            mustBeMainPurposeOfApplicant: false,
            customerType: ["individual"],
            ageGroupIds: [6, 7],
            homeCityId: 2,
            allocationPercentage: 0,
            orderNumber: 2,
          },
        ],
        allocating: false,
        criteria:
          "<p><strong>K&auml;ytt&ouml;vuorojen jakoperusteet ja vuorojen my&ouml;nt&auml;minen<br /><br /></strong>Nuorisotilojen tarjoamisessa asukask&auml;ytt&ouml;&ouml;n noudatetaan tasapuolisuutta ja avoimuutta.<br /><br /><br />K&auml;ytt&ouml;vuoroja jaettaessa noudatetaan seuraavaa ensisijaisuusperiaatetta:<br /><br />1. Toimipaikan oma toiminta<br />2. Helsinkil&auml;iset nuorten toimintaryhm&auml;t ja nuorisoj&auml;rjest&ouml;t ja -yhdistykset<br />3. Yhdistykset, joiden kotipaikka on Helsinki<br />4. Helsingin kaupungin toimialat<br />5. Muut k&auml;ytt&auml;j&auml;t<br /><br />Toimipaikkojen vakiovuorot my&ouml;nt&auml;&auml; toiminnanjohtaja. P&auml;&auml;t&ouml;s my&ouml;nnetyst&auml; vuorosta annetaan kuukauden kuluessa<br />hakukierroksen p&auml;&auml;ttymisest&auml;. Tilap&auml;iset k&auml;ytt&ouml;vuorot my&ouml;nt&auml;&auml; vastaava ohjaaja tai toimipaikan nimetty henkil&ouml;.<br />K&auml;ytt&ouml;vuoron my&ouml;nt&auml;j&auml; voi poiketa hakijan ilmaisemista aika- ja tilatoiveista ja tarjota k&auml;ytt&ouml;vuoroa my&ouml;s muista kuin<br />hakijan toivomista toimipisteist&auml; tai aikana. Tilaan sovelletaan voimassa olevia toimialakohtaisia<br />hinnoitteluperiaatteita.</p>",
        isAdmin: true,
        aggregatedData: {
          allocationResultEventsCount: null,
          allocationDurationTotal: null,
          totalHourCapacity: null,
          totalReservationDuration: null,
        },
        approvedBy: "",
        applicationsSent: false,
      },
      {
        id: 3,
        name: "Jakomäen nuorisotalon vakiovuorot syksy 2021 - kevät 2022",
        reservationUnitIds: [40, 41, 42, 43],
        applicationPeriodBegin: "2021-04-19T06:00:00Z",
        applicationPeriodEnd: "2021-04-30T13:00:00Z",
        reservationPeriodBegin: "2021-08-16",
        reservationPeriodEnd: "2022-05-29",
        publicDisplayBegin: "2021-04-16T06:00:00Z",
        publicDisplayEnd: addDays(new Date(), 7).toISOString(),
        purposeIds: [5, 6, 7, 8],
        serviceSectorId: 1,
        status: "approved",
        statusTimestamp: "2021-06-04T07:03:49.412023Z",
        applicationRoundBaskets: [
          {
            id: 72,
            name: "",
            purposeIds: [5, 6, 7, 8],
            mustBeMainPurposeOfApplicant: true,
            customerType: ["nonprofit"],
            ageGroupIds: [5, 1, 2, 3, 4],
            homeCityId: 1,
            allocationPercentage: 0,
            orderNumber: 1,
          },
          {
            id: 73,
            name: "",
            purposeIds: [9, 10, 11],
            mustBeMainPurposeOfApplicant: false,
            customerType: ["individual"],
            ageGroupIds: [6, 7],
            homeCityId: 2,
            allocationPercentage: 0,
            orderNumber: 2,
          },
        ],
        allocating: false,
        criteria:
          "<p><strong>K&auml;ytt&ouml;vuorojen jakoperusteet ja vuorojen my&ouml;nt&auml;minen<br /><br /></strong>Nuorisotilojen tarjoamisessa asukask&auml;ytt&ouml;&ouml;n noudatetaan tasapuolisuutta ja avoimuutta.<br /><br /><br />K&auml;ytt&ouml;vuoroja jaettaessa noudatetaan seuraavaa ensisijaisuusperiaatetta:<br /><br />1. Toimipaikan oma toiminta<br />2. Helsinkil&auml;iset nuorten toimintaryhm&auml;t ja nuorisoj&auml;rjest&ouml;t ja -yhdistykset<br />3. Yhdistykset, joiden kotipaikka on Helsinki<br />4. Helsingin kaupungin toimialat<br />5. Muut k&auml;ytt&auml;j&auml;t<br /><br />Toimipaikkojen vakiovuorot my&ouml;nt&auml;&auml; toiminnanjohtaja. P&auml;&auml;t&ouml;s my&ouml;nnetyst&auml; vuorosta annetaan kuukauden kuluessa<br />hakukierroksen p&auml;&auml;ttymisest&auml;. Tilap&auml;iset k&auml;ytt&ouml;vuorot my&ouml;nt&auml;&auml; vastaava ohjaaja tai toimipaikan nimetty henkil&ouml;.<br />K&auml;ytt&ouml;vuoron my&ouml;nt&auml;j&auml; voi poiketa hakijan ilmaisemista aika- ja tilatoiveista ja tarjota k&auml;ytt&ouml;vuoroa my&ouml;s muista kuin<br />hakijan toivomista toimipisteist&auml; tai aikana. Tilaan sovelletaan voimassa olevia toimialakohtaisia<br />hinnoitteluperiaatteita.</p>",
        isAdmin: true,
        aggregatedData: {
          allocationResultEventsCount: null,
          allocationDurationTotal: null,
          totalHourCapacity: null,
          totalReservationDuration: null,
        },
        approvedBy: "Mikko Sartanen",
        applicationsSent: false,
      },
      {
        id: 8,
        name: "Fallkullan, Malmin ja Pukinmäen nuorisotalojen vakiovuorot syksy 2021 - kevät 2022",
        reservationUnitIds: [34, 35, 36, 37, 38],
        applicationPeriodBegin: "2021-04-19T06:00:00Z",
        applicationPeriodEnd: "2021-04-30T13:00:00Z",
        reservationPeriodBegin: "2021-08-16",
        reservationPeriodEnd: "2022-05-29",
        publicDisplayBegin: "2021-04-16T06:00:00Z",
        publicDisplayEnd: addDays(new Date(), 7).toISOString(),
        purposeIds: [5, 6, 7, 8],
        serviceSectorId: 1,
        status: "approved",
        statusTimestamp: "2021-06-08T05:15:44.304879Z",
        applicationRoundBaskets: [
          {
            id: 52,
            name: "",
            purposeIds: [5, 6, 7, 8],
            mustBeMainPurposeOfApplicant: true,
            customerType: ["nonprofit"],
            ageGroupIds: [5, 1, 2, 3, 4],
            homeCityId: 1,
            allocationPercentage: 0,
            orderNumber: 1,
          },
          {
            id: 53,
            name: "",
            purposeIds: [9, 10, 11],
            mustBeMainPurposeOfApplicant: false,
            customerType: ["individual"],
            ageGroupIds: [6, 7],
            homeCityId: 2,
            allocationPercentage: 0,
            orderNumber: 2,
          },
        ],
        allocating: false,
        criteria:
          "<p><strong>K&auml;ytt&ouml;vuorojen jakoperusteet ja vuorojen my&ouml;nt&auml;minen<br /><br /></strong>Nuorisotilojen tarjoamisessa asukask&auml;ytt&ouml;&ouml;n noudatetaan tasapuolisuutta ja avoimuutta.<br /><br /><br />K&auml;ytt&ouml;vuoroja jaettaessa noudatetaan seuraavaa ensisijaisuusperiaatetta:<br /><br />1. Toimipaikan oma toiminta<br />2. Helsinkil&auml;iset nuorten toimintaryhm&auml;t ja nuorisoj&auml;rjest&ouml;t ja -yhdistykset<br />3. Yhdistykset, joiden kotipaikka on Helsinki<br />4. Helsingin kaupungin toimialat<br />5. Muut k&auml;ytt&auml;j&auml;t<br /><br />Toimipaikkojen vakiovuorot my&ouml;nt&auml;&auml; toiminnanjohtaja. P&auml;&auml;t&ouml;s my&ouml;nnetyst&auml; vuorosta annetaan kuukauden kuluessa<br />hakukierroksen p&auml;&auml;ttymisest&auml;. Tilap&auml;iset k&auml;ytt&ouml;vuorot my&ouml;nt&auml;&auml; vastaava ohjaaja tai toimipaikan nimetty henkil&ouml;.<br />K&auml;ytt&ouml;vuoron my&ouml;nt&auml;j&auml; voi poiketa hakijan ilmaisemista aika- ja tilatoiveista ja tarjota k&auml;ytt&ouml;vuoroa my&ouml;s muista kuin<br />hakijan toivomista toimipisteist&auml; tai aikana. Tilaan sovelletaan voimassa olevia toimialakohtaisia<br />hinnoitteluperiaatteita.</p>",
        isAdmin: true,
        aggregatedData: {
          allocationResultEventsCount: null,
          allocationDurationTotal: null,
          totalHourCapacity: null,
          totalReservationDuration: null,
        },
        approvedBy: "Mikko Sartanen",
        applicationsSent: false,
      },
      {
        id: 9,
        name: "Nuorten ympäristötilan (Laajasalo) vakiovuorot syksy 2021 - kevät 2022",
        reservationUnitIds: [47],
        applicationPeriodBegin: addDays(new Date(), 7).toISOString(),
        applicationPeriodEnd: addDays(new Date(), 17).toISOString(),
        reservationPeriodBegin: "2021-08-16",
        reservationPeriodEnd: "2022-05-29",
        publicDisplayBegin: "2021-04-16T06:00:00Z",
        publicDisplayEnd: addDays(new Date(), 7).toISOString(),
        purposeIds: [5, 6, 7, 8],
        serviceSectorId: 1,
        status: "approved",
        statusTimestamp: "2021-06-15T06:45:37.914043Z",
        applicationRoundBaskets: [
          {
            id: 58,
            name: "",
            purposeIds: [5, 6, 7, 8],
            mustBeMainPurposeOfApplicant: true,
            customerType: ["nonprofit"],
            ageGroupIds: [5, 1, 2, 3, 4],
            homeCityId: 1,
            allocationPercentage: 0,
            orderNumber: 1,
          },
          {
            id: 59,
            name: "",
            purposeIds: [9, 10, 11],
            mustBeMainPurposeOfApplicant: false,
            customerType: ["individual"],
            ageGroupIds: [6, 7],
            homeCityId: 2,
            allocationPercentage: 0,
            orderNumber: 2,
          },
        ],
        allocating: false,
        criteria:
          "<p><strong>K&auml;ytt&ouml;vuorojen jakoperusteet ja vuorojen my&ouml;nt&auml;minen<br /><br /></strong>Nuorisotilojen tarjoamisessa asukask&auml;ytt&ouml;&ouml;n noudatetaan tasapuolisuutta ja avoimuutta.<br /><br /><br />K&auml;ytt&ouml;vuoroja jaettaessa noudatetaan seuraavaa ensisijaisuusperiaatetta:<br /><br />1. Toimipaikan oma toiminta<br />2. Helsinkil&auml;iset nuorten toimintaryhm&auml;t ja nuorisoj&auml;rjest&ouml;t ja -yhdistykset<br />3. Yhdistykset, joiden kotipaikka on Helsinki<br />4. Helsingin kaupungin toimialat<br />5. Muut k&auml;ytt&auml;j&auml;t<br /><br />Toimipaikkojen vakiovuorot my&ouml;nt&auml;&auml; toiminnanjohtaja. P&auml;&auml;t&ouml;s my&ouml;nnetyst&auml; vuorosta annetaan kuukauden kuluessa<br />hakukierroksen p&auml;&auml;ttymisest&auml;. Tilap&auml;iset k&auml;ytt&ouml;vuorot my&ouml;nt&auml;&auml; vastaava ohjaaja tai toimipaikan nimetty henkil&ouml;.<br />K&auml;ytt&ouml;vuoron my&ouml;nt&auml;j&auml; voi poiketa hakijan ilmaisemista aika- ja tilatoiveista ja tarjota k&auml;ytt&ouml;vuoroa my&ouml;s muista kuin<br />hakijan toivomista toimipisteist&auml; tai aikana. Tilaan sovelletaan voimassa olevia toimialakohtaisia<br />hinnoitteluperiaatteita.</p>",
        isAdmin: true,
        aggregatedData: {
          allocationResultEventsCount: null,
          allocationDurationTotal: null,
          totalHourCapacity: null,
          totalReservationDuration: null,
        },
        approvedBy: "Mikko Sartanen",
        applicationsSent: false,
      },
      {
        id: 7,
        name: "Hertsin nuorisotalon vakiovuorot syksy 2021 - kevät 2022",
        reservationUnitIds: [44, 45, 46],
        applicationPeriodBegin: "2021-04-19T06:00:00Z",
        applicationPeriodEnd: "2021-04-30T13:00:00Z",
        reservationPeriodBegin: "2021-09-01",
        reservationPeriodEnd: "2022-05-29",
        publicDisplayBegin: "2021-04-16T06:00:00Z",
        publicDisplayEnd: addDays(new Date(), 7).toISOString(),
        purposeIds: [5, 6, 7, 8],
        serviceSectorId: 1,
        status: "approved",
        statusTimestamp: "2021-06-16T06:47:05.032746Z",
        applicationRoundBaskets: [
          {
            id: 70,
            name: "",
            purposeIds: [5, 6, 7, 8],
            mustBeMainPurposeOfApplicant: true,
            customerType: ["nonprofit"],
            ageGroupIds: [5, 1, 2, 3, 4],
            homeCityId: 1,
            allocationPercentage: 0,
            orderNumber: 1,
          },
          {
            id: 71,
            name: "",
            purposeIds: [9, 10, 11],
            mustBeMainPurposeOfApplicant: false,
            customerType: ["individual"],
            ageGroupIds: [6, 7],
            homeCityId: 2,
            allocationPercentage: 0,
            orderNumber: 2,
          },
        ],
        allocating: false,
        criteria:
          "<p><strong>K&auml;ytt&ouml;vuorojen jakoperusteet ja vuorojen my&ouml;nt&auml;minen<br /><br /></strong>Nuorisotilojen tarjoamisessa asukask&auml;ytt&ouml;&ouml;n noudatetaan tasapuolisuutta ja avoimuutta.<br /><br /><br />K&auml;ytt&ouml;vuoroja jaettaessa noudatetaan seuraavaa ensisijaisuusperiaatetta:<br /><br />1. Toimipaikan oma toiminta<br />2. Helsinkil&auml;iset nuorten toimintaryhm&auml;t ja nuorisoj&auml;rjest&ouml;t ja -yhdistykset<br />3. Yhdistykset, joiden kotipaikka on Helsinki<br />4. Helsingin kaupungin toimialat<br />5. Muut k&auml;ytt&auml;j&auml;t<br /><br />Toimipaikkojen vakiovuorot my&ouml;nt&auml;&auml; toiminnanjohtaja. P&auml;&auml;t&ouml;s my&ouml;nnetyst&auml; vuorosta annetaan kuukauden kuluessa<br />hakukierroksen p&auml;&auml;ttymisest&auml;. Tilap&auml;iset k&auml;ytt&ouml;vuorot my&ouml;nt&auml;&auml; vastaava ohjaaja tai toimipaikan nimetty henkil&ouml;.<br />K&auml;ytt&ouml;vuoron my&ouml;nt&auml;j&auml; voi poiketa hakijan ilmaisemista aika- ja tilatoiveista ja tarjota k&auml;ytt&ouml;vuoroa my&ouml;s muista kuin<br />hakijan toivomista toimipisteist&auml; tai aikana. Tilaan sovelletaan voimassa olevia toimialakohtaisia<br />hinnoitteluperiaatteita.</p>",
        isAdmin: true,
        aggregatedData: {
          allocationResultEventsCount: null,
          allocationDurationTotal: null,
          totalHourCapacity: null,
          totalReservationDuration: null,
        },
        approvedBy: "Mikko Sartanen",
        applicationsSent: false,
      },
      {
        id: 1,
        name: "Nuorten liikuntavuorot kevät 2021",
        reservationUnitIds: [1, 2, 6],
        applicationPeriodBegin: "2021-01-01T00:00:00Z",
        applicationPeriodEnd: "2021-01-31T00:00:00Z",
        reservationPeriodBegin: "2021-01-01",
        reservationPeriodEnd: "2021-06-01",
        publicDisplayBegin: "2021-01-01T00:00:00Z",
        publicDisplayEnd: addDays(new Date(), 7).toISOString(),
        purposeIds: [],
        serviceSectorId: null,
        status: "draft",
        statusTimestamp: "2021-03-11T06:20:53.219000Z",
        applicationRoundBaskets: [
          {
            id: 1,
            name: "Kori A",
            purposeIds: [1],
            mustBeMainPurposeOfApplicant: false,
            customerType: ["nonprofit"],
            ageGroupIds: [],
            homeCityId: 1,
            allocationPercentage: 0,
            orderNumber: 1,
          },
        ],
        allocating: false,
        criteria: "",
        isAdmin: true,
        aggregatedData: {
          allocationResultEventsCount: null,
          allocationDurationTotal: null,
          totalHourCapacity: null,
          totalReservationDuration: null,
        },
        approvedBy: "",
        applicationsSent: true,
      },
      {
        id: 2,
        name: "Toimistotilojen haku kevät 2021",
        reservationUnitIds: [9, 6, 7],
        applicationPeriodBegin: "2020-12-18T08:01:01Z",
        applicationPeriodEnd: "2020-12-31T22:01:06Z",
        reservationPeriodBegin: "2021-01-01",
        reservationPeriodEnd: "2021-06-01",
        publicDisplayBegin: "2020-12-18T00:00:00Z",
        publicDisplayEnd: addDays(new Date(), 7).toISOString(),
        purposeIds: [2, 4],
        serviceSectorId: null,
        status: "draft",
        statusTimestamp: "2021-03-11T06:20:53.223000Z",
        applicationRoundBaskets: [],
        allocating: false,
        criteria: "",
        isAdmin: true,
        aggregatedData: {
          allocationResultEventsCount: null,
          allocationDurationTotal: null,
          totalHourCapacity: null,
          totalReservationDuration: null,
        },
        approvedBy: "",
        applicationsSent: true,
      },
      {
        id: 5,
        name: "Arabian, Koskelan ja Pasilan nuorisotalojen vakiovuorot syksy 2021 - kevät 2022",
        reservationUnitIds: [52, 1, 49, 50, 51, 53, 54],
        applicationPeriodBegin: "2021-04-19T06:00:00Z",
        applicationPeriodEnd: "2021-12-30T13:00:00Z",
        reservationPeriodBegin: toApiDate(addMonths(new Date(), 1)),
        reservationPeriodEnd: toApiDate(addMonths(new Date(), 5)),
        publicDisplayBegin: "2021-04-16T06:00:00Z",
        publicDisplayEnd: addDays(new Date(), 7).toISOString(),
        purposeIds: [5, 6, 7, 8],
        serviceSectorId: 1,
        status: "allocated",
        statusTimestamp: "2021-05-20T11:25:18.268935Z",
        applicationRoundBaskets: [
          {
            id: 66,
            name: "A",
            purposeIds: [5, 6, 7, 8],
            mustBeMainPurposeOfApplicant: true,
            customerType: ["nonprofit"],
            ageGroupIds: [5, 1, 2, 3, 4],
            homeCityId: 1,
            allocationPercentage: 0,
            orderNumber: 1,
          },
          {
            id: 67,
            name: "B",
            purposeIds: [9, 10, 11],
            mustBeMainPurposeOfApplicant: false,
            customerType: ["individual"],
            ageGroupIds: [6, 7],
            homeCityId: 2,
            allocationPercentage: 0,
            orderNumber: 2,
          },
        ],
        allocating: false,
        criteria:
          "<p><strong>K&auml;ytt&ouml;vuorojen jakoperusteet ja vuorojen my&ouml;nt&auml;minen<br /><br /></strong>Nuorisotilojen tarjoamisessa asukask&auml;ytt&ouml;&ouml;n noudatetaan tasapuolisuutta ja avoimuutta.<br /><br /><br />K&auml;ytt&ouml;vuoroja jaettaessa noudatetaan seuraavaa ensisijaisuusperiaatetta:<br /><br />1. Toimipaikan oma toiminta<br />2. Helsinkil&auml;iset nuorten toimintaryhm&auml;t ja nuorisoj&auml;rjest&ouml;t ja -yhdistykset<br />3. Yhdistykset, joiden kotipaikka on Helsinki<br />4. Helsingin kaupungin toimialat<br />5. Muut k&auml;ytt&auml;j&auml;t<br /><br />Toimipaikkojen vakiovuorot my&ouml;nt&auml;&auml; toiminnanjohtaja. P&auml;&auml;t&ouml;s my&ouml;nnetyst&auml; vuorosta annetaan kuukauden kuluessa<br />hakukierroksen p&auml;&auml;ttymisest&auml;. Tilap&auml;iset k&auml;ytt&ouml;vuorot my&ouml;nt&auml;&auml; vastaava ohjaaja tai toimipaikan nimetty henkil&ouml;.<br />K&auml;ytt&ouml;vuoron my&ouml;nt&auml;j&auml; voi poiketa hakijan ilmaisemista aika- ja tilatoiveista ja tarjota k&auml;ytt&ouml;vuoroa my&ouml;s muista kuin<br />hakijan toivomista toimipisteist&auml; tai aikana. Tilaan sovelletaan voimassa olevia toimialakohtaisia<br />hinnoitteluperiaatteita.</p>",
        isAdmin: true,
        aggregatedData: {
          allocationResultEventsCount: null,
          allocationDurationTotal: null,
          totalHourCapacity: null,
          totalReservationDuration: null,
        },
        approvedBy: "",
        applicationsSent: false,
      },
    ];
    return res(ctx.json(result));
  }
);

export const applicationRoundHandlers = [
  applicationRoundsREST,
  applicationRoundsGQL,
];
