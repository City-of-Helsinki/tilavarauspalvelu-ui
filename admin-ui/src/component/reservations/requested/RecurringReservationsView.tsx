import React from "react";
import styled from "styled-components";
import {
  Query,
  QueryReservationByPkArgs,
  type ReservationType,
} from "common/types/gql-types";
import { useTranslation } from "react-i18next";
import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { RECURRING_RESERVATION_QUERY } from "./queries";
import { useNotification } from "../../../context/NotificationContext";
import ReservationList from "../../ReservationsList";
import ReservationListButton from "../../ReservationListButton";

const StyledHeading = styled.h3`
  background: var(--color-black-10);
  font-size: var(--fontsize-body-m);
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-2-xs);
  margin: 0;
`;

const RecurringReservationsView = ({
  reservation,
  onSelect,
}: {
  reservation: ReservationType;
  onSelect: (selected: ReservationType) => void;
}) => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();

  const { loading, data } = useQuery<Query, QueryReservationByPkArgs>(
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRemove = (_x: ReservationType) => {
    // eslint-disable-next-line no-console
    console.warn("Remove NOT Implemented.");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRestore = (_x: ReservationType) => {
    // eslint-disable-next-line no-console
    console.warn("Restore NOT Implemented.");
  };

  const forDisplay = reservations.map((x) => ({
    date: new Date(x.begin),
    startTime: format(new Date(x.begin), "hh:mm"),
    endTime: format(new Date(x.begin), "hh:mm"),
    isRemoved: x.state !== "CONFIRMED",
    buttons: [
      <ReservationListButton callback={() => handleChange(x)} type="change" />,
      <ReservationListButton callback={() => onSelect(x)} type="show" />,
      x.state === "CONFIRMED" ? (
        <ReservationListButton callback={() => handleRemove(x)} type="remove" />
      ) : (
        <ReservationListButton
          callback={() => handleRestore(x)}
          type="restore"
        />
      ),
    ],
  }));

  return (
    <>
      <StyledHeading>{t("RecurringReservationsView.Heading")}</StyledHeading>
      <ReservationList items={forDisplay} />
    </>
  );
};

export default RecurringReservationsView;
