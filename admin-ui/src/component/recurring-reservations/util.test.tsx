import {
  ApplicationType,
  EventReservationUnitType,
} from "common/types/gql-types";
import { useTranslation } from "react-i18next";
import { appMapper } from "./util";

test("Units are ordered according to priority", async () => {
  const { t } = useTranslation();

  const eventReservationUnits: EventReservationUnitType[] = [
    {
      id: "0",
      priority: 1,
      reservationUnit: {
        unit: {
          id: "100",
          pk: 1,
          nameFi: "unit 100",
        },
      },
    } as EventReservationUnitType,
    {
      id: "1",
      priority: 0,
      reservationUnit: {
        unit: {
          pk: 2,
          id: "200",
          nameFi: "unit 200",
        },
      },
    } as EventReservationUnitType,
  ];
  const application = {
    pk: 1,
    id: "0",
    applicationEvents: [
      {
        id: "0",
        eventReservationUnits,
      },
    ],
  } as ApplicationType;

  const mappedApp = appMapper(application, t);

  expect(mappedApp.units[0].nameFi).toBe("unit 200");
  expect(mappedApp.units[1].nameFi).toBe("unit 100");
});
