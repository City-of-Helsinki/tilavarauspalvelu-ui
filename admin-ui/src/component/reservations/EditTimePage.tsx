import React from "react";
import { useParams } from "react-router-dom";
import withMainMenu from "../withMainMenu";
import EditPageWrapper from "./EditPageWrapper";
import { useReservationEditData } from "./requested/hooks";
import Loader from "../Loader";

const EditTime = () => {
  return <div>TODO add a widget to edit the time of the reservation</div>;
};

// TODO h1 to wrapper -> header section ? <H1 $legacy>Muokkaa varauksen aikaa</H1>
const EditTimePage = () => {
  const params = useParams();
  const id = params.id ?? undefined;

  const { reservation, loading } = useReservationEditData(id);

  return (
    <EditPageWrapper reservation={reservation}>
      {loading ? <Loader /> : <EditTime />}
    </EditPageWrapper>
  );
};

export default withMainMenu(EditTimePage);
