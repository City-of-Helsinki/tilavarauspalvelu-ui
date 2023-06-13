import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Button, DateInput, Dialog, Notification } from "hds-react";
import { z } from "zod";
import {
  Mutation,
  MutationStaffAdjustReservationTimeArgs,
  Query,
  QueryReservationUnitByPkArgs,
  ReservationType,
  ReservationUnitsReservationUnitReservationStartIntervalChoices,
} from "common/types/gql-types";
import { VerticalFlex } from "app/styles/layout";
import { useModal } from "app/context/ModalContext";
import { Controller, useForm } from "react-hook-form";
import { addYears, format, parse } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@apollo/client";
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
import ControlledTimeInput from "../my-units/components/ControlledTimeInput";
import { reservationDateTime, reservationDuration } from "./requested/util";
import { RESERVATIONS_BY_RESERVATIONUNIT } from "./requested/hooks/queries";

export const TimeFormSchema = z.object({
  // TODO this needs to be string and we have to use custom date checker because it's in FI format
  // string because it can be invalid date while user is typing
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

const convertToDate = (date: string): Date =>
  parse(date, "dd.MM.yyyy", new Date());

// No refinement for length since the select doesn't allow invalid values
// TODO  refine interval
const TimeChangeFormSchemaRefined = (
  interval: ReservationUnitsReservationUnitReservationStartIntervalChoices
) =>
  TimeFormSchema.partial()
    .superRefine(
      (val, ctx) => val.date && checkDate(convertToDate(val.date), ctx, "date")
    )
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
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
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

const TimeInfoBox = styled.p<{ $isDisabled?: boolean }>`
  grid-column: 1 / -1;
  color: ${({ $isDisabled }) => ($isDisabled ? "var(--color-black-40)" : "")};
`;
const useCheckCollision = ({
  reservationPk,
  reservationUnitPk,
  start,
  end,
}: {
  reservationPk: number;
  reservationUnitPk: number;
  start: Date;
  end: Date;
}) => {
  const { notifyError } = useNotification();

  const { data, loading } = useQuery<
    Query,
    QueryReservationUnitByPkArgs & { from: string; to: string }
  >(RESERVATIONS_BY_RESERVATIONUNIT, {
    fetchPolicy: "no-cache",
    skip: !reservationUnitPk,
    variables: {
      pk: reservationUnitPk,
      from: format(start, "yyyy-MM-dd"),
      to: format(end, "yyyy-MM-dd"),
    },
    onError: () => {
      notifyError("Varauksia ei voitu hakea");
    },
  });

  type Interval = { start: Date; end: Date };
  const collides = (a: Interval, b: Interval): boolean => {
    if (a.start < b.start && a.end <= b.start) return false;
    if (a.start >= b.end && a.end > b.end) return false;
    return true;
  };

  const reservations = data?.reservationUnitByPk?.reservations ?? [];
  const collisions = reservations
    .filter((x) => x?.pk !== reservationPk)
    .filter(
      (x) =>
        x?.begin &&
        x?.end &&
        collides(
          { start, end },
          { start: new Date(x.begin), end: new Date(x.end) }
        )
    );

  return { isLoading: loading, collides: collisions.length > 0 };
};

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
      date: format(startDateTime, "dd.MM.yyyy"),
      startTime: format(startDateTime, "HH:mm"),
      endTime: format(endDateTime, "HH:mm"),
    },
  });
  const {
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid },
    watch,
  } = form;

  const convertToApiFormat = (begin: Date, end: Date) => ({
    begin: begin.toISOString(),
    end: end.toISOString(),
  });

  const changeTime = async (begin: Date, end: Date) => {
    return changeTimeMutation({
      variables: {
        input: {
          ...convertToApiFormat(begin, end),
          pk: reservation.pk ?? 0,
        },
      },
    });
  };

  const formDate = watch("date");
  const formEndTime = watch("endTime");
  const formStartTime = watch("startTime");
  const newStartTime = setTimeOnDate(convertToDate(formDate), formStartTime);
  const newEndTime = setTimeOnDate(convertToDate(formDate), formEndTime);
  const { collides, isLoading } = useCheckCollision({
    reservationPk: reservation.pk ?? 0,
    reservationUnitPk: reservation.reservationUnits?.find(() => true)?.pk ?? 0,
    start: newStartTime,
    end: newEndTime,
  });

  const onSubmit = (values: FormValueType) => {
    if (values.date && values.startTime && values.endTime) {
      const start = setTimeOnDate(convertToDate(values.date), values.startTime);
      const end = setTimeOnDate(convertToDate(values.date), values.endTime);
      changeTime(start, end);
    }
  };

  const translateError = (errorMsg?: string) =>
    errorMsg ? t(`reservationForm:errors.${errorMsg}`) : "";

  const newTime = `${reservationDateTime(
    newStartTime,
    newEndTime,
    t
  )}, ${reservationDuration(newStartTime, newEndTime)} t`;

  const originalTime = `${reservationDateTime(
    startDateTime,
    endDateTime,
    t
  )}, ${reservationDuration(startDateTime, endDateTime)} t`;

  return (
    <StyledContent>
      <StyledForm onSubmit={handleSubmit(onSubmit)} noValidate>
        <TimeInfoBox>
          {t("Reservation.EditTime.originalTime")}: <b>{originalTime}</b>
        </TimeInfoBox>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <DateInput
              id="reservationDialog.date"
              label={t(`ReservationDialog.date`)}
              minDate={new Date()}
              maxDate={addYears(new Date(), 3)}
              disableConfirmation
              language="fi"
              value={value}
              errorText={translateError(errors.date?.message)}
              onChange={(text) => onChange(text)}
              required
            />
          )}
        />
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
        <TimeInfoBox $isDisabled={!isDirty || !isValid}>
          {t("Reservation.EditTime.newTime")}: <b>{newTime}</b>
        </TimeInfoBox>
        {collides && (
          <Notification
            size="small"
            label={t("Reservation.EditTime.error.reservationCollides")}
            type="error"
            style={{ marginTop: "var(--spacing-s)", gridColumn: "1 / -1" }}
          >
            {t("Reservation.EditTime.error.reservationCollides")}
          </Notification>
        )}
        <ActionButtons>
          <Button {...btnCommon} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={((!isDirty || !isValid) && !isLoading) || collides}
            type="submit"
          >
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
