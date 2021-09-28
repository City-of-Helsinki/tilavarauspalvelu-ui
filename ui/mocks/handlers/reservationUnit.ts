import { graphql } from "msw";
import {
  OpeningHours,
  OpeningTime,
  ReservationUnit,
} from "../../modules/types";

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

export const reservationUnitHandlers = [
  graphql.query<ReturnType, Variables>(
    "SelectedReservationUnit",
    async (req, res, ctx) => {
      const reservationUnit: ReservationUnit = {
        resources: [],
        services: [],
        contactInformation: null,
        unitId: 7,
        id: 36,
        name: "Pukinmäen nuorisotalon keittiö",
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
  ),
  graphql.query<OpeningHoursReturnType, OpeningHoursReturnVariables>(
    "ReservationUnitOpeningHours",
    async (req, res, ctx) => {
      const { openingHoursFrom, openingHoursTo } = req.variables;

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

      return res(
        ctx.data({
          reservationUnit: { openingHours: { openingTimes } } as OpeningHours,
        })
      );
    }
  ),
];
