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
  TextArea,
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
import { reservationSchema, ReservationType } from "./validator";

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
  const {
    control,
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(reservationSchema),
    shouldFocusError: true,
    defaultValues: {
      date: valueForDateInput(start.toISOString()),
      startTime: formatDate(start.toISOString(), "HH:mm") as string,
      endTime: "",
      workingMemo: "",
      type: undefined as ReservationType | undefined,
    },
  });

  const { notifyError, notifySuccess } = useNotification();

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
        type: String(getValues("type")),
        begin: dateTime(getValues("date"), getValues("startTime")),
        end: dateTime(getValues("date"), getValues("endTime")),
        workingMemo: getValues("workingMemo"),
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Dialog.Content>
        <VerticalFlex style={{ marginTop: "var(--spacing-m)" }}>
          <HorisontalFlex>
            <Controller
              name="date"
              control={control}
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
              control={control}
              render={({ field }) => (
                <TimeInput
                  id="ReservationDialog.startTime"
                  label={t("ReservationDialog.startTime")}
                  hoursLabel="hours"
                  minutesLabel="minutes"
                  errorText={errors.startTime?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <TimeInput
                  id="ReservationDialog.endtime"
                  label={t("ReservationDialog.endTime")}
                  hoursLabel="hours"
                  minutesLabel="minutes"
                  errorText={errors.endTime?.message}
                  {...field}
                />
              )}
            />
          </HorisontalFlex>
          <Controller
            name="type"
            control={control}
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
          <TextArea
            label={t("ReservationDialog.comment")}
            id="ReservationDialog.comment"
            {...register("workingMemo")}
            errorText={errors.workingMemo?.message}
          />
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
