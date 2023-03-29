/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { Button, Dialog, TextArea } from "hds-react";
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

  /*
  const [handlingDetails, setHandlingDetails] = useState<string>(
    reservation.workingMemo || ""
  );
  const [denyReasonPk, setDenyReason] = useState<number | null>(null);
  const [denyReasonOptions, setDenyReasonOptions] = useState<OptionType[]>([]);
  const { notifyError, notifySuccess } = useNotification();
  const { t } = useTranslation();
  */

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

      // TODO what are these errors ever? it seems that graphql throws errors always
      if (res.errors) {
        if (
          res.errors.filter(
            (x) => x.extensions.error_code === "CANCELLATION_NOT_ALLOWED"
          ).length > 0
        ) {
          notifyError(t("CANCELLATION_NOT_ALLOWED"));
        } else {
          const first = res.errors.find(() => true);
          if (first != null) {
            notifyError(t(first.message));
          }
        }
      } else {
        notifySuccess(t("RequestedReservation.CancelDialog.cancelled"));
        onReject();
      }
    } catch (e) {
      /* TODO the error we receive if CANCELING is not allowed for this unit (might also be if the cancellation period is already gone)
       */
      /* TODO this is the error we receive if trying to double Cancel so we need to check the reservation.state and disable the button based on that
      [
        {"message":"Only reservations in confirmed state can be cancelled through this.",
        "locations":[{"line":2,"column":3}],
        "path":["cancelReservation"],
        "extensions":{"error_code":"CANCELLATION_NOT_ALLOWED","field":"nonFieldError"}}
      ],
        "clientErrors":[],
        "networkError":null,
        "message":"Only reservations in confirmed state can be cancelled through this."
      }
       */
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
          {/* TODO comment field?
          <TextArea
            value={handlingDetails}
            onChange={(e) => setHandlingDetails(e.target.value)}
            label={t("RequestedReservation.DenyDialog.handlingDetails")}
            id="handlingDetails"
            helperText={t(
              "RequestedReservation.DenyDialog.handlingDetailsHelper"
            )}
          />
            */}
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
