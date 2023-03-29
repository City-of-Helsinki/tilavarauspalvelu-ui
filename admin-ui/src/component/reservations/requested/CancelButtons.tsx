import React from "react";
import {
  type ReservationType,
  ReservationsReservationStateChoices,
  QueryReservationByPkArgs,
  Query,
} from "common/types/gql-types";
import { Button } from "hds-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@apollo/client";
import { add } from "date-fns";
import { useModal } from "../../../context/ModalContext";
import CancelDialog from "./CancelDialog";
import { RESERVATION_CANCEL_RULES } from "./queries";
import { useNotification } from "../../../context/NotificationContext";
import Loader from "../../Loader";

type Props = {
  reservation: ReservationType;
  handleClose: () => void;
  handleAccept: () => void;
};

const canCancelReservation = (state: ReservationsReservationStateChoices) => {
  switch (state) {
    case ReservationsReservationStateChoices.Confirmed:
    case ReservationsReservationStateChoices.Created:
    case ReservationsReservationStateChoices.RequiresHandling:
    case ReservationsReservationStateChoices.WaitingForPayment:
      return true;
    default:
      return false;
  }
};

const TNAMESPACE = "RequestedReservation.CancelButtons";

const CancelButtons = ({ reservation, handleClose, handleAccept }: Props) => {
  const { setModalContent } = useModal();
  const { t } = useTranslation();

  const { notifyError } = useNotification();

  const resUnitPk =
    reservation?.reservationUnits?.find(() => true)?.pk ?? undefined;

  const { loading: isCancelRulesLoading, data: rulesData } = useQuery<
    Query,
    QueryReservationByPkArgs
  >(RESERVATION_CANCEL_RULES, {
    skip: resUnitPk == null,
    variables: {
      pk: resUnitPk,
    },
    onError: () => {
      notifyError(t("RequestedReservation.errorFetchingData"));
    },
  });

  const cancellationRule = rulesData?.reservationUnitByPk?.cancellationRule;
  const cancelAllowedBeforeSecs = cancellationRule?.canBeCancelledTimeBefore;

  if (isCancelRulesLoading) {
    return <Loader />;
  }

  if (!cancellationRule) {
    return (
      <div>
        {t(`${TNAMESPACE}.The reservation unit doesn't allow cancellations`)}
      </div>
    );
  }

  if (!canCancelReservation(reservation.state)) {
    return (
      <div>
        {t(`${TNAMESPACE}.This reservation is already cancelled or rejected`)}
      </div>
    );
  }

  if (new Date() > new Date(reservation.end)) {
    return (
      <div>{t(`${TNAMESPACE}.Can't cancel already ended reservation`)}</div>
    );
  }
  if (new Date() > new Date(reservation.begin)) {
    return (
      <div>{t(`${TNAMESPACE}.Can't cancel already ongoing reservation`)} </div>
    );
  }
  if (
    add(new Date(), { seconds: cancelAllowedBeforeSecs ?? 0 }) >
    new Date(reservation.begin)
  ) {
    return (
      <div>
        {t(
          `${TNAMESPACE}.Cancellation only allowed time seconds before starting`,
          { seconds: cancelAllowedBeforeSecs }
        )}{" "}
      </div>
    );
  }

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
      {t("common.cancel")}
    </Button>
  );
};

export default CancelButtons;
