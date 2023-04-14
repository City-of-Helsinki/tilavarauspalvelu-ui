import React from "react";
import {
  Query,
  QueryReservationByPkArgs,
  ReservationsReservationStateChoices,
  type ReservationType,
} from "common/types/gql-types";
import { H6 } from "common/src/common/typography";
import { useTranslation } from "react-i18next";
import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { RECURRING_RESERVATION_QUERY } from "./queries";
import { useNotification } from "../../../context/NotificationContext";
import ReservationList from "../../ReservationsList";
import ReservationListButton from "../../ReservationListButton";
import DenyDialog from "./DenyDialog";
import { useModal } from "../../../context/ModalContext";

const RecurringReservationsView = ({
  reservation,
  onSelect,
  onChange,
}: {
  reservation: ReservationType;
  onSelect: (selected: ReservationType) => void;
  onChange: () => void;
}) => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();

  const { loading, data, refetch } = useQuery<Query, QueryReservationByPkArgs>(
    RECURRING_RESERVATION_QUERY,
    {
      skip: !reservation.recurringReservation?.pk,
      variables: {
        pk: Number(reservation.recurringReservation?.pk),
      },
      onError: () => {
        notifyError(t("RequestedReservation.errorFetchingData"));
      },
    }
  );

  const { setModalContent } = useModal();

  if (loading || data == null) {
    return <div>Loading</div>;
  }

  const reservations =
    data?.reservations?.edges
      ?.map((x) => x?.node)
      .filter((x): x is ReservationType => x != null) ?? [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange = (_x: ReservationType) => {
    // eslint-disable-next-line no-console
    console.warn("Change NOT Implemented.");
  };

  const handleCloseRemoveDialog = (shouldRefetch?: boolean) => {
    if (shouldRefetch) {
      refetch();
      onChange();
    }
    setModalContent(null);
  };

  const handleRemove = (res: ReservationType) => {
    setModalContent(
      <DenyDialog
        reservation={res}
        onReject={() => handleCloseRemoveDialog(true)}
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
            callback={() => handleChange(x)}
            type="change"
          />
        );
      }

      buttons.push(
        <ReservationListButton callback={() => onSelect(x)} type="show" />
      );
      if (startDate > now) {
        buttons.push(
          <ReservationListButton
            callback={() => handleRemove(x)}
            type="remove"
          />
        );
      }
    }
    return {
      date: startDate,
      startTime: format(startDate, "hh:mm"),
      endTime: format(new Date(x.end), "hh:mm"),
      isRemoved: x.state === "DENIED",
      buttons,
    };
  });

  return (
    <ReservationList
      header={<H6 as="h3">{t("RecurringReservationsView.Heading")}</H6>}
      items={forDisplay}
    />
  );
};

export default RecurringReservationsView;
