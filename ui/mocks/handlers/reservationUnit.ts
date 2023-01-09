import { addDays, addMinutes, endOfWeek, set } from "date-fns";
import { graphql, rest } from "msw";
import { toApiDate, toUIDate } from "common/src/common/util";
import { Parameter } from "common/types/common";
import {
  OpeningTimesType,
  Query,
  QueryReservationUnitByPkArgs,
  QueryReservationUnitsArgs,
  ReservationType,
  ReservationUnitByPkType,
  ReservationUnitByPkTypeOpeningHoursArgs,
  ReservationUnitByPkTypeReservationsArgs,
  ReservationUnitImageType,
  ReservationUnitTypeConnection,
  TermsOfUseTermsOfUseTermsTypeChoices,
  ReservationUnitsReservationUnitReservationStartIntervalChoices,
  QueryTermsOfUseArgs,
  TermsOfUseTypeConnection,
  QueryReservationUnitTypesArgs,
  ReservationUnitsReservationUnitAuthenticationChoices,
  EquipmentCategoryType,
  ReservationUnitsReservationUnitReservationKindChoices,
  ReservationUnitsReservationUnitPricingPriceUnitChoices,
  ReservationUnitsReservationUnitPricingStatusChoices,
  ReservationUnitsReservationUnitPricingPricingTypeChoices,
  QueryPurposesArgs,
  PurposeTypeConnection,
  ReservationUnitType,
} from "common/types/gql-types";

const equipmentCategories: EquipmentCategoryType[] = [
  {
    id: "gaiperjg9raepg",
    nameFi: "Huonekalut",
    nameEn: "Huonekalut En",
    nameSv: "Huonekalut Sv",
  },
  {
    id: "gawipgm4iaoe",
    nameFi: "Keittiö",
    nameEn: "Keittiö En",
    nameSv: "Keittiö Sv",
  },
  {
    id: "jbs8e905ujs8934jeg",
    nameFi: "Liikunta- ja pelivälineet",
    nameEn: "Liikunta- ja pelivälineet En",
    nameSv: "Liikunta- ja pelivälineet Sv",
  },
  {
    id: "w45oijgeiorg",
    nameFi: "Tekniikka",
    nameEn: "Tekniikka En",
    nameSv: "Tekniikka Sv",
  },
  {
    id: "w45oijgeiorg",
    nameFi: "Pelikonsoli",
    nameEn: "Pelikonsoli En",
    nameSv: "Pelikonsoli Sv",
  },
  {
    id: "w45oijgeiorg",
    nameFi: "Liittimet",
    nameEn: "Liittimet En",
    nameSv: "Liittimet Sv",
  },
  {
    id: "w45oijgeiorg",
    nameFi: "Muu",
    nameEn: "Muu En",
    nameSv: "Muu Sv",
  },
];

const selectedReservationUnitQuery = graphql.query<
  Query,
  QueryReservationUnitByPkArgs
>("ReservationUnit", async (req, res, ctx) => {
  const reservationUnitByPk = {
    resources: [],
    services: [],
    uuid: "8e5275aa-8625-4458-88b4-d5b1b2df6619",
    isDraft: false,
    contactInformation: null,
    authentication: ReservationUnitsReservationUnitAuthenticationChoices.Weak,
    id: "UmVzZXJ2YXRpb25Vbml0QnlQa1R5cGU6MzY=",
    pk: req.variables.pk,
    nameFi: "Pukinmäen nuorisotalon keittiö FI",
    nameEn: "Pukinmäen nuorisotalon keittiö EN",
    nameSv: "Pukinmäen nuorisotalon keittiö SV",
    bufferTimeBefore: 3600,
    bufferTimeAfter: 1800,
    reservationBegins: addDays(new Date(), -1).toISOString(),
    reservationEnds: addDays(new Date(), 10).toISOString(),
    images: [
      {
        imageUrl: "https://via.placeholder.com/1024x768",
        mediumUrl: "https://via.placeholder.com/384x384",
        smallUrl: "https://via.placeholder.com/250x250",
        imageType: "MAIN",
      },
      {
        imageUrl: "https://via.placeholder.com/1024x768",
        mediumUrl: "https://via.placeholder.com/384x384",
        smallUrl: "https://via.placeholder.com/250x250",
        imageType: "OTHER",
      },
      {
        imageUrl: "https://via.placeholder.com/1024x768",
        mediumUrl: "https://via.placeholder.com/384x384",
        smallUrl: "https://via.placeholder.com/250x250",
        imageType: "OTHER",
      },
    ] as ReservationUnitImageType[],
    pricings: [
      {
        begins: toUIDate(addDays(new Date(), 2), "yyyy-MM-dd"),
        lowestPrice: 10,
        lowestPriceNet: 10 / 1.24,
        highestPrice: 30,
        highestPriceNet: 30 / 1.24,
        priceUnit:
          ReservationUnitsReservationUnitPricingPriceUnitChoices.Per_15Mins,
        pricingType:
          ReservationUnitsReservationUnitPricingPricingTypeChoices.Paid,
        taxPercentage: {
          id: "goier1",
          value: 20,
        },
        status: ReservationUnitsReservationUnitPricingStatusChoices.Future,
      },
      {
        begins: toUIDate(new Date(), "yyyy-MM-dd"),
        lowestPrice: 20,
        lowestPriceNet: 20 / 1.24,
        highestPrice: 20,
        highestPriceNet: 20 / 1.24,
        priceUnit:
          ReservationUnitsReservationUnitPricingPriceUnitChoices.Per_15Mins,
        pricingType:
          ReservationUnitsReservationUnitPricingPricingTypeChoices.Paid,
        taxPercentage: {
          id: "goier1",
          value: 20,
        },
        status: ReservationUnitsReservationUnitPricingStatusChoices.Active,
      },
      {
        begins: toUIDate(addDays(new Date(), 3), "yyyy-MM-dd"),
        lowestPrice: 20,
        lowestPriceNet: 20 / 1.24,
        highestPrice: 50,
        highestPriceNet: 50 / 1.24,
        priceUnit:
          ReservationUnitsReservationUnitPricingPriceUnitChoices.Per_15Mins,
        pricingType:
          ReservationUnitsReservationUnitPricingPricingTypeChoices.Paid,
        taxPercentage: {
          id: "goier1",
          value: 24,
        },
        status: ReservationUnitsReservationUnitPricingStatusChoices.Future,
      },
      {
        begins: toUIDate(addDays(new Date(), 5), "yyyy-MM-dd"),
        pricingType:
          ReservationUnitsReservationUnitPricingPricingTypeChoices.Free,
        status: ReservationUnitsReservationUnitPricingStatusChoices.Future,
      },
    ],
    descriptionFi:
      "<p>Sali sijaitsee nuorisotalon toisessa kerroksessa. Tilaan mahtuu 60 henkil&ouml;&auml;..</p> Fi",
    descriptionEn:
      "<p>Sali sijaitsee nuorisotalon toisessa kerroksessa. Tilaan mahtuu 60 henkil&ouml;&auml;..</p> En",
    descriptionSv:
      "<p>Sali sijaitsee nuorisotalon toisessa kerroksessa. Tilaan mahtuu 60 henkil&ouml;&auml;..</p> Sv",
    termsOfUseFi:
      "<p>Nuorisotilojen yleiset varausehdot</p>\r\n<p><strong>1 Soveltamisala</strong></p>\r\n<p>N&auml;m&auml; varausehdot koskevat Helsingin kaupungin nuorisopalveluiden hallinnoimien tilojen ja laitteiden varaamista, k&auml;ytt&ouml;vuoron hakemista Tilavaraus-palvelun kautta sek&auml; nuorisopalveluiden hallinnoimien tilojen ja laitteiden k&auml;ytt&ouml;&auml;. N&auml;m&auml; varausehdot t&auml;ydent&auml;v&auml;t Helsingin kaupungin tilojen ja laitteiden varausehtoja. Varaamalla resurssin tai hakemalla k&auml;ytt&ouml;vuoroa hyv&auml;ksyt n&auml;m&auml; ehdot.</p> Fi",
    termsOfUseEn:
      "<p>Nuorisotilojen yleiset varausehdot</p>\r\n<p><strong>1 Soveltamisala</strong></p>\r\n<p>N&auml;m&auml; varausehdot koskevat Helsingin kaupungin nuorisopalveluiden hallinnoimien tilojen ja laitteiden varaamista, k&auml;ytt&ouml;vuoron hakemista Tilavaraus-palvelun kautta sek&auml; nuorisopalveluiden hallinnoimien tilojen ja laitteiden k&auml;ytt&ouml;&auml;. N&auml;m&auml; varausehdot t&auml;ydent&auml;v&auml;t Helsingin kaupungin tilojen ja laitteiden varausehtoja. Varaamalla resurssin tai hakemalla k&auml;ytt&ouml;vuoroa hyv&auml;ksyt n&auml;m&auml; ehdot.</p> En",
    termsOfUseSv:
      "<p>Nuorisotilojen yleiset varausehdot</p>\r\n<p><strong>1 Soveltamisala</strong></p>\r\n<p>N&auml;m&auml; varausehdot koskevat Helsingin kaupungin nuorisopalveluiden hallinnoimien tilojen ja laitteiden varaamista, k&auml;ytt&ouml;vuoron hakemista Tilavaraus-palvelun kautta sek&auml; nuorisopalveluiden hallinnoimien tilojen ja laitteiden k&auml;ytt&ouml;&auml;. N&auml;m&auml; varausehdot t&auml;ydent&auml;v&auml;t Helsingin kaupungin tilojen ja laitteiden varausehtoja. Varaamalla resurssin tai hakemalla k&auml;ytt&ouml;vuoroa hyv&auml;ksyt n&auml;m&auml; ehdot.</p> Sv",
    reservationPendingInstructionsFi: "Pending Instructions FI",
    reservationPendingInstructionsEn: "Pending Instructions EN",
    reservationPendingInstructionsSv: "Pending Instructions SV",
    reservationConfirmedInstructionsFi: "Confirmed Instructions FI",
    reservationConfirmedInstructionsEn: "Confirmed Instructions EN",
    reservationConfirmedInstructionsSv: "Confirmed Instructions SV",
    reservationCancelledInstructionsFi: "Cancelled Instructions FI",
    reservationCancelledInstructionsEn: "Cancelled Instructions EN",
    reservationCancelledInstructionsSv: "Cancelled Instructions SV",

    reservationStartInterval:
      "INTERVAL_60_MINS" as ReservationUnitsReservationUnitReservationStartIntervalChoices,
    serviceSpecificTerms: {
      id: "VGVybXNPZlVzZVR5cGU6Mw==",
      termsType: "SERVICE_TERMS" as TermsOfUseTermsOfUseTermsTypeChoices,
      nameFi: "Palveluehto FI",
      nameEn: "Palveluehto EN",
      nameSv: "Palveluehto SV",
      textFi:
        "Palveluehto Palveluehto Palveluehto Palveluehto Palveluehto Palveluehto Palveluehto",
      textEn: "",
      textSv: "",
    },
    reservationUnitType: {
      id: "UmVzZXJ2YXRpb25Vbml0VHlwZVR5cGU6Mw==",
      nameFi: "Nuorisopalvelut Fi",
      nameEn: "Nuorisopalvelut En",
      nameSv: "Nuorisopalvelut Sv",
    },
    minPersons: 10,
    maxPersons: 60,
    unit: {
      descriptionFi: "Desc Fi",
      descriptionEn: "Desc En",
      descriptionSv: "Desc Sv",
      email: "pukinmaen.nuorisotalo@hel.fi",
      id: "VW5pdFR5cGU6Nw==",
      pk: 7,
      nameFi: "Pukinmäen nuorisotalo Fi",
      nameEn: "Pukinmäen nuorisotalo En",
      nameSv: "Pukinmäen nuorisotalo Sv",
      phone: "+358 9 310 36707",
      shortDescriptionFi: "",
      shortDescriptionEn: "",
      shortDescriptionSv: "",
      webPage: "http://pukinmaki.munstadi.fi/",
      tprekId: "123",
      location: {
        id: "TG9jYXRpb25UeXBlOjI2",
        latitude: "60.29429873400916",
        longitude: "25.07080078125",
        addressStreetFi: "Säterintie 2 Fi",
        addressStreetEn: "Säterintie 2 En",
        addressStreetSv: "Säterintie 2 Sv",
        addressZip: "00720",
        addressCityFi: "Helsinki Fi",
        addressCityEn: "Helsinki En",
        addressCitySv: "Helsinki Sv",
      },
    },
    minReservationDuration: 3600,
    maxReservationDuration: 5400,
    nextAvailableSlot: "2021-09-21T09:30:00Z",
    spaces: [
      {
        id: "U3BhY2VUeXBlOjQx",
        pk: 41,
        nameFi: "Sali Fi",
        nameEn: "Sali En",
        nameSv: "Sali Sv",
        code: "",
      },
    ],
    openingHours: {
      openingTimePeriods: [
        {
          periodId: 38600,
          startDate: toApiDate(new Date()),
          endDate: toApiDate(addDays(new Date(), 30)),
          resourceState: null,
          timeSpans: [
            {
              startTime: "09:00:00+00:00",
              endTime: "12:00:00+00:00",
              weekdays: [6, 1, 7],
              resourceState: "open",
              endTimeOnNextDay: null,
              nameFi: "Span name Fi",
              nameEn: "Span name En",
              nameSv: "Span name Sv",
              descriptionFi: "Span desc Fi",
              descriptionEn: "Span desc En",
              descriptionSv: "Span desc Sv",
            },
            {
              startTime: "12:00:00+00:00",
              endTime: "21:00:00+00:00",
              weekdays: [7, 2],
              resourceState: "open",
              endTimeOnNextDay: null,
              nameFi: "Span name Fi",
              nameEn: "Span name En",
              nameSv: "Span name Sv",
              descriptionFi: "Span desc Fi",
              descriptionEn: "Span desc En",
              descriptionSv: "Span desc Sv",
            },
          ],
          nameFi: "Period name Fi",
          nameEn: "Period name En",
          nameSv: "Period name Sv",
          descriptionFi: "Period desc Fi",
          descriptionEn: "Period desc En",
          descriptionSv: "Period desc Sv",
        },
        {
          periodId: 38601,
          startDate: toApiDate(addDays(new Date(), 30)),
          endDate: toApiDate(addDays(new Date(), 300)),
          resourceState: null,
          timeSpans: [
            {
              startTime: "09:00:00+00:00",
              endTime: "21:00:00+00:00",
              weekdays: [4, 5, 6],
              resourceState: "open",
              endTimeOnNextDay: null,
              nameFi: "Span name Fi",
              nameEn: "Span name En",
              nameSv: "Span name Sv",
              descriptionFi: "Span desc Fi",
              descriptionEn: "Span desc En",
              descriptionSv: "Span desc Sv",
            },
            {
              startTime: "09:00:00+00:00",
              endTime: "21:00:00+00:00",
              weekdays: [7],
              resourceState: "open",
              endTimeOnNextDay: null,
              nameFi: "Span name Fi",
              nameEn: "Span name En",
              nameSv: "Span name Sv",
              descriptionFi: "Span desc Fi",
              descriptionEn: "Span desc En",
              descriptionSv: "Span desc Sv",
            },
          ],
          nameFi: "Period name Fi",
          nameEn: "Period name En",
          nameSv: "Period name Sv",
          descriptionFi: "Period desc Fi",
          descriptionEn: "Period desc En",
          descriptionSv: "Period desc Sv",
        },
      ],
    },
    requireIntroduction: false,
    requireReservationHandling: false,
    equipment: [
      {
        id: "RXVhY2tldFZhbHVlOjA=",
        pk: 1,
        nameFi: "Joku muu Fi",
        nameEn: "Joku muu En",
        nameSv: "Joku muu Sv",
        category: {
          id: "RXVhY2tldFZhbHVlOjB=",
          nameFi: "Muu kategoria",
          nameEn: "Muu kategoria EN",
          nameSv: "Muu kategoria SV",
        },
      },
      {
        id: "RXVhY2tldFZhbHVlOjE=",
        pk: 1,
        nameFi: "Kattila Fi",
        nameEn: "Kattila En",
        nameSv: "Kattila Sv",
        category: equipmentCategories[1],
      },
      {
        id: "RXVhY2tldFZhbHVlOjD=",
        pk: 1,
        nameFi: "Tuoli Fi",
        nameEn: "Tuoli En",
        nameSv: "Tuoli Sv",
        category: equipmentCategories[0],
      },
    ],
    allowReservationsWithoutOpeningHours: true,
    canApplyFreeOfCharge: false,
    reservationKind:
      ReservationUnitsReservationUnitReservationKindChoices.DirectAndSeason,
    isArchived: false,
    reservationsMaxDaysBefore: 365,
    reservationsMinDaysBefore: 2,
    maxReservationsPerUser: 1,
    cancellationTerms: {
      id: "fawioep",
      textFi: "Peruutusehdot Fi",
      termsType: TermsOfUseTermsOfUseTermsTypeChoices.CancellationTerms,
    },
    metadataSet: {
      id: "f4089wfjeakrf",
      name: "Initial",
      supportedFields: [
        "reservee_first_name",
        "reservee_last_name",
        "description",
        "name",
      ],
      requiredFields: [
        "reservee_first_name",
        "reservee_last_name",
        "description",
        "name",
      ],
    },
  } as ReservationUnitByPkType;

  if (req.variables.pk === 2) {
    const pricings = reservationUnitByPk.pricings.map((pricing) => {
      return pricing.status ===
        ReservationUnitsReservationUnitPricingStatusChoices.Active
        ? {
            ...pricing,
            pricingType:
              ReservationUnitsReservationUnitPricingPricingTypeChoices.Free,
          }
        : pricing;
    });
    reservationUnitByPk.pricings = pricings;
    reservationUnitByPk.minPersons = 1;
  }

  if (req.variables.pk === 3) {
    reservationUnitByPk.canApplyFreeOfCharge = true;
    reservationUnitByPk.pricingTerms = {
      id: "faweoipfv",
      nameFi: "Hinnoitteluehdot heading Fi",
      textFi: "Hinnoitteluehdot body Fi",
      termsType: TermsOfUseTermsOfUseTermsTypeChoices.PricingTerms,
    };
    reservationUnitByPk.minPersons = undefined;
    reservationUnitByPk.maxPersons = 60;
  }

  if (req.variables.pk === 800) {
    reservationUnitByPk.equipment = [];
    reservationUnitByPk.paymentTerms = {
      id: "faweopfk",
      textFi: "Maksuehdot Fi",
      termsType: TermsOfUseTermsOfUseTermsTypeChoices.PaymentTerms,
    };
    reservationUnitByPk.pricingTerms = {
      id: "faweoipfv",
      textFi: "Hinnoitteluehdot Fi",
      termsType: TermsOfUseTermsOfUseTermsTypeChoices.PricingTerms,
    };
  }

  if (req.variables.pk === 801) {
    reservationUnitByPk.paymentTerms = {
      id: "faweopfk",
      textFi: "Maksuehdot Fi",
      termsType: TermsOfUseTermsOfUseTermsTypeChoices.PaymentTerms,
    };
    reservationUnitByPk.pricingTerms = {
      id: "faweoipfv",
      textFi: "Hinnoitteluehdot Fi",
      termsType: TermsOfUseTermsOfUseTermsTypeChoices.PricingTerms,
    };
    reservationUnitByPk.canApplyFreeOfCharge = true;
  }

  if (req.variables.pk === 900) {
    reservationUnitByPk.reservationBegins = addDays(
      new Date(),
      366
    ).toISOString();
    reservationUnitByPk.reservationEnds = addDays(
      new Date(),
      375
    ).toISOString();
    reservationUnitByPk.publishBegins = addMinutes(
      new Date(),
      -10
    ).toISOString();
    reservationUnitByPk.publishEnds = addMinutes(new Date(), 10).toISOString();
  }

  if (req.variables.pk === 901) {
    reservationUnitByPk.maxReservationsPerUser = 10;
    reservationUnitByPk.publishBegins = addMinutes(
      new Date(),
      -10
    ).toISOString();
  }

  if (req.variables.pk === 902) {
    reservationUnitByPk.maxReservationsPerUser = 30;
    reservationUnitByPk.publishEnds = addMinutes(new Date(), 10).toISOString();
    reservationUnitByPk.canApplyFreeOfCharge = true;
    reservationUnitByPk.pricingTerms = {
      id: "faweoipfv",
      nameFi: "Hinnoitteluehdot heading Fi",
      textFi: "Hinnoitteluehdot body Fi",
      termsType: TermsOfUseTermsOfUseTermsTypeChoices.PricingTerms,
    };
  }

  if (req.variables.pk === 903) {
    reservationUnitByPk.pk = 903;
    reservationUnitByPk.metadataSet = {
      id: "UmVzZXJ2YXRpb25NZXRhZGF0YVNldFR5cGU6MQ==",
      name: "Test",
      supportedFields: [
        "reservee_type",
        "reservee_first_name",
        "reservee_last_name",
        "reservee_organisation_name",
        "reservee_phone",
        "reservee_email",
        "reservee_id",
        "reservee_is_unregistered_association",
        "reservee_address_street",
        "reservee_address_city",
        "reservee_address_zip",
        "home_city",
        "age_group",
        "applying_for_free_of_charge",
        "free_of_charge_reason",
        "name",
        "description",
        "num_persons",
        "purpose",
      ],
      requiredFields: ["reservee_first_name", "billing_last_name"],
      pk: 1,
    };
  }

  if (req.variables.pk === 904) {
    reservationUnitByPk.pk = 904;
    reservationUnitByPk.requireReservationHandling = true;
  }

  if (req.variables.pk === 905) {
    reservationUnitByPk.publishBegins = addMinutes(
      new Date(),
      10
    ).toISOString();
  }

  if (req.variables.pk === 906) {
    reservationUnitByPk.publishEnds = addMinutes(new Date(), -10).toISOString();
  }

  if (req.variables.pk === 907) {
    reservationUnitByPk.isDraft = true;
    reservationUnitByPk.publishBegins = addMinutes(
      new Date(),
      10
    ).toISOString();
    reservationUnitByPk.publishEnds = addMinutes(new Date(), 20).toISOString();
  }

  if (req.variables.pk === 999) {
    reservationUnitByPk.isDraft = true;
  }

  return res(ctx.data({ reservationUnitByPk }));
});

const openingHoursQuery = graphql.query<
  Query,
  QueryReservationUnitByPkArgs &
    ReservationUnitByPkTypeOpeningHoursArgs &
    ReservationUnitByPkTypeReservationsArgs
>("ReservationUnitOpeningHours", async (req, res, ctx) => {
  const { startDate, endDate, from, to, state } = req.variables;

  const reservationUnitOpeningHours = {
    data: {
      reservationUnit: {
        openingHours: {
          openingTimes: Array.from(Array(100)).map((val, index) => ({
            date: toApiDate(addDays(new Date(), index)),
            startTime: "07:00:00+00:00",
            endTime: "20:00:00+00:00",
            state: "open",
            periods: null,
          })),
        },
        reservations: [
          {
            id: "UmVzZXJ2YXRpb25UeXBlOjU=",
            pk: 5,
            state: "CREATED",
            priority: "A_200",
            begin: set(endOfWeek(addDays(new Date(), 7), { weekStartsOn: 1 }), {
              hours: 13,
              minutes: 30,
              seconds: 0,
              milliseconds: 0,
            }).toISOString(),
            end: set(endOfWeek(addDays(new Date(), 7), { weekStartsOn: 1 }), {
              hours: 15,
              minutes: 0,
              seconds: 0,
              milliseconds: 0,
            }).toISOString(),
            numPersons: 3,
            calendarUrl:
              "http://localhost:8000/v1/reservation_calendar/5/?hash=aafe8cef803ea6aa3dc8c03307016b506554a62397a2c44828fc1d828fa7fee6",
            bufferTimeBefore: 7200,
            bufferTimeAfter: 1800,
          },
          {
            id: "UmV3ZXJ2YXRpb25UeXB3OjU=",
            pk: 6,
            state: "CREATED",
            priority: "A_200",
            begin: set(endOfWeek(addDays(new Date(), 7), { weekStartsOn: 1 }), {
              hours: 18,
              minutes: 0,
              seconds: 0,
              milliseconds: 0,
            }),
            end: set(endOfWeek(addDays(new Date(), 7), { weekStartsOn: 1 }), {
              hours: 19,
              minutes: 30,
              seconds: 0,
              milliseconds: 0,
            }),
            numPersons: 3,
            calendarUrl:
              "http://localhost:8000/v1/reservation_calendar/5/?hash=aafe8cef803ea6aa3dc8c03307016b506554a62397a2c44828fc1d828fa7fee6",
            bufferTimeBefore: null,
            bufferTimeAfter: 1800,
          },
        ].map((n) => ({
          ...n,
          ageGroup: {
            id: "1",
            minimum: 3,
          },
          applyingForFreeOfCharge: undefined,
          billingAddressStreet: "",
          billingAddressZip: "",
          billingAddressCity: "",
          billingEmail: "",
          billingFirstName: "",
          billingLastName: "",
          billingPhone: "",
          reserveeId: "",
          reserveeAddressStreet: "",
          reserveeAddressZip: "",
          reserveeAddressCity: "",
          reserveeIsUnregisteredAssociation: undefined,
          reserveeOrganisationName: "",
        })) as ReservationType[],
      },
    },
  };

  const openingTimes: OpeningTimesType[] =
    reservationUnitOpeningHours.data.reservationUnit.openingHours.openingTimes.filter(
      (openingTime: OpeningTimesType) => {
        return openingTime.date >= startDate && openingTime.date <= endDate;
      }
    );

  const reservations: ReservationType[] =
    reservationUnitOpeningHours.data.reservationUnit.reservations.filter(
      (reservation) => {
        let pass = false;

        if (toApiDate(new Date(reservation.begin)) >= toApiDate(new Date(from)))
          pass = true;

        if (toApiDate(new Date(reservation.begin)) <= toApiDate(new Date(to)))
          pass = true;

        if (state) {
          pass = state.includes(reservation.state);
        }

        return pass;
      }
    );

  return res(
    ctx.data({
      reservationUnitByPk: {
        id: "UmVzZXJ2YXRpb25Vbml0QnlQa1R5cGU6MzY=",
        isDraft: false,
        contactInformation: "",
        descriptionFi: "",
        descriptionEn: "",
        descriptionSv: "",
        nameFi: "",
        nameEn: "",
        nameSv: "",
        requireIntroduction: false,
        uuid: "",
        openingHours: { openingTimes },
        reservations,
      } as ReservationUnitByPkType,
    })
  );
});

const relatedReservationUnitsData: ReservationUnitTypeConnection = {
  edges: [
    {
      node: {
        uuid: "fwaiofmawoiegnmaiwoeng",
        isDraft: false,
        id: "UmVzZXJ2YXRpb25Vbml0VHlwZTozNw==",
        pk: 37,
        nameFi: "Pukinmäen nuorisotalon yläkerta Fi",
        nameEn: "Pukinmäen nuorisotalon yläkerta En",
        nameSv: "Pukinmäen nuorisotalon yläkerta Sv",
        authentication:
          ReservationUnitsReservationUnitAuthenticationChoices.Weak,
        images: [],
        pricings: [
          {
            begins: toUIDate(new Date(), "yyyy-MM-dd"),
            lowestPrice: 12.34,
            lowestPriceNet: 12.34 / 1.2,
            highestPrice: 20,
            highestPriceNet: 20 / 1.2,
            priceUnit:
              ReservationUnitsReservationUnitPricingPriceUnitChoices.PerHour,
            pricingType:
              ReservationUnitsReservationUnitPricingPricingTypeChoices.Paid,
            taxPercentage: {
              id: "goier1",
              value: 20,
            },
            status: ReservationUnitsReservationUnitPricingStatusChoices.Active,
          },
        ],
        unit: {
          id: "VW5pdFR5cGU6Nw==",
          pk: 7,
          nameFi: "Pukinmäen nuorisotalo Fi",
          nameEn: "Pukinmäen nuorisotalo En",
          nameSv: "Pukinmäen nuorisotalo Sv",
          descriptionFi: "",
          descriptionEn: "",
          descriptionSv: "",
          email: "pukinmaen.nuorisotalo@hel.fi",
          shortDescriptionFi: "",
          shortDescriptionEn: "",
          shortDescriptionSv: "",
          webPage: "http://pukinmaki.munstadi.fi/",
          phone: "",
          location: {
            id: "fawioepfjwaeiofjew",
            pk: 25,
            addressStreetFi: "Säterintie 2 Fi",
            addressStreetEn: "Säterintie 2 En",
            addressStreetSv: "Säterintie 2 Sv",
            addressZip: "00720",
            addressCityFi: "Helsinki Fi",
            addressCityEn: "Helsinki En",
            addressCitySv: "Helsinki Sv",
          },
        },
        reservationStartInterval:
          "INTERVAL_30_MINS" as ReservationUnitsReservationUnitReservationStartIntervalChoices,
        reservationUnitType: {
          id: "fj9023fjwifj",
          pk: 3,
          nameFi: "Nuorisopalvelut Fi",
          nameEn: "Nuorisopalvelut En",
          nameSv: "Nuorisopalvelut Sv",
        },
        maxPersons: 45,
        descriptionFi: "",
        descriptionEn: "",
        descriptionSv: "",
        requireIntroduction: false,
        spaces: [
          {
            id: "fjawoi4jfioawgnoawe",
            code: "",
            nameFi: "Yläkerta Fi",
            nameEn: "Yläkerta En",
            nameSv: "Yläkerta Sv",
          },
        ],
        resources: [],
        contactInformation: "",
        requireReservationHandling: false,
        allowReservationsWithoutOpeningHours: true,
        canApplyFreeOfCharge: false,
        reservationKind:
          ReservationUnitsReservationUnitReservationKindChoices.DirectAndSeason,
        isArchived: false,
      } as ReservationUnitType,
      cursor: "YXJyYXljb25uZWN0aW9uOjA=",
    },
    {
      node: {
        uuid: "fwaiofmawodiegnmaiwoeng",
        isDraft: false,
        id: "UmVzZXJ2YXRpb25Vbml0VHlwZTozNg==",
        pk: 48,
        nameFi: "Pukinmäen nuorisotalon sali Fi",
        nameEn: "Pukinmäen nuorisotalon sali En",
        nameSv: "Pukinmäen nuorisotalon sali Sv",
        authentication:
          ReservationUnitsReservationUnitAuthenticationChoices.Weak,
        pricings: [
          {
            begins: toUIDate(new Date(), "yyyy-MM-dd"),
            lowestPrice: 3.34,
            lowestPriceNet: 3.34 / 1.2,
            highestPrice: 30,
            highestPriceNet: 30 / 1.2,
            priceUnit:
              ReservationUnitsReservationUnitPricingPriceUnitChoices.PerWeek,
            pricingType:
              ReservationUnitsReservationUnitPricingPricingTypeChoices.Paid,
            taxPercentage: {
              id: "goier1",
              value: 24,
            },
            status: ReservationUnitsReservationUnitPricingStatusChoices.Active,
          },
        ],
        images: [
          {
            imageUrl: "https://via.placeholder.com/1024x768",
            smallUrl: "https://via.placeholder.com/250x250",
            imageType: "MAIN",
          },
          {
            imageUrl: "https://via.placeholder.com/1024x768",
            smallUrl: "https://via.placeholder.com/250x250",
            imageType: "OTHER",
          },
          {
            imageUrl: "https://via.placeholder.com/1024x768",
            smallUrl: "https://via.placeholder.com/250x250",
            imageType: "OTHER",
          },
        ] as ReservationUnitImageType[],
        unit: {
          id: "VW5pdFR5cGU6Nw==",
          pk: 7,
          nameFi: "Pukinmäen nuorisotalo Fi",
          nameEn: "Pukinmäen nuorisotalo En",
          nameSv: "Pukinmäen nuorisotalo Sv",
          descriptionFi: "",
          descriptionEn: "",
          descriptionSv: "",
          email: "pukinmaen.nuorisotalo@hel.fi",
          shortDescriptionFi: "",
          shortDescriptionEn: "",
          shortDescriptionSv: "",
          webPage: "http://pukinmaki.munstadi.fi/",
          phone: "",
          location: {
            id: "fawioepfjwaeiofjew",
            pk: 25,
            addressStreetFi: "Säterintie 2 Fi",
            addressStreetEn: "Säterintie 2 En",
            addressStreetSv: "Säterintie 2 Sv",
            addressZip: "00720",
            addressCityFi: "Helsinki Fi",
            addressCityEn: "Helsinki En",
            addressCitySv: "Helsinki Sv",
          },
        },
        reservationStartInterval:
          "INTERVAL_30_MINS" as ReservationUnitsReservationUnitReservationStartIntervalChoices,
        reservationUnitType: {
          id: "fj9023fjwifj",
          pk: 3,
          nameFi: "Nuorisopalvelut Fi",
          nameEn: "Nuorisopalvelut En",
          nameSv: "Nuorisopalvelut Sv",
        },
        maxPersons: 60,
        descriptionFi: "",
        descriptionEn: "",
        descriptionSv: "",
        requireIntroduction: false,
        spaces: [
          {
            id: "fwao0ejfaowiefj",
            code: "",
            nameFi: "Sali Fi",
            nameEn: "Sali En",
            nameSv: "Sali Sv",
          },
        ],
        resources: [],
        contactInformation: "",
        requireReservationHandling: false,
        allowReservationsWithoutOpeningHours: true,
        canApplyFreeOfCharge: false,
        reservationKind:
          ReservationUnitsReservationUnitReservationKindChoices.DirectAndSeason,
        isArchived: false,
      } as ReservationUnitType,
      cursor: "YXJyYXljb25uZWN0aW9uOjE=",
    },
  ],
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const reservationUnitTypeData: Parameter[] = [
  { id: 4, name: "Tilan tyyppi" },
  { id: 1, name: "Äänitysstudio" },
  { id: 2, name: "Kokoustila" },
];

const relatedReservationUnits = graphql.query<Query, QueryReservationUnitsArgs>(
  "RelatedReservationUnits",
  (req, res, ctx) => {
    return res(
      ctx.data({
        reservationUnits: relatedReservationUnitsData,
      })
    );
  }
);

const reservationUnitTypesRest = rest.get<Parameter[]>(
  "http://localhost:8000/v1/parameters/reservation_unit_type/",
  (req, res, ctx) => {
    return res(ctx.json(reservationUnitTypeData));
  }
);

const reservationUnitTypes = graphql.query<
  Query,
  QueryReservationUnitTypesArgs
>("ReservationUnitTypes", (req, res, ctx) => {
  const data = {
    edges: reservationUnitTypeData.map((item) => ({
      node: {
        id: item.id.toString(),
        pk: item.id,
        nameFi: item.name as string,
        nameEn: `${item.name} EN`,
        nameSv: `${item.name} SV`,
      },
      cursor: "YXJyYXljb25uZWN0aW9uVHlwZTo=",
    })),
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  return res(ctx.data({ reservationUnitTypes: data }));
});

const termsOfUseData: TermsOfUseTypeConnection = {
  edges: [
    {
      node: {
        id: "1",
        pk: "123235423",
        nameFi: "Perumisehto FI",
        nameEn: "Perumisehto EN",
        nameSv: "Perumisehto SV",
        textFi:
          "PerumisehtoPerumisehtoPerumisehtoPerumisehto PerumisehtoPerumisehtoPerumisehtoPerumisehto",
        textEn: "",
        textSv: "",
        termsType: TermsOfUseTermsOfUseTermsTypeChoices.CancellationTerms,
      },
      cursor: null,
    },
    {
      node: {
        id: "2",
        pk: "1232354fawregra23",
        nameFi: "Maksuehto FI",
        nameEn: "Maksuehto EN",
        nameSv: "Maksuehto SV",
        textFi: "Maksuehto Maksuehto MaksuehtoMaksuehtoMaksuehto",
        textEn: "",
        textSv: "",
        termsType: TermsOfUseTermsOfUseTermsTypeChoices.PaymentTerms,
      },
      cursor: null,
    },
    {
      node: {
        id: "3",
        pk: "KUVAnupa",
        nameFi: "Palveluehto FI",
        nameEn: "Palveluehto EN",
        nameSv: "Palveluehto SV",
        textFi:
          "Palveluehto Palveluehto Palveluehto Palveluehto Palveluehto Palveluehto Palveluehto",
        textEn: "",
        textSv: "",
        termsType: TermsOfUseTermsOfUseTermsTypeChoices.ServiceTerms,
      },
      cursor: null,
    },
    {
      node: {
        id: "4",
        pk: "generic1",
        nameFi: "Sopimusehdot FI",
        nameEn: "Sopimusehdot EN",
        nameSv: "Sopimusehdot SV",
        textFi: "Sopparijuttuja \r\n\r\nToinen rivi",
        textEn: "Sopparijuttuja \r\n\r\nToinen rivi",
        textSv: "Sopparijuttuja \r\n\r\nToinen rivi",
        termsType: TermsOfUseTermsOfUseTermsTypeChoices.GenericTerms,
      },
      cursor: null,
    },
  ],
  pageInfo: null,
};

export const termsOfUse = graphql.query<Query, QueryTermsOfUseArgs>(
  "TermsOfUse",
  (req, res, ctx) => {
    const { termsType } = req.variables;
    const result = termsType
      ? ({
          edges: termsOfUseData.edges.filter(
            (n) => n.node.termsType === termsType.toUpperCase()
          ),
        } as TermsOfUseTypeConnection)
      : termsOfUseData;
    return res(ctx.data({ termsOfUse: result }));
  }
);

const purposeData: PurposeTypeConnection = {
  edges: [
    {
      node: {
        id: "aerwg",
        pk: 1,
        nameFi: "Tutkimus",
        nameEn: "Research",
        nameSv: "Forskning",
        rank: 10,
        smallUrl: "https://via.placeholder.com/390x245",
      },
      cursor: null,
    },
    {
      node: {
        id: "geqrg",
        pk: 13,
        nameFi: "Pidempi title joka menee toiselle riville",
        nameEn: "Longer title that goes to the second line",
        nameSv: "En längre titel som går till andra raden",
        rank: 7,
        smallUrl: "https://via.placeholder.com/390x245",
      },
      cursor: null,
    },
    {
      node: {
        id: "tq34tg",
        pk: 3,
        nameFi: "Purpose #3",
        nameEn: "Purpose #3",
        nameSv: "Purpose #3",
        rank: 3,
        smallUrl: "https://via.placeholder.com/390x245",
      },
      cursor: null,
    },
    {
      node: {
        id: "adtbsdfgb",
        pk: 4,
        nameFi: "Purpose #4",
        nameEn: "Purpose #4",
        nameSv: "Purpose #4",
        rank: 4,
        smallUrl: "https://via.placeholder.com/390x245",
      },
      cursor: null,
    },
    {
      node: {
        id: "stfjhdyj",
        pk: 5,
        nameFi: "Purpose #5",
        nameEn: "Purpose #5",
        nameSv: "Purpose #5",
        rank: 5,
        smallUrl: "https://via.placeholder.com/390x245",
      },
      cursor: null,
    },
    {
      node: {
        id: "hsrftyh",
        pk: 6,
        nameFi: "Purpose #6",
        nameEn: "Purpose #6",
        nameSv: "Purpose #6",
        rank: 6,
        smallUrl: "https://via.placeholder.com/390x245",
      },
      cursor: null,
    },
    {
      node: {
        id: "brstb",
        pk: 7,
        nameFi: "Purpose #7",
        nameEn: "Purpose #7",
        nameSv: "Purpose #7",
        rank: 7,
        smallUrl: "https://via.placeholder.com/390x245",
      },
      cursor: null,
    },
    {
      node: {
        id: "sjrydj",
        pk: 8,
        nameFi: "Purpose #8",
        nameEn: "Purpose #8",
        nameSv: "Purpose #8",
        rank: 8,
        smallUrl: "https://via.placeholder.com/390x245",
      },
      cursor: null,
    },
    {
      node: {
        id: "sjrydj",
        pk: 9,
        nameFi: "Purpose #9",
        nameEn: "Purpose #9",
        nameSv: "Purpose #9",
        rank: 9,
        smallUrl: "https://via.placeholder.com/390x245",
      },
      cursor: null,
    },
  ],
  pageInfo: null,
};

export const reservationUnitPurposes = graphql.query<Query, QueryPurposesArgs>(
  "ReservationUnitPurposes",
  (req, res, ctx) => {
    return res(ctx.data({ purposes: purposeData }));
  }
);

export const reservationUnitHandlers = [
  selectedReservationUnitQuery,
  openingHoursQuery,
  relatedReservationUnits,
  reservationUnitTypesRest,
  reservationUnitTypes,
  termsOfUse,
  reservationUnitPurposes,
];
