import React from "react";
import {
  RecurringReservationType,
  ReservationsReservationStateChoices,
} from "common/types/gql-types";
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

  const { loading, reservations, refetch, fetchMore, totalCount } =
    useRecurringReservations(
      recurringReservation.pk ?? undefined,
      ReservationsReservationStateChoices.Confirmed
    );

  const handleDeleteSuccess = () => {
    refetch();
    handleAccept();
  };

  const now = new Date();
  const reservationsPossibleToDelete = reservations.filter(
    (x) => new Date(x.begin) > now
  );

  const handleDenyClick = () => {
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

  // Don't allow delete all unless we have loaded all
  // TODO this should use an auto loader (assuming totalCount < 1000 or something)
  // and show a load indicator while we are waiting
  if (reservations.length !== totalCount) {
    return (
      <Button
        {...btnCommon}
        onClick={() =>
          fetchMore({ variables: { offset: reservations.length } })
        }
      >
        {t("common.showMore")}
      </Button>
    );
  }

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
