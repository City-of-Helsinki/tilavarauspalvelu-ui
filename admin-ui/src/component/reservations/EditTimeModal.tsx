import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Button, Dialog } from "hds-react";
import { z } from "zod";
import {
  Mutation,
  MutationStaffAdjustReservationTimeArgs,
  ReservationType,
  ReservationUnitsReservationUnitReservationStartIntervalChoices,
} from "common/types/gql-types";
import { VerticalFlex } from "app/styles/layout";
import { useModal } from "app/context/ModalContext";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
import { useNotification } from "app/context/NotificationContext";
import {
  checkDate,
  checkReservationInterval,
  checkStartEndTime,
  checkTimeStringFormat,
} from "app/schemas";
import { intervalToNumber } from "app/schemas/utils";
import { CHANGE_RESERVATION_TIME } from "./queries";

import { setTimeOnDate } from "./utils";
import ControlledDateInput from "../my-units/components/ControlledDateInput";
import ControlledTimeInput from "../my-units/components/ControlledTimeInput";
import { reservationDateTime, reservationDuration } from "./requested/util";

export const TimeFormSchema = z.object({
  // TODO this needs to be string and we have to use custom date checker because it's in FI format
  // string because it can be invalid date while user is typing
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
});

// No refinement for length since the select doesn't allow invalid values
// TODO  refine interval
const TimeChangeFormSchemaRefined = (
  interval: ReservationUnitsReservationUnitReservationStartIntervalChoices
) =>
  TimeFormSchema.partial()
    .superRefine((val, ctx) => checkDate(val.date, ctx, "date"))
    .superRefine((val, ctx) =>
      checkTimeStringFormat(val.startTime, ctx, "startTime")
    )
    .superRefine((val, ctx) =>
      checkTimeStringFormat(val.endTime, ctx, "endTime")
    )
    .superRefine((val, ctx) => checkStartEndTime(val, ctx))
    .superRefine((val, ctx) =>
      checkReservationInterval(
        val.startTime,
        ctx,
        "startTime",
        intervalToNumber(interval)
      )
    )
    .superRefine((val, ctx) =>
      checkReservationInterval(val.endTime, ctx, "endTime", 15)
    );

const StyledForm = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 1rem;
  margin: 1rem;
`;

type Props = {
  reservation: ReservationType;
  onAccept: () => void;
  onClose: () => void;
};

const ActionButtons = styled(Dialog.ActionButtons)`
  justify-content: end;
  grid-column: 1 / -1;
`;

const StyledContent = styled(Dialog.Content)``;

const btnCommon = {
  theme: "black",
  size: "small",
  variant: "secondary",
  disabled: false,
} as const;

type FormValueType = z.infer<typeof TimeFormSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DialogContent = ({ reservation, onAccept, onClose }: Props) => {
  const { t } = useTranslation();
  const { notifyError } = useNotification();

  const [changeTimeMutation] = useMutation<
    Mutation,
    MutationStaffAdjustReservationTimeArgs
  >(CHANGE_RESERVATION_TIME, {
    onCompleted: () => {
      onAccept();
    },
    onError: (error) => {
      // TODO handle noOverlapping error separately
      // eslint-disable-next-line no-console
      console.error("Change time mutation failed: ", error);
      notifyError(t("Reservation.EditTime.error.mutation"));
    },
  });

  const startDateTime = new Date(reservation.begin);
  const endDateTime = new Date(reservation.end);

  const interval =
    reservation.reservationUnits?.find(() => true)?.reservationStartInterval ??
    ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_15Mins;

  const form = useForm<FormValueType>({
    resolver: zodResolver(TimeChangeFormSchemaRefined(interval)),
    mode: "onChange",
    defaultValues: {
      date: startDateTime,
      startTime: format(startDateTime, "HH:mm"),
      endTime: format(endDateTime, "HH:mm"),
    },
  });
  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
    getValues,
  } = form;

  const convertToApiFormat = (begin: Date, end: Date) => ({
    begin: begin.toISOString(),
    end: end.toISOString(),
  });

  const doMutation = async (begin: Date, end: Date) => {
    return changeTimeMutation({
      variables: {
        input: {
          ...convertToApiFormat(begin, end),
          // TODO pk can be fixed variable (in the mutation)
          pk: reservation.pk ?? 0,
        },
      },
    });
  };

  const onSubmit = (values: FormValueType) => {
    if (values.date && values.startTime && values.endTime) {
      const start = setTimeOnDate(values.date, values.startTime);
      const end = setTimeOnDate(values.date, values.endTime);
      doMutation(start, end);
    }
  };

  const translateError = (errorMsg?: string) =>
    errorMsg ? t(`reservationForm:errors.${errorMsg}`) : "";

  const values = getValues();
  const newStartTime = setTimeOnDate(values.date, values.startTime);
  const newEndTime = setTimeOnDate(values.date, values.endTime);
  const newTime = `${reservationDateTime(
    startDateTime,
    endDateTime,
    t
  )} ${reservationDuration(newStartTime, newEndTime)} t`;

  const originalTime = `${reservationDateTime(
    startDateTime,
    endDateTime,
    t
  )}, ${reservationDuration(startDateTime, endDateTime)} t`;

  return (
    <StyledContent>
      <StyledForm onSubmit={handleSubmit(onSubmit)} noValidate>
        <p style={{ gridColumn: "1 / -1" }}>
          Muutettava aika: <b>{originalTime}</b>
        </p>
        <div style={{ gridColumn: "1 / 3" }}>
          <ControlledDateInput
            name="date"
            control={control}
            error={translateError(errors.date?.message)}
            required
          />
        </div>
        <ControlledTimeInput
          name="startTime"
          control={control}
          error={translateError(errors.startTime?.message)}
          required
        />
        <ControlledTimeInput
          name="endTime"
          control={control}
          error={translateError(errors.endTime?.message)}
          required
        />
        <p style={{ gridColumn: "1 / -1", color: isDirty ? "" : "gray" }}>
          Uusi aika: <b>{newTime}</b>
        </p>
        <ActionButtons>
          <Button {...btnCommon} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button disabled={!isDirty} type="submit">
            {t("Reservation.EditTime.accept")}
          </Button>
        </ActionButtons>
      </StyledForm>
    </StyledContent>
  );
};

const EditTimeModal = ({ reservation, onAccept, onClose }: Props) => {
  const { isOpen } = useModal();
  const { t } = useTranslation();

  return (
    <Dialog
      variant="primary"
      id="info-dialog"
      aria-labelledby="modal-header"
      isOpen={isOpen}
      focusAfterCloseRef={undefined}
      style={{ width: "944px" }}
    >
      <VerticalFlex>
        <Dialog.Header
          id="modal-header"
          title={t("Reservation.EditTime.title")}
        />
        <DialogContent
          reservation={reservation}
          onAccept={onAccept}
          onClose={onClose}
        />
      </VerticalFlex>
    </Dialog>
  );
};

export default EditTimeModal;
