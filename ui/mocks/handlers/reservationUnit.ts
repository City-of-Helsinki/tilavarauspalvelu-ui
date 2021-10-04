import { graphql } from "msw";
import {
  OpeningHours,
  OpeningTime,
  ReservationUnit,
  Reservation,
  ReservationState,
} from "../../modules/types";
import { toApiDate } from "../../modules/util";

type Variables = {
  pk: number;
};

type ReturnType = {
  reservationUnit: ReservationUnit;
};

type OpeningHoursVariables = {
  pk: number;
  openingHoursFrom: string;
  openingHoursTo: string;
  reservationsFrom: string;
  reservationsTo: string;
  reservationState: [ReservationState];
};

type OpeningHoursReturnType = {
  reservationUnit: OpeningHours;
};

const selectedReservationUnitQuery = graphql.query<ReturnType, Variables>(
  "SelectedReservationUnit",
  async (req, res, ctx) => {
    const reservationUnit: ReservationUnit = {
      resources: [],
      services: [],
      contactInformation: null,
      unitId: 7,
      id: 36,
      name: { fi: "Pukinmäen nuorisotalon keittiö" },
      images: [
        {
          imageUrl:
            "http://localhost:8000/media/reservation_unit_images/lavenderhouse_1-x_large.jpg",
          mediumUrl:
            "http://localhost:8000/media/reservation_unit_images/lavenderhouse_1-x_large.jpg.384x384_q85_crop.jpg",
          smallUrl:
            "http://localhost:8000/media/reservation_unit_images/lavenderhouse_1-x_large.jpg.250x250_q85_crop.jpg",
          imageType: "main",
        },
        {
          imageUrl:
            "http://localhost:8000/media/reservation_unit_images/external-content.duckduckgo.jpg",
          mediumUrl:
            "http://localhost:8000/media/reservation_unit_images/external-content.duckduckgo.jpg.384x384_q85_crop.jpg",
          smallUrl:
            "http://localhost:8000/media/reservation_unit_images/external-content.duckduckgo.jpg.250x250_q85_crop.jpg",
          imageType: "other",
        },
        {
          imageUrl:
            "http://localhost:8000/media/reservation_unit_images/575479-L.jpg",
          mediumUrl:
            "http://localhost:8000/media/reservation_unit_images/575479-L.jpg.384x384_q85_crop.jpg",
          smallUrl:
            "http://localhost:8000/media/reservation_unit_images/575479-L.jpg.250x250_q85_crop.jpg",
          imageType: "other",
        },
      ],
      description:
        "<p>Sali sijaitsee nuorisotalon toisessa kerroksessa. Tilaan mahtuu 60 henkil&ouml;&auml;..</p>",
      termsOfUse:
        "<p>Nuorisotilojen yleiset varausehdot</p>\r\n<p><strong>1 Soveltamisala</strong></p>\r\n<p>N&auml;m&auml; varausehdot koskevat Helsingin kaupungin nuorisopalveluiden hallinnoimien tilojen ja laitteiden varaamista, k&auml;ytt&ouml;vuoron hakemista Tilavaraus-palvelun kautta sek&auml; nuorisopalveluiden hallinnoimien tilojen ja laitteiden k&auml;ytt&ouml;&auml;. N&auml;m&auml; varausehdot t&auml;ydent&auml;v&auml;t Helsingin kaupungin tilojen ja laitteiden varausehtoja. Varaamalla resurssin tai hakemalla k&auml;ytt&ouml;vuoroa hyv&auml;ksyt n&auml;m&auml; ehdot.</p>",
      reservationUnitType: {
        id: 1,
        name: "Nuorisopalvelut",
      },
      maxPersons: 60,
      building: {
        id: 7,
        name: "Pukinmäen nuorisotalo",
      },
      location: {
        id: 1,
        latitude: "60.29429873400916",
        longitude: "25.07080078125",
        addressStreet: "Säterintie 2",
        addressZip: "00720",
        addressCity: "Helsinki",
      },
      minReservationDuration: "01:00:00",
      maxReservationDuration: "01:30:00",
      nextAvailableSlot: "2021-09-21T09:30:00Z",
      spaces: [
        {
          id: 41,
          name: { fi: "Sali" },
          termsOfUse: "TErms of USEE",
          locationType: null,
          surfaceArea: null,
          districtId: null,
          parentId: null,
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
                name: {
                  fi: null,
                  en: null,
                  sv: null,
                },
                description: {
                  fi: null,
                  en: null,
                  sv: null,
                },
              },
              {
                startTime: "12:00:00",
                endTime: "21:00:00",
                weekdays: [7, 2],
                resourceState: "open",
                endTimeOnNextDay: null,
                name: {
                  fi: null,
                  en: null,
                  sv: null,
                },
                description: {
                  fi: null,
                  en: null,
                  sv: null,
                },
              },
            ],
            name: {
              fi: "Vakiovuorot",
              en: "",
              sv: "",
            },
            description: {
              fi: "",
              en: "",
              sv: "",
            },
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
                name: {
                  fi: null,
                  en: null,
                  sv: null,
                },
                description: {
                  fi: null,
                  en: null,
                  sv: null,
                },
              },
              {
                startTime: "09:00:00",
                endTime: "21:00:00",
                weekdays: [7],
                resourceState: "open",
                endTimeOnNextDay: null,
                name: {
                  fi: null,
                  en: null,
                  sv: null,
                },
                description: {
                  fi: null,
                  en: null,
                  sv: null,
                },
              },
            ],
            name: {
              fi: "Vakiovuorot",
              en: "",
              sv: "",
            },
            description: {
              fi: "",
              en: "",
              sv: "",
            },
          },
        ],
      },
      requireIntroduction: false,
    };

    return res(ctx.data({ reservationUnit }));
  }
);

const openingHoursQuery = graphql.query<
  OpeningHoursReturnType,
  OpeningHoursVariables
>("ReservationUnitOpeningHours", async (req, res, ctx) => {
  const {
    openingHoursFrom,
    openingHoursTo,
    reservationsFrom,
    reservationsTo,
    reservationState,
  } = req.variables;

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
            id: 5,
            state: "created" as ReservationState,
            priority: "A_200",
            begin: "2021-10-27T12:50:31+00:00",
            end: "2021-10-27T13:50:35+00:00",
            numPersons: 3,
            calendarUrl:
              "http://localhost:8000/v1/reservation_calendar/5/?hash=aafe8cef803ea6aa3dc8c03307016b506554a62397a2c44828fc1d828fa7fee6",
          },
          {
            id: 6,
            state: "created" as ReservationState,
            priority: "A_200",
            begin: "2021-11-27T12:50:31+00:00",
            end: "2021-11-27T13:50:35+00:00",
            numPersons: 3,
            calendarUrl:
              "http://localhost:8000/v1/reservation_calendar/5/?hash=aafe8cef803ea6aa3dc8c03307016b506554a62397a2c44828fc1d828fa7fee6",
          },
        ],
      },
    },
  };

  const openingTimes: OpeningTime[] =
    reservationUnitOpeningHours.data.reservationUnit.openingHours.openingTimes.filter(
      (openingTime: OpeningTime) => {
        return (
          openingTime.date >= openingHoursFrom &&
          openingTime.date <= openingHoursTo
        );
      }
    );

  const reservations: Reservation[] =
    reservationUnitOpeningHours.data.reservationUnit.reservations.filter(
      (reservation) => {
        let pass = false;
        if (
          toApiDate(new Date(reservation.begin)) >=
          toApiDate(new Date(reservationsFrom))
        )
          pass = true;

        if (
          toApiDate(new Date(reservation.begin)) <=
          toApiDate(new Date(reservationsTo))
        )
          pass = true;

        if (reservationState) {
          pass = reservationState.includes(reservation.state);
        }

        return pass;
      }
    );

  return res(
    ctx.data({
      reservationUnit: {
        openingHours: { openingTimes },
        reservations,
      } as OpeningHours,
    })
  );
});

type RelatedNode = {
  node: ReservationUnit;
};

type RelatedEdges = {
  edges: RelatedNode[];
};

type RelatedReservationUnitsReturnType = {
  relatedReservationUnits: RelatedEdges;
};

type RelatedReservationUnitsArgs = {
  id: string;
};

const relatedReservationUnitsData = {
  edges: [
    {
      node: {
        id: 48,
        services: [],
        unitId: 1,
        name: { fi: "Arabian nuorisotalon sali" },
        images: [],
        building: {
          id: 11,
          name: "Arabian nuorisotalo",
        },
        reservationUnitType: {
          id: 3,
          name: { fi: "Nuorisopalvelut" },
        },
        maxPersons: 100,
        location: {
          id: 34,
          addressStreet: "Arabianpolku 1 A 2",
          addressZip: "00560",
          addressCity: "Helsinki",
        },
        description: "",
        requireIntroduction: false,
        spaces: [
          {
            name: { fi: "Sali" },
            id: 1,
            termsOfUse: "TErms of USEE",
            locationType: null,
            surfaceArea: null,
            districtId: null,
            parentId: null,
          },
        ],
        resources: [],
      },
    },
    {
      node: {
        id: 45,
        services: [],
        unitId: 1,
        name: { fi: "Hertsin nuorisotalon sali" },
        images: [],
        building: {
          id: 13,
          name: "Hertsin nuorisotila",
        },
        reservationUnitType: {
          id: 3,
          name: { fi: "Nuorisopalvelut" },
        },
        maxPersons: 15,
        location: {
          id: 38,
          addressStreet: "Linnanrakentajantie 2",
          addressZip: "00880",
          addressCity: "Helsinki",
        },
        description: "",
        requireIntroduction: false,
        spaces: [
          {
            name: { fi: "Sali" },
            id: 1,
            termsOfUse: "TErms of USEE",
            locationType: null,
            surfaceArea: null,
            districtId: null,
            parentId: null,
          },
        ],
        resources: [],
      },
    },
    {
      node: {
        id: 40,
        services: [],
        unitId: 1,
        name: { fi: "Jakomäen sydämen liikkumistila" },
        images: [],
        building: {
          id: 14,
          name: "Jakomäen nuorisotalo",
        },
        reservationUnitType: {
          id: 3,
          name: { fi: "Nuorisopalvelut" },
        },
        maxPersons: 10,
        location: {
          id: 39,
          addressStreet: "Jakomäenpolku 6",
          addressZip: "00770",
          addressCity: "Helsinki",
        },
        description: "",
        requireIntroduction: false,
        spaces: [
          {
            name: { fi: "Liikkumistila" },
            id: 1,
            termsOfUse: "TErms of USEE",
            locationType: null,
            surfaceArea: null,
            districtId: null,
            parentId: null,
          },
        ],
        resources: [],
      },
    },
    {
      node: {
        id: 53,
        services: [],
        unitId: 1,
        name: { fi: "Pasilan nuorisotalon järjestötila" },
        images: [],
        building: {
          id: 9,
          name: "Pasilan nuorisotalo",
        },
        reservationUnitType: {
          id: 3,
          name: { fi: "Nuorisopalvelut" },
        },
        maxPersons: 15,
        location: {
          id: 28,
          addressStreet: "Pasilanraitio 6",
          addressZip: "00240",
          addressCity: "Helsinki",
        },
        description: "",
        requireIntroduction: false,
        spaces: [
          {
            name: { fi: "Järjestötila" },
            id: 1,
            termsOfUse: "TErms of USEE",
            locationType: null,
            surfaceArea: null,
            districtId: null,
            parentId: null,
          },
        ],
        resources: [],
      },
    },
    {
      node: {
        id: 52,
        services: [],
        unitId: 1,
        name: { fi: "Koskelan nuorisotalon yläkerran ryhmätila 2" },
        images: [],
        building: {
          id: 10,
          name: "Koskelan nuorisotalo",
        },
        reservationUnitType: {
          id: 3,
          name: { fi: "Nuorisopalvelut" },
        },
        maxPersons: 15,
        location: {
          id: 30,
          addressStreet: "Antti Korpin tie 3 a",
          addressZip: "00600",
          addressCity: "Helsinki",
        },
        description: "",
        requireIntroduction: false,
        spaces: [
          {
            name: { fi: "Yläkerta/ryhmätila 2" },
            id: 1,
            termsOfUse: "TErms of USEE",
            locationType: null,
            surfaceArea: null,
            districtId: null,
            parentId: null,
          },
        ],
        resources: [],
      },
    },
    {
      node: {
        id: 51,
        services: [],
        unitId: 1,
        name: { fi: "Koskelan nuorisotalon yläkerran ryhmätila 1" },
        images: [],
        building: {
          id: 10,
          name: "Koskelan nuorisotalo",
        },
        reservationUnitType: {
          id: 3,
          name: { fi: "Nuorisopalvelut" },
        },
        maxPersons: 15,
        location: {
          id: 31,
          addressStreet: "Antti Korpin tie 3 a",
          addressZip: "00600",
          addressCity: "Helsinki",
        },
        description: "",
        requireIntroduction: false,
        spaces: [
          {
            name: { fi: "Yläkerta/ryhmätila 1" },
            id: 1,
            termsOfUse: "TErms of USEE",
            locationType: null,
            surfaceArea: null,
            districtId: null,
            parentId: null,
          },
        ],
        resources: [],
      },
    },
    {
      node: {
        id: 35,
        services: [],
        unitId: 1,
        name: { fi: "Malmin nuorisotalon alakerta" },
        images: [],
        building: {
          id: 6,
          name: "Malmin nuorisotalo",
        },
        reservationUnitType: {
          id: 3,
          name: { fi: "Nuorisopalvelut" },
        },
        maxPersons: 16,
        location: {
          id: 23,
          addressStreet: "Kunnantie 3",
          addressZip: "00700",
          addressCity: "Helsinki",
        },
        description: "",
        requireIntroduction: false,
        spaces: [
          {
            name: { fi: "Alakerta" },
            id: 1,
            termsOfUse: "TErms of USEE",
            locationType: null,
            surfaceArea: null,
            districtId: null,
            parentId: null,
          },
        ],
        resources: [],
      },
    },
  ],
};

const relatedReservationUnits = graphql.query<
  RelatedReservationUnitsReturnType,
  RelatedReservationUnitsArgs
>("RelatedReservationUnits", (req, res, ctx) => {
  return res(
    ctx.data({
      relatedReservationUnits: relatedReservationUnitsData,
    })
  );
});

export const reservationUnitHandlers = [
  selectedReservationUnitQuery,
  openingHoursQuery,
  relatedReservationUnits,
];
