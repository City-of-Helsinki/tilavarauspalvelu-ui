import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ReservationType } from "common/types/gql-types";
import withMainMenu from "../withMainMenu";
import EditPageWrapper from "./EditPageWrapper";
import { useReservationEditData } from "./requested/hooks";
import Loader from "../Loader";
import Calendar from "./requested/Calendar";

const EditTime = ({ reservation }: { reservation: ReservationType }) => {
  return (
    <Calendar
      reservationUnitPk={String(reservation?.reservationUnits?.[0]?.pk)}
      reservation={reservation}
      allowEditing
      // FIXME what is the correct value? probably the current reservation time
      focusDate={new Date()}
    />
  );
};

const EditTimePage = () => {
  const params = useParams();
  const id = params.id ?? undefined;

  const { t } = useTranslation("translation", {
    keyPrefix: "Reservation.EditTime",
  });

  const { reservation, loading } = useReservationEditData(id);

  return (
    <EditPageWrapper reservation={reservation} title={t("title")}>
      {loading ? (
        <Loader />
      ) : !reservation ? (
        <div>No reservation</div>
      ) : (
        <EditTime reservation={reservation} />
      )}
    </EditPageWrapper>
  );
};

export default withMainMenu(EditTimePage);
