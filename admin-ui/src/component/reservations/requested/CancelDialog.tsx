import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { Button, Dialog } from "hds-react";
import {
  Mutation,
  Query,
  QueryReservationCancelReasonsArgs,
  ReservationCancelReasonType,
  ReservationCancellationMutationInput,
  ReservationType,
} from "common/types/gql-types";
import { useModal } from "../../../context/ModalContext";
import { CANCEL_RESERVATION, RESERVATION_CANCEL_REASONS } from "./queries";
import { useNotification } from "../../../context/NotificationContext";
import Loader from "../../Loader";
import Select from "../../ReservationUnits/ReservationUnitEditor/Select";
import { OptionType } from "../../../common/types";
import { VerticalFlex } from "../../../styles/layout";
import { CustomDialogHeader } from "../../CustomDialogHeader";

const ActionButtons = styled(Dialog.ActionButtons)`
  justify-content: end;
`;

const DialogContent = ({
  reservation,
  onClose,
  onReject,
}: {
  reservation: ReservationType;
  onClose: () => void;
  onReject: () => void;
}) => {
  const [cancelReasonPk, setCancelReason] = useState(0);
  const [cancelReservationMutation] = useMutation<Mutation>(CANCEL_RESERVATION);

  const { notifyError, notifySuccess } = useNotification();
  const { t } = useTranslation();

  const cancelReservation = (input: ReservationCancellationMutationInput) =>
    cancelReservationMutation({ variables: { input } });

  const { loading, data: reasonsData } = useQuery<
    Query,
    QueryReservationCancelReasonsArgs
  >(RESERVATION_CANCEL_REASONS, {
    onError: () => {
      notifyError(t("RequestedReservation.errorFetchingData"));
    },
  });

  const reasons =
    reasonsData?.reservationCancelReasons?.edges
      ?.map((x) => x?.node)
      ?.filter((x): x is ReservationCancelReasonType => x != null)
      ?.map(
        (dr): OptionType => ({
          value: dr?.pk ?? 0,
          label: dr?.reasonFi ?? "",
        })
      ) ?? [];

  const handleCancel = async () => {
    try {
      if (reservation.pk == null) {
        throw new Error("Reservation PK is undefined");
      }
      const res = await cancelReservation({
        pk: reservation.pk,
        cancelReasonPk,
      });

      // TODO what are these errors? it seems that graphql throws errors always.
      if (res.errors) {
        const first = res.errors.find(() => true);
        if (first != null) {
          notifyError(t(first.message));
        }
      } else {
        notifySuccess(t("RequestedReservation.CancelDialog.cancelled"));
        onReject();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Apollo threw: ", JSON.stringify(e));
      notifyError(t(String(e)));
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
            id="cancelReason"
            options={reasons}
            placeholder={t("common.select")}
            label={t("RequestedReservation.CancelDialog.cancelReason")}
            onChange={(v) => setCancelReason(Number(v))}
            value={cancelReasonPk}
            helper={t("RequestedReservation.CancelDialog.cancelReasonHelper")}
          />
        </VerticalFlex>
      </Dialog.Content>
      <ActionButtons>
        <Button variant="secondary" onClick={onClose} theme="black">
          {t("common.prev")}
        </Button>
        <Button disabled={cancelReasonPk === 0} onClick={handleCancel}>
          {t("RequestedReservation.CancelDialog.cancel")}
        </Button>
      </ActionButtons>
    </>
  );
};

const CancelDialog = ({
  reservation,
  onClose,
  onReject,
}: {
  reservation: ReservationType;

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
          title={t("RequestedReservation.CancelDialog.title")}
          close={onClose}
        />
        <DialogContent
          reservation={reservation}
          onReject={onReject}
          onClose={onClose}
        />
      </VerticalFlex>
    </Dialog>
  );
};
export default CancelDialog;
