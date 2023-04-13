import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useMutation } from "@apollo/client";
import { Button, Dialog, TextArea } from "hds-react";
import { GraphQLError } from "graphql";
import {
  Mutation,
  ReservationDenyMutationInput,
  ReservationType,
} from "common/types/gql-types";
import { useModal } from "../../../context/ModalContext";
import { DENY_RESERVATION } from "./queries";
import { useNotification } from "../../../context/NotificationContext";
import Loader from "../../Loader";
import Select from "../../ReservationUnits/ReservationUnitEditor/Select";
import { VerticalFlex } from "../../../styles/layout";
import { CustomDialogHeader } from "../../CustomDialogHeader";
import { useDenyReasonOptions } from "./hooks";

const ActionButtons = styled(Dialog.ActionButtons)`
  justify-content: end;
`;

const DialogContent = ({
  reservations,
  onClose,
  onReject,
}: {
  reservations: ReservationType[];
  onClose: () => void;
  onReject: () => void;
}) => {
  const [denyReservationMutation] = useMutation<Mutation>(DENY_RESERVATION);

  const denyReservation = (input: ReservationDenyMutationInput) =>
    denyReservationMutation({ variables: { input } });

  const [handlingDetails, setHandlingDetails] = useState<string>(
    reservations.length === 1 ? reservations[0].workingMemo ?? "" : ""
  );
  const [denyReasonPk, setDenyReason] = useState<number | null>(null);
  const { notifyError, notifySuccess } = useNotification();
  const { t } = useTranslation();

  const { options, loading } = useDenyReasonOptions();

  const handleDeny = async () => {
    try {
      if (denyReasonPk == null) {
        throw new Error("Deny PK undefined");
      }
      const denyPromises = reservations.map((x) =>
        denyReservation({
          pk: x.pk,
          denyReasonPk,
          handlingDetails,
        })
      );

      const res = await Promise.all(denyPromises);

      const errors = res
        .map((x) => x.errors)
        .filter((x): x is GraphQLError[] => x != null);

      if (errors.length !== 0) {
        // eslint-disable-next-line no-console
        console.error("Deny failed with: ", errors);
        notifyError(t("RequestedReservation.DenyDialog.errorSaving"));
      } else {
        notifySuccess(t("RequestedReservation.DenyDialog.denied"));
        onReject();
      }
    } catch (e) {
      notifyError(t("RequestedReservation.DenyDialog.errorSaving"));
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Dialog.Content>
        <VerticalFlex>
          <Select
            required
            id="denyReason"
            options={options}
            placeholder={t("common.select")}
            label={t("RequestedReservation.DenyDialog.denyReason")}
            onChange={(v) => setDenyReason(Number(v))}
            value={denyReasonPk}
            helper={t("RequestedReservation.DenyDialog.denyReasonHelper")}
          />
          <TextArea
            value={handlingDetails}
            onChange={(e) => setHandlingDetails(e.target.value)}
            label={t("RequestedReservation.DenyDialog.handlingDetails")}
            id="handlingDetails"
            helperText={t(
              "RequestedReservation.DenyDialog.handlingDetailsHelper"
            )}
          />
        </VerticalFlex>
      </Dialog.Content>
      <ActionButtons>
        <Button variant="secondary" onClick={onClose} theme="black">
          {t("common.prev")}
        </Button>
        <Button disabled={!denyReasonPk} onClick={handleDeny}>
          {t("RequestedReservation.DenyDialog.reject")}
        </Button>
      </ActionButtons>
    </>
  );
};

// TODO add a different translation space if the user is deleting more than one reservation
// so we can do `RequestedReservation.DenyDialog.${single | multi}.title
const DenyDialog = ({
  reservations,
  onClose,
  onReject,
}: {
  reservations: ReservationType[];
  onClose: () => void;
  onReject: () => void;
}): JSX.Element => {
  const { isOpen } = useModal();
  const { t } = useTranslation();

  return (
    <Dialog
      variant="danger"
      id="info-dialog"
      aria-labelledby="modal-header"
      isOpen={isOpen}
    >
      <VerticalFlex>
        <CustomDialogHeader
          id="modal-header"
          title={t("RequestedReservation.DenyDialog.title")}
          close={onClose}
        />
        <DialogContent
          reservations={reservations}
          onReject={onReject}
          onClose={onClose}
        />
      </VerticalFlex>
    </Dialog>
  );
};
export default DenyDialog;
