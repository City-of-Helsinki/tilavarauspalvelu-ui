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

  const serviceSectorPks =
    reservation?.reservationUnits?.[0]?.unit?.serviceSectors
      ?.map((x) => x?.pk)
      ?.filter((x): x is number => x != null) ?? [];

  const unitPk = reservation?.reservationUnits?.[0]?.unit?.pk ?? undefined;

  const startTime = new Date(reservation.begin);
  const endTime = new Date(reservation.end);
  if (endTime < new Date()) {
    return <div>Already ended: cant change STATUS</div>;
  }
  if (startTime < new Date()) {
    return <div>Already started: cant change STATUS</div>;
  }

  // TODO allow deny without returning to RequiresHandling

  const btnCommon = {
    theme: "black",
    size: "small",
    variant: "secondary",
    disabled: false,
  } as const;

  if (state === ReservationsReservationStateChoices.RequiresHandling) {
    return (
      <VisibleIfPermission
        permissionName="can_manage_reservations"
        unitPk={unitPk}
        serviceSectorPks={serviceSectorPks}
      >
        <Button
          {...btnCommon}
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
          {...btnCommon}
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
      unitPk={unitPk}
      serviceSectorPks={serviceSectorPks}
    >
      <Button
        {...btnCommon}
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
      <Button
        {...btnCommon}
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
};

export default ApprovalButtons;
