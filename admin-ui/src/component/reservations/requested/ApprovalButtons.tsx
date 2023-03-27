import React from "react";
import {
  ReservationType,
  ReservationsReservationStateChoices,
} from "common/types/gql-types";
import { useTranslation } from "react-i18next";
import { Button } from "hds-react";
import DenyDialog from "./DenyDialog";
import ApproveDialog from "./ApproveDialog";
import ReturnToRequiredHandlingDialog from "./ReturnToRequiresHandlingDialog";
import VisibleIfPermission from "./VisibleIfPermission";
import { useModal } from "../../../context/ModalContext";

const ApprovalButtons = ({
  state,
  isFree,
  reservation,
  handleClose,
  handleAccept,
}: {
  state: ReservationsReservationStateChoices;
  isFree: boolean;
  reservation: ReservationType;
  handleClose: () => void;
  handleAccept: () => void;
}) => {
  const { setModalContent } = useModal();
  const { t } = useTranslation();

  if (state === ReservationsReservationStateChoices.RequiresHandling) {
    return (
      <VisibleIfPermission
        permissionName="can_manage_reservations"
        unitPk={reservation?.reservationUnits?.[0]?.unit?.pk as number}
      >
        <Button
          theme="black"
          size="small"
          variant="secondary"
          disabled={false}
          onClick={(e) => {
            e.preventDefault();
            setModalContent(
              <ApproveDialog
                isFree={isFree}
                reservation={reservation}
                onAccept={handleAccept}
                onClose={handleClose}
              />,
              true
            );
          }}
        >
          {t("RequestedReservation.approve")}
        </Button>
        <Button
          size="small"
          theme="black"
          variant="secondary"
          disabled={false}
          onClick={(e) => {
            e.preventDefault();
            setModalContent(
              <DenyDialog
                reservation={reservation}
                onReject={handleAccept}
                onClose={handleClose}
              />,
              true
            );
          }}
        >
          {t("RequestedReservation.reject")}
        </Button>
      </VisibleIfPermission>
    );
  }

  return (
    <VisibleIfPermission
      permissionName="can_manage_reservations"
      unitPk={reservation?.reservationUnits?.[0]?.unit?.pk as number}
    >
      <Button
        size="small"
        variant="secondary"
        theme="black"
        disabled={false}
        onClick={(e) => {
          e.preventDefault();
          setModalContent(
            <ReturnToRequiredHandlingDialog
              reservation={reservation}
              onAccept={handleAccept}
              onClose={handleClose}
            />,
            true
          );
        }}
      >
        {t("RequestedReservation.returnToHandling")}
      </Button>
    </VisibleIfPermission>
  );
};

export default ApprovalButtons;
