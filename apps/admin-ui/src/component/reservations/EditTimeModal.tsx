import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Button, Dialog, Notification } from "hds-react";
import { z } from "zod";
import { type TFunction } from "i18next";
import {
  ReservationTypeChoice,
  ReservationUnitNode,
  useCreateStaffReservationMutation,
  useStaffAdjustReservationTimeMutation,
  type ReservationQuery,
} from "@gql/gql-types";
import { FormProvider, UseFormReturn, useForm } from "react-hook-form";
import { differenceInMinutes, format } from "date-fns";
import { ErrorBoundary } from "react-error-boundary";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDuration, toUIDate } from "common/src/common/util";
import { useNotification } from "app/context/NotificationContext";
import { useModal } from "app/context/ModalContext";
import { TimeChangeFormSchemaRefined, TimeFormSchema } from "app/schemas";
import ControlledTimeInput from "../my-units/components/ControlledTimeInput";
import ControlledDateInput from "../my-units/components/ControlledDateInput";
import { BufferToggles } from "../my-units/BufferToggles";
import { useCheckCollisions } from "./requested/hooks";
import { filterNonNullable } from "common/src/helpers";
import { getNormalizedInterval, parseDateTimeSafe } from "@/helpers";
import { formatDateTimeRange } from "@/common/util";
import { ReservationUnitEditFormValues } from "app/spa/ReservationUnit/edit/form";
import { gql } from "@apollo/client";

const StyledForm = styled.form`
  margin-top: var(--spacing-m);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: var(--spacing-s);
`;


const ActionButtons = styled(Dialog.ActionButtons)`
  justify-content: end;
  grid-column: 1 / -1;
  padding: 0;
  padding-bottom: var(--spacing-m);
`;

const TimeInfoBox = styled.p<{ $isDisabled?: boolean }>`
  grid-column: 1 / -1;
  margin: 0;
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

function recurringReservationInfoText({
  weekdays,
  begin,
  end,
  t,
}: {
  weekdays: number[];
  begin?: Date;
  end?: Date;
  t: TFunction;
}) {
  return t("Reservation.EditTime.recurringInfoTimes", {
    weekdays: weekdays
      .sort((a, b) => a - b)
      .map((weekday) => t(`dayShort.${weekday}`))
      .join(", "),
    begin: begin && toUIDate(begin),
    end: end && toUIDate(end),
  });
}

type EditFormValueType = z.infer<typeof TimeFormSchema>;

function formatDateInterval(t: TFunction, begin: Date, end: Date) {
  const dateString = formatDateTimeRange(t, begin, end);
  const durationString = formatDuration(differenceInMinutes(end, begin), t);
  return `${dateString} (${durationString})`;
}

export const CHANGE_RESERVATION_TIME = gql`
  mutation StaffAdjustReservationTime(
    $input: ReservationStaffAdjustTimeMutationInput!
  ) {
    staffAdjustReservationTime(input: $input) {
      pk
      begin
      end
      state
    }
  }
`;

// TODO add create new reservation mutation

type CommonProps = {
  onClose: () => void;
};
type MutationValues = {
  pk: number | undefined,
  begin: Date,
  end: Date,
  buffers: { before?: number; after?: number }
}

// TODO use a fragment
type QueryT = NonNullable<ReservationQuery["reservation"]>;
type ReservationType = Pick<QueryT, "pk" | "begin" | "end" | "reservationUnit" |  "bufferTimeAfter" | "bufferTimeBefore" | "recurringReservation" | "type" >;
type DialogContentProps = {
  form: UseFormReturn<EditFormValueType>;
  reservationUnitPk: number;
  bufferTimeBefore: number;
  bufferTimeAfter: number;
  mutate: (values: MutationValues) => void;
} & CommonProps;


function convertToApiFormat(begin: Date, end: Date) {
  return {
    begin: begin.toISOString(),
    end: end.toISOString(),
  };
}

function DialogContent({
  form,
  reservationUnitPk,
  bufferTimeBefore,
  bufferTimeAfter,
  mutate,
  onClose,
}: DialogContentProps) {
  const { t, i18n } = useTranslation();
  const { notifyError } = useNotification();

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid },
    watch,
  } = form;


  const formDate = watch("date");
  const formEndTime = watch("endTime");
  const formStartTime = watch("startTime");
  const formPks = watch("pk");
  const formType = watch("type");

  const start = parseDateTimeSafe(formDate, formStartTime);
  const end = parseDateTimeSafe(formDate, formEndTime);
  const { hasCollisions, isLoading } = useCheckCollisions({
    reservationPk: formPks,
    reservationUnitPk,
    start,
    end,
    buffers: {
      before:
        formType !== ReservationTypeChoice.Blocked &&
        bufferTimeBefore
          ? bufferTimeBefore
          : 0,
      after:
        formType !== ReservationTypeChoice.Blocked &&
        bufferTimeAfter
          ? bufferTimeAfter
          : 0,
    },
    reservationType: formType,
  });

  const onSubmit = (values: EditFormValueType) => {
    const newStart = parseDateTimeSafe(formDate, formStartTime);
    const newEnd = parseDateTimeSafe(formDate, formEndTime);
    const { pk } = values;
    if (newStart && newEnd) {
      try {
        mutate({
          pk,
          begin: newStart,
          end: newEnd,
          buffers: {
            before: values.enableBufferTimeBefore ? bufferTimeBefore : 0,
            after: values.enableBufferTimeAfter ? bufferTimeAfter : 0,
          },
        });
      } catch (err) {
      if (err instanceof Error) {
        const { message } = err;
        console.warn("error", message);
        const translatedError = i18n.exists(`errors.descriptive.${message}`)
          ? t(`errors.descriptive.${message}`)
          : t("errors.descriptive.genericError");
        notifyError(
          t("ReservationDialog.saveFailed", { error: translatedError })
        );
      } else {
        console.warn("error", err);
        notifyError(t("ReservationDialog.saveFailed"));
      }
    }

    }
  };

  const translateError = (errorMsg?: string) =>
    errorMsg ? t(`reservationForm:errors.${errorMsg}`) : "";

  const newTimeString = start && end ? formatDateInterval(t, start, end) : "";
  // TODO this is only relaevant for moving existing reservations (not new ones)
  // const originalTime = formatDateInterval(t, startDateTime, endDateTime);
  const isDisabled = (!isDirty && !isValid) || isLoading || hasCollisions;
  return (
    <Dialog.Content>
      <StyledForm onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* FIX later reservation.recurringReservation && (
          <TimeInfoBox>
            {t("Reservation.EditTime.recurringInfoLabel")}:{" "}
            <Bold>
              {recurringReservationInfoText({
                weekdays: filterNonNullable(
                  reservation.recurringReservation.weekdays
                ),
                begin: ((x) => (x != null ? new Date(x) : undefined))(
                  reservation.recurringReservation.beginDate
                ),
                end: ((x) => (x != null ? new Date(x) : undefined))(
                  reservation.recurringReservation.endDate
                ),
                t,
              })}
            </Bold>
          </TimeInfoBox>
        )*/}
        {/*
        <TimeInfoBox>
          {t("Reservation.EditTime.originalTime")}: <Bold>{originalTime}</Bold>
        </TimeInfoBox>
        */}
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
        <FormProvider {...form}>
          <BufferToggles before={bufferTimeBefore} after={bufferTimeAfter} />
        </FormProvider>
        <TimeInfoBox $isDisabled={!isDirty || !isValid}>
          {/* TODO different translation for new reservations */}
          {t("Reservation.EditTime.newTime")}: <Bold>{newTimeString}</Bold>
        </TimeInfoBox>
        {hasCollisions && (
          /* TODO different translation for new reservations */
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
            disabled={isDisabled}
            type="submit"
          >
            {/* TODO different translation for new reservations */}
            {t("Reservation.EditTime.accept")}
          </Button>
        </ActionButtons>
      </StyledForm>
    </Dialog.Content>
  );
}

const StyledDialog = styled(Dialog)`
  /* larger than normal HDS modal */
  && {
    width: 100%;
  }
  max-width: 944px;
`;

export type NewReservationModalProps = CommonProps & {
  // TODO this can't be reservation unit really (has to be the recurringReservation where the new reservation is created)
  // FIXME replace these three with a single reservation (we need to copy all the metadata from another reservation in the series)
  // should also be the one we are looking at in the UI (not the first or some other one)
  // (because two reservations in the same series can have different metadata)
  // if some of them are in the past and some in the future and they got edited after that (the ones in the past have the original metadata)
  reservationUnit: Pick<ReservationUnitNode, "pk" | "bufferTimeAfter" | "bufferTimeBefore" | "reservationStartInterval">;
  recurringReservationPk: number;
  type: ReservationTypeChoice;
  onAccept: () => void;
}

export function NewReservationModal({
  reservationUnit,
  recurringReservationPk,
  type,
  onAccept,
  onClose,
}: NewReservationModalProps) {
  const { t } = useTranslation();
  const { isOpen } = useModal();

  // NOTE 0 => buffer disabled for this reservation, undefined => no buffers selected
  const bufferTimeBefore = reservationUnit?.bufferTimeBefore ?? 0;
  const bufferTimeAfter = reservationUnit?.bufferTimeAfter ?? 0;

  const interval = getNormalizedInterval(reservationUnit?.reservationStartInterval);

  // TODO should we even have default values?
  const now = useMemo(() => new Date(), []);
  const startDateTime = now;
  const endDateTime = now;

  const form = useForm<EditFormValueType>({
    resolver: zodResolver(TimeChangeFormSchemaRefined(interval)),
    mode: "onChange",
    defaultValues: {
      date: format(startDateTime, "dd.MM.yyyy"),
      startTime: format(startDateTime, "HH:mm"),
      endTime: format(endDateTime, "HH:mm"),
      enableBufferTimeAfter: true,
      enableBufferTimeBefore: true,
      // FIXME this is incorrect (they are created as part of a series)
      // so we need to use the type from other reservations in that series
      type: ReservationTypeChoice.Staff,
    },
  });

  // TODO for the create mutation we need to pass in at least the recurringReservationPk (from another reservation in the same series)
  // but do we need to pass in also the metadata? i.e. copy all the fields from another reservation?
  const [create] = useCreateStaffReservationMutation();

  const mutate = async ({ begin, end, buffers }: MutationValues) => {
    console.log("create", begin, end, buffers);
    if (!reservationUnit.pk) {
      throw new Error("reservation unit pk missing");
    }
    create({
      variables: {
        input: {
          ...convertToApiFormat(begin, end),
          bufferTimeAfter: String(buffers.after),
          bufferTimeBefore: String(buffers.before),
          reservationUnitPks: [reservationUnit.pk],
          type,
          recurringReservationPk,
        },
      },
    });
    // TODO notify success
    onAccept();
  }

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
      <ErrorBoundary fallback={<div>{t("errors.unknown")}</div>}>
        <DialogContent
          form={form}
          reservationUnitPk={reservationUnit.pk ?? 0}
          bufferTimeAfter={bufferTimeAfter}
          bufferTimeBefore={bufferTimeBefore}
          mutate={mutate}
          onClose={onClose}
        />
      </ErrorBoundary>
    </StyledDialog>
  );
}

// TODO refactor so it doesnt require a reservation
// use the same UI for new reservation creation (only requires unit or reservation unit?)
// allow either a move or new (if / else if we have to)
export function EditTimeModal({ reservation, onAccept, onClose }: CommonProps & { onAccept: () => void; reservation: ReservationType }) {
  const { isOpen } = useModal();
  const { t } = useTranslation();

  const startDateTime = new Date(reservation.begin);
  const endDateTime = new Date(reservation.end);

  const reservationUnit = reservation.reservationUnit?.find(() => true);

  // NOTE 0 => buffer disabled for this reservation, undefined => no buffers selected
  const bufferTimeBefore =
    (reservation.bufferTimeBefore || reservationUnit?.bufferTimeBefore) ?? 0;
  const bufferTimeAfter =
    (reservation.bufferTimeAfter || reservationUnit?.bufferTimeAfter) ?? 0;

  const interval = getNormalizedInterval(reservationUnit?.reservationStartInterval);

  const form = useForm<EditFormValueType>({
    resolver: zodResolver(TimeChangeFormSchemaRefined(interval)),
    mode: "onChange",
    defaultValues: {
      date: format(startDateTime, "dd.MM.yyyy"),
      startTime: format(startDateTime, "HH:mm"),
      endTime: format(endDateTime, "HH:mm"),
      enableBufferTimeAfter: !!reservation.bufferTimeAfter,
      enableBufferTimeBefore: !!reservation.bufferTimeBefore,
      type: reservation.type ?? ReservationTypeChoice.Staff,
    },
  });

  const { notifySuccess } = useNotification();

  // TODO the mutation should be passed as a prop
  // or actually a callback function that takes in the form values
  const [changeTimeMutation] = useStaffAdjustReservationTimeMutation();

  // TODO this callback needs to passed as a prop
  const changeTime = async ({ pk, begin, end, buffers }: MutationValues) => {
      // TODO this should use createReservationMutation
      if (!pk) {
        throw new Error("pk missing");
      }
      changeTimeMutation({
        variables: {
          input: {
            ...convertToApiFormat(begin, end),
            pk,
            bufferTimeAfter:
              buffers.after != null ? String(buffers.after) : undefined,
            bufferTimeBefore:
              buffers.before != null ? String(buffers.before) : undefined,
          },
        },
      });
      notifySuccess(t("Reservation.EditTime.successToast"));
      onAccept();
   }

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
      <ErrorBoundary fallback={<div>{t("errors.unknown")}</div>}>
        <DialogContent
          form={form}
          reservationUnitPk={reservation.reservationUnit?.[0]?.pk ?? 0}
          bufferTimeAfter={bufferTimeAfter}
          bufferTimeBefore={bufferTimeBefore}
          mutate={changeTime}
          onClose={onClose}
        />
      </ErrorBoundary>
    </StyledDialog>
  );
}
