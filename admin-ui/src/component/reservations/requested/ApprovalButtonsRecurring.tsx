import React from "react";
import { RecurringReservationType } from "common/types/gql-types";
import { useTranslation } from "react-i18next";
import { Button } from "hds-react";
import DenyDialog from "./DenyDialog";
import { useModal } from "../../../context/ModalContext";
import { useRecurringReservations } from "./hooks";
import Loader from "../../Loader";

// NOTE some copy paste from ApprovalButtons
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

  // TODO need total count here because reservations is not complete (so the filters fail)
  const { loading, reservations, refetch } = useRecurringReservations(
    recurringReservation.pk ?? undefined
  );

  const handleDeleteSuccess = () => {
    refetch();
    handleAccept();
  };

  const now = new Date();
  const reservationsPossibleToDelete = reservations
    .filter((x) => new Date(x.begin) > now)
    .filter((x) => x.state !== "DENIED");

  const handleDenyClick = () => {
    // TODO this needs to show progress indicator (deleting 100+ reservations take a long time)
    setModalContent(
      <DenyDialog
        reservations={reservationsPossibleToDelete}
        onReject={handleDeleteSuccess}
        onClose={handleClose}
        title={t("ApprovalButtons.recurring.DenyDialog.title")}
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

  if (reservationsPossibleToDelete.length === 0) {
    return null;
  }

  return (
    <Button {...btnCommon} onClick={handleDenyClick}>
      {t("ApprovalButtons.recurring.rejectAllButton")}
    </Button>
  );
};

export default ApprovalButtonsRecurring;
