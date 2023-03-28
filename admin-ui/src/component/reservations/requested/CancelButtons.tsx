import React from "react";
import type { ReservationType } from "common/types/gql-types";
import { Button } from "hds-react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../../context/ModalContext";
import CancelDialog from "./CancelDialog";

type Props = {
  reservation: ReservationType;
  handleClose: () => void;
  handleAccept: () => void;
};
const CancelButtons = ({ reservation, handleClose, handleAccept }: Props) => {
  const { setModalContent } = useModal();
  const { t } = useTranslation();

  // TODO translate
  // FIXME this should be disabled if the Unit does not support cancelations
  // or if the cancelation period has already gone.
  return (
    <Button
      theme="black"
      size="small"
      variant="secondary"
      disabled={false}
      onClick={(e) => {
        e.preventDefault();
        setModalContent(
          <CancelDialog
            reservation={reservation}
            onReject={handleAccept}
            onClose={handleClose}
          />,
          true
        );
      }}
    >
      {t("Cancel")}
    </Button>
  );
};

export default CancelButtons;
