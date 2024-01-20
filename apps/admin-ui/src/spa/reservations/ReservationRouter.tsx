import React from "react";
import { Route, Routes } from "react-router-dom";
import RequestedReservations from "./list";
import AllReservations from ".";
import RequestedReservation from "./[id]";
import EditPage from "./EditPage";

// TODO there is no index? (all and requested works like index but not really)
const ReservationsRouter = (): JSX.Element => (
  <Routes>
    <Route path="requested" element={<RequestedReservations />} />
    <Route path="all" element={<AllReservations />} />
    <Route path=":id" element={<RequestedReservation />} />
    <Route path=":id/edit" element={<EditPage />} />
  </Routes>
);

export default ReservationsRouter;
