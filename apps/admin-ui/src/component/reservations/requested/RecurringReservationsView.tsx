import React from "react";
import { H6 } from "common/src/common/typography";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  ReservationStateChoice,
  type ReservationQuery,
  type RecurringReservationQuery,
  useRecurringReservationQuery,
} from "@gql/gql-types";
import { type ApolloQueryResult } from "@apollo/client";
import {
  NewReservationListItem,
  ReservationList,
} from "@/component/ReservationsList";
import ReservationListButton from "@/component/ReservationListButton";
import DenyDialog from "./DenyDialog";
import { useModal } from "@/context/ModalContext";
import EditTimeModal from "../EditTimeModal";
import { base64encode, filterNonNullable } from "common/src/helpers";
import { useNotification } from "app/context/NotificationContext";
import { LoadingSpinner } from "hds-react";

type RecurringReservationType = NonNullable<
  RecurringReservationQuery["recurringReservation"]
>;
type ReservationType = NonNullable<RecurringReservationType["reservations"]>[0];

function RecurringReservationsView({
  recurringPk,
  onSelect,
  onChange,
  onReservationUpdated,
}: {
  recurringPk: number;
  onSelect?: (selected: ReservationType) => void;
  onChange?: () => Promise<ApolloQueryResult<ReservationQuery>>;
  onReservationUpdated?: () => void;
}) {
  const { t } = useTranslation();
  const { setModalContent } = useModal();
  const { notifyError } = useNotification();

  const id = base64encode(`RecurringReservationNode:${recurringPk}`);
  const { data, loading, refetch } = useRecurringReservationQuery({
    skip: !recurringPk,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    variables: { id },
    onError: () => {
      notifyError(t("errors.errorFetchingData"));
    },
  });

  const { recurringReservation } = data ?? {};
  const reservations = filterNonNullable(recurringReservation?.reservations);

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleChangeSuccess = () => {
    setModalContent(null);
    refetch();
    onChange?.();
  };

  type ReservationEditType = NonNullable<ReservationQuery["reservation"]>;
  const handleChange = (res: (typeof reservations)[0]) => {
    setModalContent(
      <EditTimeModal
        // TODO this was here already (so probably uses the undefineds on purpose)
        // The correct way to deal with this would be either split
        // the Edit modal into two parts or do a query using id inside it (if we need all the data).
        reservation={res as ReservationEditType}
        onAccept={() => handleChangeSuccess()}
        onClose={() => setModalContent(null)}
      />,
      true
    );
  };

  const handleCloseRemoveDialog = () => {
    setModalContent(null);
  };

  const handleRemove = (res: (typeof reservations)[0]) => {
    setModalContent(
      <DenyDialog
        reservations={[res]}
        onReject={() => {
          refetch();
          onReservationUpdated?.();
          handleCloseRemoveDialog();
        }}
        onClose={handleCloseRemoveDialog}
      />,
      true
    );
  };

  const { rejectedOccurrences } = recurringReservation ?? {};
  const rejected: NewReservationListItem[] =
    rejectedOccurrences?.map((x) => {
      const startDate = new Date(x.beginDatetime);
      const endDate = new Date(x.endDatetime);
      return {
        date: startDate,
        startTime: format(startDate, "H:mm"),
        endTime: format(endDate, "H:mm"),
        isRemoved: true,
        reason: x.rejectionReason,
        buttons: [],
      };
    }) ?? [];

  const forDisplay: NewReservationListItem[] = reservations.map((x) => {
    const buttons = [];
    const startDate = new Date(x.begin);
    const endDate = new Date(x.end);
    const now = new Date();

    if (x.state !== ReservationStateChoice.Denied) {
      if (startDate > now && onChange) {
        buttons.push(
          <ReservationListButton
            key="change"
            callback={() => handleChange(x)}
            type="change"
            t={t}
          />
        );
      }

      if (onSelect) {
        buttons.push(
          <ReservationListButton
            key="show"
            callback={() => onSelect(x)}
            type="show"
            t={t}
          />
        );
      }
      if (endDate > now) {
        buttons.push(
          <ReservationListButton
            key="deny"
            callback={() => handleRemove(x)}
            type="deny"
            t={t}
          />
        );
      }
    }

    return {
      date: startDate,
      startTime: format(startDate, "H:mm"),
      endTime: format(endDate, "H:mm"),
      isRemoved: x.state === "DENIED",
      buttons,
    };
  });

  const items = forDisplay
    .concat(rejected)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <ReservationList
      header={<H6 as="h3">{t("RecurringReservationsView.Heading")}</H6>}
      items={items}
    />
  );
}

export default RecurringReservationsView;
