import React from "react";
import {
  ReservationType,
  ReservationsReservationStateChoices,
} from "common/types/gql-types";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Button } from "hds-react";
import DenyDialog from "./DenyDialog";
import ApproveDialog from "./ApproveDialog";
import ReturnToRequiredHandlingDialog from "./ReturnToRequiresHandlingDialog";
import { useModal } from "../../../context/ModalContext";
import { ButtonLikeLink } from "../../../styles/util";
import {
  isPossibleToApprove,
  isPossibleToDeny,
  isPossibleToEdit,
  isPossibleToReturn,
} from "./reservationModificationRules";

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2-xs);
  width: 100%;
  margin-bottom: var(--spacing-s);
`;

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

  const handleDenyClick = () => {
    setModalContent(
      <DenyDialog
        reservations={[reservation]}
        onReject={handleAccept}
        onClose={handleClose}
      />,
      true
    );
  };

  const handleReturnToHandlingClick = () => {
    setModalContent(
      <ReturnToRequiredHandlingDialog
        reservation={reservation}
        onAccept={handleAccept}
        onClose={handleClose}
      />,
      true
    );
  };

  const handleApproveClick = () => {
    setModalContent(
      <ApproveDialog
        isFree={isFree}
        reservation={reservation}
        onAccept={handleAccept}
        onClose={handleClose}
      />,
      true
    );
  };

  const endTime = new Date(reservation.end);

  const btnCommon = {
    theme: "black",
    size: "small",
    variant: "secondary",
    disabled: false,
  } as const;

  /* For now editing recurring is disabled (not implemented) */
  const isAllowedToModify =
    !reservation.recurringReservation && isPossibleToEdit(state, endTime);

  return (
    <ButtonContainer>
      {endTime > new Date() && isPossibleToApprove(state, endTime) && (
        <Button {...btnCommon} onClick={handleApproveClick}>
          {t("RequestedReservation.approve")}
        </Button>
      )}
      {isPossibleToDeny(state, endTime) && (
        <Button {...btnCommon} onClick={handleDenyClick}>
          {t("RequestedReservation.reject")}
        </Button>
      )}
      {isPossibleToReturn(state, endTime) && (
        <Button {...btnCommon} onClick={handleReturnToHandlingClick}>
          {t("RequestedReservation.returnToHandling")}
        </Button>
      )}
      {isAllowedToModify && (
        <ButtonLikeLink to="edit">{t("ApprovalButtons.edit")}</ButtonLikeLink>
      )}
    </ButtonContainer>
  );
};

export default ApprovalButtons;
