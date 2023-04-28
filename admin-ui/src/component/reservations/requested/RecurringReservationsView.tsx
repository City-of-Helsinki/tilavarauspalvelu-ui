import React, { useState } from "react";
import { H6 } from "common/src/common/typography";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  ReservationsReservationStateChoices,
  type ReservationType,
} from "common/types/gql-types";
import { useRecurringReservations } from "./hooks";
import { RECURRING_AUTOMATIC_REFETCH_LIMIT } from "../../../common/const";
import ReservationList from "../../ReservationsList";
import ReservationListButton from "../../ReservationListButton";
import DenyDialog from "./DenyDialog";
import { useModal } from "../../../context/ModalContext";

const RecurringReservationsView = ({
  reservation,
  onSelect,
}: {
  reservation: ReservationType;
  onSelect: (selected: ReservationType) => void;
}) => {
  const { t } = useTranslation();
  const { setModalContent } = useModal();

  const { loading, reservations, fetchMore, totalCount } =
    useRecurringReservations(
      reservation.recurringReservation?.pk ?? undefined,
      { limit: RECURRING_AUTOMATIC_REFETCH_LIMIT }
    );

  if (loading) {
    return <div>Loading</div>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange = (_x: ReservationType) => {
    // eslint-disable-next-line no-console
    console.warn("Change NOT Implemented.");
  };

  const handleCloseRemoveDialog = (shouldRefetch?: boolean, pk?: number) => {
    if (shouldRefetch && pk) {
      // empty
    }
    setModalContent(null);
  };

  const handleRemove = (res: ReservationType) => {
    setModalContent(
      <DenyDialog
        reservations={[res]}
        onReject={() => handleCloseRemoveDialog(true, res.pk ?? undefined)}
        onClose={() => handleCloseRemoveDialog(false)}
      />,
      true
    );
  };

  const forDisplay = reservations.map((x) => {
    const buttons = [];
    const startDate = new Date(x.begin);
    const now = new Date();

    if (x.state !== ReservationsReservationStateChoices.Denied) {
      if (startDate > now) {
        buttons.push(
          <ReservationListButton
            key="change"
            callback={() => handleChange(x)}
            type="change"
          />
        );
      }

      buttons.push(
        <ReservationListButton
          key="show"
          callback={() => onSelect(x)}
          type="show"
        />
      );
      if (startDate > now) {
        buttons.push(
          <ReservationListButton
            key="deny"
            callback={() => handleRemove(x)}
            type="deny"
          />
        );
      }
    }
    return {
      date: startDate,
      startTime: format(startDate, "k:mm"),
      endTime: format(new Date(x.end), "k:mm"),
      isRemoved: x.state === "DENIED",
      buttons,
    };
  });

  const handleLoadMore = () => {
    fetchMore({ variables: { offset: reservations.length } });
  };

  const hasMore = reservations.length < (totalCount ?? 0);

  return (
    <ReservationList
      header={<H6 as="h3">{t("RecurringReservationsView.Heading")}</H6>}
      items={forDisplay}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
    />
  );
};

export default RecurringReservationsView;
