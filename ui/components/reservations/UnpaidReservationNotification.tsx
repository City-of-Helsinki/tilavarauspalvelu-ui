import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { breakpoints } from "common/src/common/style";
import {
  ReservationType,
  ReservationsReservationStateChoices,
} from "common/types/gql-types";
import { BlackButton, Toast } from "../../styles/util";
import {
  useReservations,
  useReservation,
  useOrder,
} from "../../hooks/reservation";
import NotificationWrapper from "../common/NotificationWrapper";
import { useCurrentUser } from "../../hooks/user";
import { getCheckoutUrl } from "../../modules/reservation";

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--spacing-s);

  @media (min-width: ${breakpoints.m}) {
    flex-direction: row;
  }
`;

const NotificationButtons = styled.div`
  display: flex;
  gap: var(--spacing-s);

  > button {
    white-space: nowrap;
  }
`;

const ReservationNotification = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [reservation, setReservation] = React.useState<ReservationType>(null);

  const { currentUser } = useCurrentUser();
  const { reservations } = useReservations(
    currentUser,
    [ReservationsReservationStateChoices.WaitingForPayment],
    "-pk"
  );

  useEffect(() => {
    if (reservations?.length) {
      setReservation(
        reservations.find(
          (r) =>
            r.state === ReservationsReservationStateChoices.WaitingForPayment
        )
      );
    }
  }, [reservations]);

  const { order } = useOrder(reservation?.orderUuid);

  const { deleteReservation, deleteLoading, deleteError, deleted } =
    useReservation(reservation?.pk);

  const checkoutUrl = getCheckoutUrl(order, i18n.language);

  if (deleted) {
    return (
      <Toast
        type="success"
        position="top-center"
        dismissible
        label={t("notification:waitingForPayment.reservationCancelledTitle")}
        closeButtonLabelText={t("common:close")}
      />
    );
  }

  if (deleteError) {
    return (
      <Toast
        type="error"
        position="top-center"
        dismissible
        label={t("common:error.error")}
        closeButtonLabelText={t("common:close")}
      >
        <span>{t("errors:general_error")}</span>
      </Toast>
    );
  }

  return checkoutUrl ? (
    <NotificationWrapper
      type="alert"
      dismissible
      label={t("notification:waitingForPayment.title")}
      closeButtonLabelText={t("common:close")}
    >
      <NotificationContent>
        <div>{t("notification:waitingForPayment.body")}</div>
        <NotificationButtons>
          <BlackButton
            variant="secondary"
            size="small"
            onClick={() =>
              deleteReservation({
                variables: {
                  input: {
                    pk: reservation.pk,
                  },
                },
              })
            }
            disabled={deleteLoading}
            data-testid="reservation-notification__button--delete"
          >
            {t("notification:waitingForPayment.cancelReservation")}
          </BlackButton>
          <BlackButton
            variant="secondary"
            size="small"
            onClick={() => router.push(checkoutUrl)}
            data-testid="reservation-notification__button--checkout"
          >
            {t("notification:waitingForPayment.payReservation")}
          </BlackButton>
        </NotificationButtons>
      </NotificationContent>
    </NotificationWrapper>
  ) : null;
};

const UnpaidReservationNotification = () => {
  const router = useRouter();
  const restrictedRoutes = ["/reservation/cancel", "/success"];

  if (restrictedRoutes.some((route) => router.pathname.startsWith(route))) {
    return null;
  }

  return <ReservationNotification />;
};

export default UnpaidReservationNotification;
