import React from "react";
import { type ReservationType } from "common/types/gql-types";
import { useTranslation } from "react-i18next";
import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { RECURRING_RESERVATION_QUERY } from "./queries";
import { useNotification } from "../../../context/NotificationContext";
import ReservationList from "../../ReservationsList";

// TODO types ? DONT write them here like this; either use the predefined or zod to validate
type RecurringFromGQL = {
  beginDate: string;
  endDate: string;
  beginTime: string;
  endTime: string;
  pk: number;
  weekdays: number[];
  name: string;
  description: string;
};

type ReservationShortType = {
  begin: string;
  end: string;
  pk: number;
  // TODO what are valid values here? other than CONFIRMED
  state: string;
};

const RecurringReservationsView = ({
  reservation,
}: {
  reservation: ReservationType;
}) => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();

  console.log("recurring for :", reservation);
  const { loading, data } = useQuery<any, any>(RECURRING_RESERVATION_QUERY, {
    skip: !reservation.recurringReservation?.pk,
    variables: {
      recurringPk: Number(reservation.recurringReservation?.pk),
    },
    onError: () => {
      notifyError(t("RequestedReservation.errorFetchingData"));
    },
  });

  if (loading || data == null) {
    return <div>Loading</div>;
  }
  /* Do we need this data? for genering the recursion list against the backend one maybe
   * depends if the backend has removed state for the reservation
  const recurrancePk = reservation?.recurringReservation?.pk;
  // console.log("recurring pk:", recurrancePk);

  // GQL returns all recurring with no filtering
  const recurring: RecurringFromGQL = data?.recurringReservations?.edges
    ?.map((x: any) => x.node)
    .find((x: any) => x.pk === recurrancePk);
  */

  // TODO what data do we want here? what ever we need for the ReservationList
  /* so an array of these {
  date: Date;
  startTime: string;
  endTime: string;
  error?: string;
  reservationPk?: number;
  button?: CallbackButton;
  }
  */
  const reservations: ReservationShortType[] =
    data?.reservations?.edges?.map((x: any) => x.node) ?? [];
  // console.log("the recurring object: ", recurring);
  // console.log("reservations: ", reservations);

  // TODO generate removal buttons
  // TODO show the removed ones? are they saved somwehre? need to investigate after removal is implemted
  // TODO need to show them differently if the state !== "CONFIRMED"
  const forDisplay = reservations.map((x) => ({
    date: new Date(x.begin),
    startTime: format(new Date(x.begin), "hh:mm"),
    endTime: format(new Date(x.begin), "hh:mm"),
    isRemoved: x.state !== "CONFIRMED",
  }));

  return (
    <>
      <div>
        TODO this needs to push a few action buttons into the Reservation list
        They arent in the other use cases of this list component but here they
        need to be
      </div>
      <ReservationList items={forDisplay} />
    </>
  );
};

export default RecurringReservationsView;
