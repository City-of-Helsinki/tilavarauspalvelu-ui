import React from "react";
import { RecurringReservationType } from "common/types/gql-types";
import { useTranslation } from "react-i18next";
import { Button } from "hds-react";
import DenyDialog from "./DenyDialog";
import { useModal } from "../../../context/ModalContext";
import { useRecurringReservations } from "./hooks";
import Loader from "../../Loader";

// NOTE some copy paste from ApprovalButtons
// NOTE refresh seems to work, but confirm it and simplify if possible
//  the ReservationList isn't updated (requires refetching all linked reservations)
//  the deny button here should be disabled after running this once
// TODO different (Finnish) reasons for user if the reservation can't be removed
const ApprovalButtonsRecurring = ({
  recurringReservation,
  handleClose,
  handleAccept,
}: {
  recurringReservation: RecurringReservationType;
  handleClose: () => void;
  handleAccept: () => void;
}) => {
  const { setModalContent } = useModal();
  const { t } = useTranslation();

  const { loading, reservations, refetch } = useRecurringReservations(
    recurringReservation.pk ?? undefined
  );

  const handleDeleteSuccess = () => {
    console.log("Deleted succesfully");
    refetch();
    handleAccept();
  };

  const now = new Date();
  const reservationsPossibleToDelete = reservations
    .filter((x) => new Date(x.begin) > now)
    .filter((x) => x.state !== "DENIED");

  const handleDenyClick = () => {
    console.log(
      `Delete recurring reservation: ${reservationsPossibleToDelete.length} / ${reservations.length}`
    );

    // TODO need a callback to delete the recurring or not?
    // it's iffy since some of the recurrance might have already happened
    setModalContent(
      <DenyDialog
        reservations={reservationsPossibleToDelete}
        onReject={handleDeleteSuccess}
        onClose={handleClose}
      />,
      true
    );
  };

  if (loading) {
    return <Loader />;
  }

  const btnCommon = {
    theme: "black",
    size: "small",
    variant: "secondary",
    disabled: false,
  } as const;

  // TODO can't delete if all deleted => tell the user
  // TODO can't delete if all in the past => tell the user
  const isNotDeleted = reservationsPossibleToDelete.length > 0;
  if (!isNotDeleted) {
    return <div>Cant delete already deleted set</div>;
  }

  return (
    <Button {...btnCommon} onClick={handleDenyClick}>
      {t("RequestedReservation.rejectAll")}
    </Button>
  );
};

export default ApprovalButtonsRecurring;
