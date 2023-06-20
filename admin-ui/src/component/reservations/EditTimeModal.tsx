import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Button, Dialog, Notification } from "hds-react";
import { z } from "zod";
import {
  Mutation,
  MutationStaffAdjustReservationTimeArgs,
  Query,
  QueryReservationUnitByPkArgs,
  ReservationType,
  ReservationUnitsReservationUnitReservationStartIntervalChoices,
} from "common/types/gql-types";
import { FormProvider, useForm } from "react-hook-form";
import { format } from "date-fns";
import { ErrorBoundary } from "react-error-boundary";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@apollo/client";
import { fromUIDate } from "common/src/common/util";
import { useNotification } from "app/context/NotificationContext";
import { useModal } from "app/context/ModalContext";
import { TimeChangeFormSchemaRefined, TimeFormSchema } from "app/schemas";
import { CHANGE_RESERVATION_TIME } from "./queries";
import { setTimeOnDate } from "./utils";
import ControlledTimeInput from "../my-units/components/ControlledTimeInput";
import { reservationDateTime, reservationDuration } from "./requested/util";
import { RESERVATIONS_BY_RESERVATIONUNIT } from "./requested/hooks/queries";
import ControlledDateInput from "../my-units/components/ControlledDateInput";
import BufferToggles from "../my-units/BufferToggles";

const StyledForm = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: var(--spacing-s);
`;

type Props = {
  reservation: ReservationType;
  onAccept: () => void;
  onClose: () => void;
};

const ActionButtons = styled(Dialog.ActionButtons)`
  justify-content: end;
  grid-column: 1 / -1;
  padding: 0;
  padding-bottom: var(--spacing-m);
`;

const TimeInfoBox = styled.p<{ $isDisabled?: boolean }>`
  grid-column: 1 / -1;
  color: ${({ $isDisabled }) => ($isDisabled ? "var(--color-black-40)" : "")};
`;

const Bold = styled.b`
  white-space: nowrap;
`;

const btnCommon = {
  theme: "black",
  size: "small",
  variant: "secondary",
  disabled: false,
} as const;

type FormValueType = z.infer<typeof TimeFormSchema>;

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

const DialogContent = ({ reservation, onAccept, onClose }: Props) => {
  const { t } = useTranslation();
  const { notifyError, notifySuccess } = useNotification();

  const [changeTimeMutation] = useMutation<
    Mutation,
    MutationStaffAdjustReservationTimeArgs
  >(CHANGE_RESERVATION_TIME, {
    onCompleted: () => {
      notifySuccess(t("Reservation.EditTime.successToast"));
      onAccept();
    },
    onError: (error) => {
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
      bufferTimeAfter: !!reservation.bufferTimeAfter,
      bufferTimeBefore: !!reservation.bufferTimeBefore,
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

  const changeTime = async (
    begin: Date,
    end: Date,
    buffers: { before?: number; after?: number }
  ) => {
    return changeTimeMutation({
      variables: {
        input: {
          ...convertToApiFormat(begin, end),
          pk: reservation.pk ?? 0,
          bufferTimeAfter:
            buffers.after != null ? String(buffers.after) : undefined,
          bufferTimeBefore:
            buffers.before != null ? String(buffers.before) : undefined,
        },
      },
    });
  };

  const reservationUnit = reservation.reservationUnits?.find(() => true);

  const formDate = watch("date");
  const formEndTime = watch("endTime");
  const formStartTime = watch("startTime");

  const newStartTime = setTimeOnDate(fromUIDate(formDate), formStartTime);
  const newEndTime = setTimeOnDate(fromUIDate(formDate), formEndTime);
  const { collides, isLoading } = useCheckCollision({
    reservationPk: reservation.pk ?? 0,
    reservationUnitPk: reservationUnit?.pk ?? 0,
    start: newStartTime,
    end: newEndTime,
  });

  // NOTE 0 => buffer disabled for this reservation, undefined => no buffers selected
  const bufferBefore =
    (reservation.bufferTimeBefore || reservationUnit?.bufferTimeBefore) ??
    undefined;
  const bufferAfter =
    (reservation.bufferTimeAfter || reservationUnit?.bufferTimeAfter) ??
    undefined;

  const onSubmit = (values: FormValueType) => {
    if (values.date && values.startTime && values.endTime) {
      const start = setTimeOnDate(fromUIDate(values.date), values.startTime);
      const end = setTimeOnDate(fromUIDate(values.date), values.endTime);
      changeTime(start, end, {
        before: values.bufferTimeBefore ? bufferBefore : 0,
        after: values.bufferTimeAfter ? bufferAfter : 0,
      });
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
    <Dialog.Content>
      <StyledForm onSubmit={handleSubmit(onSubmit)} noValidate>
        <TimeInfoBox>
          {t("Reservation.EditTime.originalTime")}: <Bold>{originalTime}</Bold>
        </TimeInfoBox>
        <ControlledDateInput
          name="date"
          control={control}
          error={translateError(errors.date?.message)}
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
        {(bufferAfter || bufferBefore) && (
          <FormProvider {...form}>
            <BufferToggles before={bufferBefore} after={bufferAfter} />
          </FormProvider>
        )}
        <TimeInfoBox $isDisabled={!isDirty || !isValid}>
          {t("Reservation.EditTime.newTime")}: <Bold>{newTime}</Bold>
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
    </Dialog.Content>
  );
};

const StyledDialog = styled(Dialog)`
  /* larger than normal HDS modal */
  && {
    width: 100%;
  }
  max-width: 944px;
`;

const EditTimeModal = ({ reservation, onAccept, onClose }: Props) => {
  const { isOpen } = useModal();
  const { t } = useTranslation();

  return (
    <StyledDialog
      variant="primary"
      id="info-dialog"
      aria-labelledby="modal-header"
      isOpen={isOpen}
      focusAfterCloseRef={undefined}
    >
      <Dialog.Header
        id="modal-header"
        title={t("Reservation.EditTime.title")}
      />
      <ErrorBoundary fallback={<div>{t("errors.uncaught")}</div>}>
        <DialogContent
          reservation={reservation}
          onAccept={onAccept}
          onClose={onClose}
        />
      </ErrorBoundary>
    </StyledDialog>
  );
};

export default EditTimeModal;
