import React from "react";
import { Route, Routes } from "react-router-dom";
import MyUnitRecurringReservation from "./[id]/recurring";
import MyUnits from "./index";
import MyUnitView from "./[id]";
import RecurringReservationDone from "./[id]/recurring/completed";

export const MyUnitsRouter = (): JSX.Element => (
  <Routes>
    <Route index element={<MyUnits />} />
    <Route path=":unitId" element={<MyUnitView />} />
    <Route
      path=":unitId/recurring-reservation"
      element={<MyUnitRecurringReservation />}
    />
    <Route
      path=":unitId/recurring-reservation/completed"
      element={<RecurringReservationDone />}
    />
  </Routes>
);
