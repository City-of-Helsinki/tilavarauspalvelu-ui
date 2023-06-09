import { useTranslation } from "react-i18next";
import { useNotification } from "app/context/NotificationContext";
import { useMutation } from "@apollo/client";
import {
  ReservationsReservationStateChoices,
  type RecurringReservationUpdateMutationInput,
  type RecurringReservationUpdateMutationPayload,
  type ReservationStaffModifyMutationInput,
  type ReservationStaffModifyMutationPayload,
  type ReservationType,
  type ReservationWorkingMemoMutationInput,
} from "common/types/gql-types";
import { useRecurringReservations } from "../requested/hooks";
import {
  UPDATE_STAFF_RECURRING_RESERVATION,
  UPDATE_STAFF_RESERVATION,
} from "./queries";

/// Combines regular and recurring reservation change mutation
export const useStaffReservationMutation = ({
  reservation,
  onSuccess,
}: {
  reservation: ReservationType;
  onSuccess: () => void;
}) => {
  const { t } = useTranslation();
  const { notifyError, notifySuccess } = useNotification();
  const [mutation] = useMutation<
    { staffReservationModify: ReservationStaffModifyMutationPayload },
    {
      input: ReservationStaffModifyMutationInput;
      workingMemo: ReservationWorkingMemoMutationInput;
    }
  >(UPDATE_STAFF_RESERVATION);

  const { reservations } = useRecurringReservations(
    reservation.recurringReservation?.pk ?? undefined
  );

  const [recurringMutation] = useMutation<
    { staffReservationModify: RecurringReservationUpdateMutationPayload },
    {
      input: RecurringReservationUpdateMutationInput;
    }
  >(UPDATE_STAFF_RECURRING_RESERVATION);

  const handleSuccess = (isRecurring: boolean) => {
    const trKey = `Reservation.EditPage.${
      isRecurring ? "saveSuccessRecurring" : "saveSuccess"
    }`;
    notifySuccess(t(trKey));
    onSuccess();
  };
  const handleError = () => {
    notifyError(t("Reservation.EditPage.saveError"));
  };

  const editStaffReservation = async (
    input: ReservationStaffModifyMutationInput & {
      seriesName?: string;
      workingMemo?: string;
    }
  ) => {
    const { seriesName, workingMemo, ...rest } = input;
    const isRecurring = !!reservation.recurringReservation?.pk;

    if (isRecurring) {
      // NOTE frontend filtering because of cache issues
      const pksToUpdate = reservations
        .filter((x) => new Date(x.begin) >= new Date())
        .filter(
          (x) => x.state === ReservationsReservationStateChoices.Confirmed
        )
        .map((x) => x.pk)
        .filter((x): x is number => x != null);

      const res = await recurringMutation({
        variables: {
          input: {
            name: seriesName,
            pk: reservation.recurringReservation?.pk ?? 0,
            description: workingMemo,
          },
        },
      });

      if (res.errors) {
        handleError();
        return;
      }

      const promises = pksToUpdate.map((pk) =>
        mutation({
          variables: {
            input: { ...rest, pk },
            workingMemo: { pk, workingMemo },
          },
        })
      );

      // NOTE 1000+ mutations takes a long time, do 10 to check if they are valid and early abort on errors.
      const [firstPass, secondPass] = [
        promises.slice(0, 10),
        promises.slice(10),
      ];

      // TODO
      // We will face issues when doing 1000 mutations and few of them fail because of server 500.
      // It's likely that at least 1 / 1000 mutations fails because of network issues.
      // Retries need to be based on the backend response: a 500 can be retried if some mutations suceeded
      // regular errors so most throws mean parse errors and should not be retried.
      // This identical problem is in the createRecurringReservation also.
      await Promise.all(firstPass)
        .then(() => Promise.all(secondPass))
        .then(() => handleSuccess(true))
        .catch(handleError);
    } else {
      const variables = {
        input: rest,
        workingMemo: {
          pk: input.pk,
          workingMemo,
        },
      };
      mutation({
        variables,
        onCompleted: () => handleSuccess(false),
        onError: handleError,
      });
    }
  };

  return editStaffReservation;
};
