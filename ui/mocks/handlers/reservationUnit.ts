import { graphql } from "msw";
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
} from "../../modules/gql-types";
import { toApiDate } from "../../modules/util";

const selectedReservationUnitQuery = graphql.query<
  Query,
  QueryReservationUnitByPkArgs
>("SelectedReservationUnit", async (req, res, ctx) => {
  const reservationUnitByPk: ReservationUnitByPkType = {
    resources: [],
    services: [],
    uuid: "",
    contactInformationFi: null,
    contactInformationEn: null,
    contactInformationSv: null,
    id: "UmVzZXJ2YXRpb25Vbml0QnlQa1R5cGU6MzY=",
    pk: 36,
    nameFi: "Pukinmäen nuorisotalon keittiö FI",
    nameEn: "Pukinmäen nuorisotalon keittiö EN",
    nameSv: "Pukinmäen nuorisotalon keittiö SV",
    images: [
      {
        imageUrl:
          "http://localhost:8000/media/reservation_unit_images/lavenderhouse_1-x_large.jpg",
        mediumUrl:
          "http://localhost:8000/media/reservation_unit_images/lavenderhouse_1-x_large.jpg.384x384_q85_crop.jpg",
        smallUrl:
          "http://localhost:8000/media/reservation_unit_images/lavenderhouse_1-x_large.jpg.250x250_q85_crop.jpg",
        imageType: "MAIN",
      },
      {
        imageUrl:
          "http://localhost:8000/media/reservation_unit_images/external-content.duckduckgo.jpg",
        mediumUrl:
          "http://localhost:8000/media/reservation_unit_images/external-content.duckduckgo.jpg.384x384_q85_crop.jpg",
        smallUrl:
          "http://localhost:8000/media/reservation_unit_images/external-content.duckduckgo.jpg.250x250_q85_crop.jpg",
        imageType: "OTHER",
      },
      {
        imageUrl:
          "http://localhost:8000/media/reservation_unit_images/575479-L.jpg",
        mediumUrl:
          "http://localhost:8000/media/reservation_unit_images/575479-L.jpg.384x384_q85_crop.jpg",
        smallUrl:
          "http://localhost:8000/media/reservation_unit_images/575479-L.jpg.250x250_q85_crop.jpg",
        imageType: "OTHER",
      },
    ] as ReservationUnitImageType[],
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
    reservationUnitType: {
      id: "UmVzZXJ2YXRpb25Vbml0VHlwZVR5cGU6Mw==",
      nameFi: "Nuorisopalvelut Fi",
      nameEn: "Nuorisopalvelut En",
      nameSv: "Nuorisopalvelut Sv",
    },
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
    },
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
    minReservationDuration: "01:00:00",
    maxReservationDuration: "01:30:00",
    nextAvailableSlot: "2021-09-21T09:30:00Z",
    spaces: [
      {
        id: "U3BhY2VUeXBlOjQx",
        pk: 41,
        nameFi: "Sali Fi",
        nameEn: "Sali En",
        nameSv: "Sali Sv",
        code: "",
        termsOfUseFi: "TErms of USEE Fi",
        termsOfUseEn: "TErms of USEE En",
        termsOfUseSv: "TErms of USEE Sv",
      },
    ],
    openingHours: {
      openingTimePeriods: [
        {
          periodId: 38600,
          startDate: "2020-10-12",
          endDate: "2021-10-11",
          resourceState: null,
          timeSpans: [
            {
              startTime: "09:00:00",
              endTime: "12:00:00",
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
              startTime: "12:00:00",
              endTime: "21:00:00",
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
          startDate: "2021-10-12",
          endDate: "2021-10-30",
          resourceState: null,
          timeSpans: [
            {
              startTime: "09:00:00",
              endTime: "21:00:00",
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
              startTime: "09:00:00",
              endTime: "21:00:00",
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
  };

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
          openingTimes: [
            {
              date: "2021-09-20",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-09-20",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-09-21",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-09-25",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-09-26",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-09-26",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-09-27",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-09-27",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-09-28",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-02",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-03",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-03",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-04",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-04",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-05",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-09",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-10",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-10",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-11",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-11",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-12",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-16",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-17",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-17",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-18",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-18",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-19",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-23",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-24",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-24",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-25",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-25",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-26",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-10-30",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-11-01",
              startTime: "09:00:00",
              endTime: "12:00:00",
              state: "open",
              periods: null,
            },
            {
              date: "2021-11-01",
              startTime: "12:00:00",
              endTime: "21:00:00",
              state: "open",
              periods: null,
            },
          ],
        },
        reservations: [
          {
            id: "UmVzZXJ2YXRpb25UeXBlOjU=",
            pk: 5,
            state: "CREATED",
            priority: "A_200",
            begin: "2021-10-27T12:50:31+00:00",
            end: "2021-10-27T13:50:35+00:00",
            numPersons: 3,
            calendarUrl:
              "http://localhost:8000/v1/reservation_calendar/5/?hash=aafe8cef803ea6aa3dc8c03307016b506554a62397a2c44828fc1d828fa7fee6",
          },
          {
            id: "UmV3ZXJ2YXRpb25UeXB3OjU=",
            pk: 6,
            state: "CREATED",
            priority: "A_200",
            begin: "2021-11-27T12:50:31+00:00",
            end: "2021-11-27T13:50:35+00:00",
            numPersons: 3,
            calendarUrl:
              "http://localhost:8000/v1/reservation_calendar/5/?hash=aafe8cef803ea6aa3dc8c03307016b506554a62397a2c44828fc1d828fa7fee6",
          },
        ] as ReservationType[],
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
        contactInformationFi: "",
        contactInformationEn: "",
        contactInformationSv: "",
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
      },
    })
  );
});

const relatedReservationUnitsData: ReservationUnitTypeConnection = {
  edges: [
    {
      node: {
        id: "UmVzZXJ2YXRpb25Vbml0VHlwZTozNw==",
        pk: 37,
        nameFi: "Pukinmäen nuorisotalon yläkerta Fi",
        nameEn: "Pukinmäen nuorisotalon yläkerta En",
        nameSv: "Pukinmäen nuorisotalon yläkerta Sv",
        images: [],
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
        },
        reservationUnitType: {
          id: "fj9023fjwifj",
          pk: 3,
          nameFi: "Nuorisopalvelut Fi",
          nameEn: "Nuorisopalvelut En",
          nameSv: "Nuorisopalvelut Sv",
        },
        maxPersons: 45,
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
        contactInformationFi: "",
        contactInformationEn: "",
        contactInformationSv: "",
      },
      cursor: "YXJyYXljb25uZWN0aW9uOjA=",
    },
    {
      node: {
        id: "UmVzZXJ2YXRpb25Vbml0VHlwZTozNg==",
        pk: 36,
        nameFi: "Pukinmäen nuorisotalon sali Fi",
        nameEn: "Pukinmäen nuorisotalon sali En",
        nameSv: "Pukinmäen nuorisotalon sali Sv",
        images: [
          {
            imageUrl:
              "http://localhost:8000/media/reservation_unit_images/lavenderhouse_1-x_large.jpg",
            smallUrl:
              "http://localhost:8000/media/reservation_unit_images/lavenderhouse_1-x_large.jpg.250x250_q85_crop.jpg",
            imageType: "MAIN",
          },
          {
            imageUrl:
              "http://localhost:8000/media/reservation_unit_images/external-content.duckduckgo.jpg",
            smallUrl:
              "http://localhost:8000/media/reservation_unit_images/external-content.duckduckgo.jpg.250x250_q85_crop.jpg",
            imageType: "OTHER",
          },
          {
            imageUrl:
              "http://localhost:8000/media/reservation_unit_images/575479-L.jpg",
            smallUrl:
              "http://localhost:8000/media/reservation_unit_images/575479-L.jpg.250x250_q85_crop.jpg",
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
        },
        reservationUnitType: {
          id: "fj9023fjwifj",
          pk: 3,
          nameFi: "Nuorisopalvelut Fi",
          nameEn: "Nuorisopalvelut En",
          nameSv: "Nuorisopalvelut Sv",
        },
        maxPersons: 60,
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
        contactInformationFi: "",
        contactInformationEn: "",
        contactInformationSv: "",
      },
      cursor: "YXJyYXljb25uZWN0aW9uOjE=",
    },
  ],
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

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

export const reservationUnitHandlers = [
  selectedReservationUnitQuery,
  openingHoursQuery,
  relatedReservationUnits,
];
