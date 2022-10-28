import React from "react";
import { Route, Switch } from "react-router-dom";
import MyUnits from "./MyUnits";
import ReservationUnitCalendarView from "./ReservationUnitCalendarView";
import UnitReservationsView from "./UnitReservationsView";

const MyUnitsRouter = (): JSX.Element => (
  <Switch>
    <Route path="/my-units" component={MyUnits} exact />
    <Route path="/my-units/:unitId" component={UnitReservationsView} exact />
    <Route
      path="/my-units/:unitId/:reservationUnitId?"
      component={ReservationUnitCalendarView}
    />
  </Switch>
);

export default MyUnitsRouter;
