import React, { useState } from "react";
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
import Joi from "joi";
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
  const [type, setType] = useState<ReservationType>();
  const [date, setDate] = useState(valueForDateInput(start.toISOString()));
  const [workingMemo, setWorkingMemo] = useState("");
  const [validationError, setValidationError] = useState<Joi.ValidationError>();
  const { notifyError, notifySuccess } = useNotification();

  const [startTime, setStartTime] = useState(
    formatDate(start.toISOString(), "HH:mm") as string
  );
  const [endTime, setEndTime] = useState(
    formatDate(start.toISOString(), "HH:mm") as string
  );

  const [create] = useMutation<
    { createStaffReservation: ReservationStaffCreateMutationPayload },
    { input: ReservationStaffCreateMutationInput }
  >(CREATE_STAFF_RESERVATION);

  const getErrorDetails = (field: string) =>
    validationError?.details?.find((detail) => detail.context?.key === field);

  const createStaffReservation = (input: ReservationStaffCreateMutationInput) =>
    create({ variables: { input } });

  const createReservation = async () => {
    try {
      const input = {
        reservationUnitPks: [reservationUnit.pk as number],
        type: String(type),
        begin: dateTime(date, startTime),
        end: dateTime(date, endTime),
        workingMemo,
      };

      const validationResult = reservationSchema.validate(input);
      if (validationResult.error) {
        setValidationError(validationResult.error);
      }
      await createStaffReservation(input);
      notifySuccess(`Varaus tehty kohteeseen ${reservationUnit.nameFi}`);
      onClose();
    } catch (e) {
      notifyError(
        t("ReservationDialog.saveFailed", { error: get(e, "message") })
      );
    }
  };

  return (
    <>
      <Dialog.Content>
        <VerticalFlex style={{ marginTop: "var(--spacing-m)" }}>
          <HorisontalFlex>
            <DateInput
              id="reservationDialog.date"
              label={t("ReservationDialog.date")}
              value={date}
              minDate={new Date()}
              onChange={(d) => setDate(d)}
              disableConfirmation
              language="fi"
              errorText={getErrorDetails("date")?.message}
            />
            <TimeInput
              id="ReservationDialog.startTime"
              label={t("ReservationDialog.startTime")}
              hoursLabel="hours"
              minutesLabel="minutes"
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value);
              }}
              errorText={getErrorDetails("begin")?.message}
            />
            <TimeInput
              id="ReservationDialog.endtime"
              label={t("ReservationDialog.endTime")}
              hoursLabel="hours"
              minutesLabel="minutes"
              value={endTime}
              onChange={(event) => {
                setEndTime(event.target.value);
              }}
              errorText={getErrorDetails("end")?.message}
            />
          </HorisontalFlex>
          <SelectionGroup
            required
            label={t("ReservationDialog.type")}
            errorText={getErrorDetails("type")?.message}
          >
            {Object.values(ReservationType)
              .filter((v) => typeof v === "string")
              .map((v) => (
                <RadioButton
                  key={v}
                  id={v as string}
                  checked={v === type}
                  label={t(`ReservationDialog.reservationType.${v}`)}
                  onClick={() => setType(v as ReservationType)}
                />
              ))}
          </SelectionGroup>
          <TextArea
            label={t("ReservationDialog.comment")}
            id="ReservationDialog.comment"
            value={workingMemo}
            onChange={(e) => setWorkingMemo(e.target.value)}
          />
        </VerticalFlex>
      </Dialog.Content>
      <ActionButtons>
        <Button variant="secondary" onClick={onClose} theme="black">
          {t("common.cancel")}
        </Button>
        <Button
          onClick={() => {
            createReservation();
          }}
        >
          {t("ReservationDialog.accept")}
        </Button>
      </ActionButtons>
    </>
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
