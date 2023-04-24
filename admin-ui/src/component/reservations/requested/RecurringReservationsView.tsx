import React from "react";
import { type ReservationType } from "common/types/gql-types";
import { H6 } from "common/src/common/typography";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import ReservationList from "../../ReservationsList";
import ReservationListButton from "../../ReservationListButton";
import { useRecurringReservations } from "./hooks";

const RecurringReservationsView = ({
  reservation,
  onSelect,
}: {
  reservation: ReservationType;
  onSelect: (selected: ReservationType) => void;
}) => {
  const { t } = useTranslation();

  const { loading, reservations } = useRecurringReservations(
    reservation.recurringReservation?.pk ?? undefined
  );

  if (loading) {
    return <div>Loading</div>;
  }

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
    startTime: format(new Date(x.begin), "HH:mm"),
    endTime: format(new Date(x.end), "HH:mm"),
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
    <ReservationList
      header={<H6 as="h3">{t("RecurringReservationsView.Heading")}</H6>}
      items={forDisplay}
    />
  );
};

export default RecurringReservationsView;
