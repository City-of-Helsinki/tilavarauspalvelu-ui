import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Dialog, IconInfoCircle } from "hds-react";
import {
  type ReservationRequiresHandlingMutationInput,
  type ReservationQuery,
  useRequireHandlingMutation,
} from "@gql/gql-types";
import { useModal } from "@/context/ModalContext";
import { useNotification } from "@/context/NotificationContext";

// TODO use a fragment
type ReservationType = NonNullable<ReservationQuery["reservation"]>;
type Props = {
  reservation: ReservationType;
  onClose: () => void;
  onAccept: () => void;
};

const DialogContent = ({ reservation, onClose, onAccept }: Props) => {
  const { notifyError, notifySuccess } = useNotification();
  const { t, i18n } = useTranslation();

  const [backToRequireHandlingMutation] = useRequireHandlingMutation({
    onCompleted: () => {
      notifySuccess(
        t("RequestedReservation.ReturnToRequiresHandlingDialog.returned")
      );
      onAccept();
    },
    onError: (err) => {
      const { message } = err;
      const hasTranslatedErrorMsg = i18n.exists(
        `errors.descriptive.${message}`
      );
      const errorTranslated = hasTranslatedErrorMsg
        ? `errors.descriptive.${message}`
        : `errors.descriptive.genericError`;
      notifyError(
        t("RequestedReservation.ReturnToRequiresHandlingDialog.errorSaving", {
          error: t(errorTranslated),
        })
      );
    },
  });

  const backToRequireHandling = (
    input: ReservationRequiresHandlingMutationInput
  ) => backToRequireHandlingMutation({ variables: { input } });

  const handleClick = () => {
    if (!reservation.pk) {
      throw new Error("Reservation pk is missing");
    }
    backToRequireHandling({ pk: reservation.pk });
  };

  return (
    <>
      <Dialog.Content>
        <p id="modal-description" className="text-body" />
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button variant="secondary" onClick={onClose} theme="black">
          {t("common.prev")}
        </Button>
        <Button onClick={handleClick}>
          {t("RequestedReservation.ReturnToRequiresHandlingDialog.accept")}
        </Button>
      </Dialog.ActionButtons>
    </>
  );
};

const ReturnToRequiredHandlingDialog = ({
  reservation,
  onClose,
  onAccept,
}: Props): JSX.Element => {
  const { isOpen } = useModal();
  const { t } = useTranslation();

  return (
    <Dialog
      variant="primary"
      id="info-dialog"
      aria-labelledby="modal-header"
      aria-describedby="modal-description"
      isOpen={isOpen}
      focusAfterCloseRef={undefined}
    >
      <Dialog.Header
        id="modal-header"
        title={t("RequestedReservation.ReturnToRequiresHandlingDialog.title")}
        iconLeft={<IconInfoCircle aria-hidden="true" />}
      />
      <DialogContent
        reservation={reservation}
        onAccept={onAccept}
        onClose={onClose}
      />
    </Dialog>
  );
};
export default ReturnToRequiredHandlingDialog;
