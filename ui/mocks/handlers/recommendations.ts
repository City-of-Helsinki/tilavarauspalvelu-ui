import { graphql } from "msw";
import { PageInfo, Query, ReservationUnitType } from "../../modules/gql-types";

export const recommendationHandlers = [
  graphql.query<Query>("Recommendations", async (req, res, ctx) => {
    const recommendations = {
      edges: [
        {
          node: {
            id: "UmVzZXJ2YXRpb25Vbml0VHlwZTozNw==",
            pk: 37,
            name: "Pukinmäen nuorisotalon yläkerta",
            images: [],
            unit: {
              id: "VW5pdFR5cGU6Nw==",
              pk: 7,
              name: "Pukinmäen nuorisotalo",
              description: "",
              email: "pukinmaen.nuorisotalo@hel.fi",
              shortDescription: "",
              webPage: "http://pukinmaki.munstadi.fi/",
            },
            reservationUnitType: {
              pk: 3,
              name: "Nuorisopalvelut",
            },
            maxPersons: 45,
            location: {
              pk: 25,
              addressStreet: "Säterintie 2",
              addressZip: "00720",
              addressCity: "Helsinki",
            },
            description: "",
            requireIntroduction: false,
            spaces: [
              {
                name: "Yläkerta",
              },
            ],
            resources: [],
            contactInformation: "",
          } as ReservationUnitType,
          cursor: "YXJyYXljb25uZWN0aW9uOjA=",
        },
        {
          node: {
            id: "UmVzZXJ2YXRpb25Vbml0VHlwZTozNg==",
            pk: 36,
            name: "Pukinmäen nuorisotalon sali",
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
            ],
            unit: {
              id: "VW5pdFR5cGU6Nw==",
              pk: 7,
              name: "Pukinmäen nuorisotalo",
              description: "",
              email: "pukinmaen.nuorisotalo@hel.fi",
              shortDescription: "",
              webPage: "http://pukinmaki.munstadi.fi/",
            },
            reservationUnitType: {
              pk: 3,
              name: "Nuorisopalvelut",
            },
            maxPersons: 60,
            location: {
              pk: 26,
              addressStreet: "Säterintie 2",
              addressZip: "00720",
              addressCity: "Helsinki",
            },
            description: "",
            requireIntroduction: false,
            spaces: [
              {
                name: "Sali",
              },
            ],
            resources: [],
            contactInformation: "",
          } as ReservationUnitType,
          cursor: "YXJyYXljb25uZWN0aW9uOjE=",
        },
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      } as PageInfo,
    };

    return res(ctx.data({ reservationUnits: recommendations }));
  }),
];
