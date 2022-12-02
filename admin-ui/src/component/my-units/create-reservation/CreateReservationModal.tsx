import React from "react";
import { joiResolver } from "@hookform/resolvers/joi";
import { useForm, Controller } from "react-hook-form";
import {
  RadioButton,
  Button,
  DateInput,
  Dialog,
  SelectionGroup,
  TimeInput,
} from "hds-react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@apollo/client";
import {
  Query,
  QueryReservationUnitsArgs,
  ReservationStaffCreateMutationInput,
  ReservationStaffCreateMutationPayload,
  ReservationUnitType,
} from "common/types/gql-types";
import styled from "styled-components";
import { get } from "lodash";
import {
  valueForDateInput,
  dateTime,
} from "../../ReservationUnits/ReservationUnitEditor/DateTimeInput";
import { formatDate } from "../../../common/util";
import { HorisontalFlex, VerticalFlex } from "../../../styles/layout";
import { useModal } from "../../../context/ModalContext";
import { CREATE_STAFF_RESERVATION, RESERVATION_UNIT_QUERY } from "./queries";
import Loader from "../../Loader";
import { useNotification } from "../../../context/NotificationContext";
import { reservationSchema } from "./validator";
import { ReservationForm, ReservationType } from "./types";
import BlockedReservation from "./BlockedReservation";
import StaffReservation from "./StaffReservation";

const ActionButtons = styled(Dialog.ActionButtons)`
  justify-content: end;
`;

const DialogContent = ({
  onClose,
  reservationUnit,
  start,
}: {
  onClose: () => void;
  reservationUnit: ReservationUnitType;
  start: Date;
}) => {
  const { t } = useTranslation();
  const form = useForm<ReservationForm>({
    resolver: joiResolver(reservationSchema),
    shouldFocusError: true,
    defaultValues: {
      date: valueForDateInput(start.toISOString()),
      startTime: formatDate(start.toISOString(), "HH:mm") as string,
      bufferTimeBefore: false,
      bufferTimeAfter: false,
    },
  });

  const {
    formState: { errors },
  } = form;

  const { notifyError, notifySuccess } = useNotification();

  const type = form.watch("type");

  const [create] = useMutation<
    { createStaffReservation: ReservationStaffCreateMutationPayload },
    { input: ReservationStaffCreateMutationInput }
  >(CREATE_STAFF_RESERVATION);

  const createStaffReservation = (input: ReservationStaffCreateMutationInput) =>
    create({ variables: { input } });

  const onSubmit = async () => {
    try {
      const input = {
        reservationUnitPks: [reservationUnit.pk as number],
        type: String(form.getValues("type")),
        begin: dateTime(form.getValues("date"), form.getValues("startTime")),
        end: dateTime(
          form.getValues("date"),
          form.getValues("endTime") as string
        ),
        workingMemo: form.getValues("workingMemo"),
      } as ReservationStaffCreateMutationInput;

      await createStaffReservation(input);
      notifySuccess(
        t("ReservationDialog.saveSuccess", {
          reservationUnit: reservationUnit.nameFi,
        })
      );
      onClose();
    } catch (e) {
      notifyError(
        t("ReservationDialog.saveFailed", { error: get(e, "message") })
      );
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Dialog.Content>
        <VerticalFlex style={{ marginTop: "var(--spacing-m)" }}>
          <HorisontalFlex>
            <Controller
              name="date"
              control={form.control}
              render={({ field }) => (
                <DateInput
                  id="reservationDialog.date"
                  label={t("ReservationDialog.date")}
                  minDate={new Date()}
                  disableConfirmation
                  language="fi"
                  errorText={errors.date?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="startTime"
              control={form.control}
              render={({ field }) => (
                <TimeInput
                  id="ReservationDialog.startTime"
                  label={t("ReservationDialog.startTime")}
                  hoursLabel={t("common.hoursLabel")}
                  minutesLabel={t("common.minutesLabel")}
                  required
                  errorText={errors.startTime?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="endTime"
              control={form.control}
              render={({ field }) => (
                <TimeInput
                  id="ReservationDialog.endtime"
                  label={t("ReservationDialog.endTime")}
                  hoursLabel={t("common.hoursLabel")}
                  minutesLabel={t("common.minutesLabel")}
                  required
                  errorText={errors.endTime?.message}
                  {...field}
                />
              )}
            />
          </HorisontalFlex>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <SelectionGroup
                required
                label={t("ReservationDialog.type")}
                errorText={errors.type?.message}
              >
                {Object.values(ReservationType)
                  .filter((v) => typeof v === "string")
                  .map((v) => (
                    <RadioButton
                      key={v}
                      id={v as string}
                      checked={v === field.value}
                      label={t(`ReservationDialog.reservationType.${v}`)}
                      onChange={() => field.onChange(v)}
                    />
                  ))}
              </SelectionGroup>
            )}
          />
          {type === ReservationType.BLOCKED && (
            <BlockedReservation form={form} />
          )}
          {type === ReservationType.STAFF && <StaffReservation form={form} />}
        </VerticalFlex>
      </Dialog.Content>
      <ActionButtons>
        <Button variant="secondary" onClick={onClose} theme="black">
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("ReservationDialog.accept")}</Button>
      </ActionButtons>
    </form>
  );
};

const CreateReservationModal = ({
  reservationUnitId,
  start,
  onClose,
}: {
  reservationUnitId: number;
  start: Date;
  onClose: () => void;
}): JSX.Element => {
  const { isOpen } = useModal();
  const { t } = useTranslation();

  const { data, loading } = useQuery<Query, QueryReservationUnitsArgs>(
    RESERVATION_UNIT_QUERY,
    {
      variables: { pk: [`${reservationUnitId}`] },
    }
  );

  if (loading) {
    return <Loader />;
  }

  const reservationUnit = data?.reservationUnits?.edges.find((ru) => ru)?.node;

  return (
    <Dialog
      variant="primary"
      id="info-dialog"
      aria-labelledby="modal-header"
      aria-describedby="modal-description"
      isOpen={isOpen}
      focusAfterCloseRef={undefined}
      scrollable
    >
      <Dialog.Header
        id="modal-header"
        title={t("ReservationDialog.title", {
          reservationUnit: reservationUnit?.nameFi,
        })}
      />
      <DialogContent
        onClose={onClose}
        reservationUnit={reservationUnit as ReservationUnitType}
        start={start}
      />
    </Dialog>
  );
};
export default CreateReservationModal;
