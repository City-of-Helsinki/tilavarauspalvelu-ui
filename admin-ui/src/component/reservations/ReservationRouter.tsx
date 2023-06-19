import React from "react";
import { Route, Routes } from "react-router-dom";
import withMainMenu from "../withMainMenu";
import RequestedReservations from "./RequestedReservations";
import AllReservations from "./AllReservations";
import RequestedReservation from "./requested/RequestedReservation";
import EditTimePage from "./EditTimePage";
import EditPage from "./EditPage";

const EditPageWrapper = withMainMenu(EditPage);
// TODO there is no index? (all and requested works like index but not really)
const ReservationsRouter = (): JSX.Element => (
  <Routes>
    <Route path="requested" element={<RequestedReservations />} />
    <Route path="all" element={<AllReservations />} />
    <Route path=":id" element={<RequestedReservation />} />
    <Route path=":id/edit" element={<EditPageWrapper />} />
    <Route path=":id/edit_time" element={<EditTimePage />} />
  </Routes>
);

export default ReservationsRouter;
