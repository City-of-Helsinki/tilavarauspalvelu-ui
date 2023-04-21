import React, { useState } from "react";
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

const LIMIT = 100;

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
  const [reservations, setReservations] = useState<ReservationType[]>([]);

  const { loading, refetch } = useQuery<
    Query,
    { pk: number; offset: number; count: number }
  >(RECURRING_RESERVATION_QUERY, {
    skip: !reservation.recurringReservation?.pk,
    variables: {
      pk: Number(reservation.recurringReservation?.pk),
      offset: reservations.length,
      count: LIMIT,
    },
    onCompleted: (data) => {
      const qd = data?.reservations;
      if (qd?.edges.length != null && qd?.totalCount && qd?.edges.length > 0) {
        const ds =
          qd?.edges
            ?.map((x) => x?.node)
            .filter((x): x is ReservationType => x != null) ?? [];

        setReservations([...reservations, ...ds]);
      }
    },
    onError: () => {
      notifyError(t("RequestedReservation.errorFetchingData"));
    },
  });

  const { setModalContent } = useModal();

  if (loading) {
    return <div>Loading</div>;
  }

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
          <ReservationListButton callback={() => handleRemove(x)} type="deny" />
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
