import React from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { Button, DateInput, Dialog, TimeInput } from "hds-react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client";
import type {
  ReservationStaffCreateMutationInput,
  ReservationStaffCreateMutationPayload,
  ReservationUnitType,
} from "common/types/gql-types";
import styled from "styled-components";
import { camelCase, get } from "lodash";
import { addYears, format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { dateTime } from "../../ReservationUnits/ReservationUnitEditor/DateTimeInput";
import { useModal } from "../../../context/ModalContext";
import { CREATE_STAFF_RESERVATION } from "./queries";
import Loader from "../../Loader";
import { useNotification } from "../../../context/NotificationContext";
import { ReservationFormSchema } from "./validator";
import type { ReservationFormType } from "./validator";
import { flattenMetadata } from "./utils";
import { useReservationUnitQuery } from "../hooks";
import ReservationTypeForm from "../ReservationTypeForm";

const ActionButtons = styled(Dialog.ActionButtons)`
  justify-content: end;
`;

const CommonFields = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr 1fr;
  margin-top: var(--spacing-m);
  margin-bottom: var(--spacing-m);
`;

// container-l for the max-width doesn't make it 944px ever (880px instead)
// TODO height? as in we don't want the dialog ever to resize but we also don't need massive margins on mobile
// TODO change name to LargeDialog or smth
const StyledDialog = styled(Dialog)`
  height: 80%;
  display: flex;
  flex-grow: 0;
  min-width: auto;
  width: auto !important;
  max-width: var(--container-width-l);
  & > div:nth-child(2) {
    height: 100%;
    flex-grow: 1;
  }
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
  const form = useForm<ReservationFormType>({
    resolver: zodResolver(
      ReservationFormSchema(reservationUnit.reservationStartInterval)
    ),
    // TODO onBlur or onChange? onChange is anoying because it highlights even untouched fields
    // onBlur on the other hand does no validation on the focused field till it's blurred
    // sigh I want show errors for touched fields onBlur + clear errors onChange
    // I guess I just have to write logic for it using isTouched + onChange
    // Also both do a full form validation showing all the required fields as errors on the first edit
    // while not actually showing refined errors.
    // For example input 1.1.2020 as a date (past date error)
    // this will highlight all the empty unTouched fields while not highlighting date field you just edited.
    // even with onChange I have to submit the form to get refined errors if there is a single Required field
    // not filled in the form.
    // So first part of the problem is that isRequired is blocking all other errors.
    // next part of the problem is that required validation is not done onChange while refinements are (requires a submit)
    // last part is that unTouched fields get error checking.
    mode: "onChange",
    defaultValues: {
      date: start,
      startTime: format(start, "HH:mm"),
      bufferTimeBefore: false,
      bufferTimeAfter: false,
    },
  });

  const {
    trigger,
    formState: { errors },
    getFieldState,
  } = form;

  const myDateTime = (date: Date, time: string) =>
    dateTime(format(date, "dd.MM.yyyy"), time);

  const { notifyError, notifySuccess } = useNotification();

  const [create] = useMutation<
    { createStaffReservation: ReservationStaffCreateMutationPayload },
    { input: ReservationStaffCreateMutationInput }
  >(CREATE_STAFF_RESERVATION);

  const createStaffReservation = (input: ReservationStaffCreateMutationInput) =>
    create({ variables: { input } });

  const onSubmit = async (values: ReservationFormType) => {
    try {
      if (!reservationUnit.pk) {
        throw new Error("Missing reservation unit");
      }

      const metadataSetFields =
        reservationUnit.metadataSet?.supportedFields
          ?.filter((x): x is string => x != null)
          .map(camelCase) ?? [];

      const flattenedMetadataSetValues = flattenMetadata(
        values,
        metadataSetFields
      );

      const input: ReservationStaffCreateMutationInput = {
        reservationUnitPks: [reservationUnit.pk],
        type: values.type ?? "",
        begin: myDateTime(new Date(values.date), values.startTime),
        end: myDateTime(new Date(values.date), values.endTime),
        bufferTimeBefore: values.bufferTimeBefore
          ? String(reservationUnit.bufferTimeBefore)
          : undefined,
        bufferTimeAfter: values.bufferTimeAfter
          ? String(reservationUnit.bufferTimeAfter)
          : undefined,
        workingMemo: values.comments,
        ...flattenedMetadataSetValues,
      };

      const { data: createResponse } = await createStaffReservation(input);

      const firstError = (
        createResponse?.createStaffReservation?.errors || []
      ).find(() => true);

      if (firstError) {
        notifyError(
          t("ReservationDialog.saveFailed", {
            error: get(firstError, "messages[0]"),
          })
        );
      } else {
        notifySuccess(
          t("ReservationDialog.saveSuccess", {
            reservationUnit: reservationUnit.nameFi,
          })
        );
        onClose();
      }
    } catch (e) {
      notifyError(
        t("ReservationDialog.saveFailed", { error: get(e, "message") })
      );
    }
  };

  // TODO refactor the form part of this outside the dialog
  return (
    <>
      <Dialog.Content>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CommonFields>
              <Controller
                name="date"
                control={form.control}
                render={({ field: { value, onChange } }) => (
                  <DateInput
                    id="reservationDialog.date"
                    label={t("ReservationDialog.date")}
                    minDate={new Date()}
                    maxDate={addYears(new Date(), 3)}
                    disableConfirmation
                    language="fi"
                    errorText={errors.date?.message}
                    invalid={errors.date != null}
                    // hack to deal with defaultValue without breaking keyboard input
                    value={
                      !getFieldState("date").isDirty
                        ? format(value, "dd.MM.yyyy")
                        : undefined
                    }
                    required
                    onChange={(_, date) => onChange(date)}
                    onBlur={() => trigger()}
                  />
                )}
              />
              <Controller
                name="startTime"
                control={form.control}
                render={({ field: { value, onChange } }) => (
                  <TimeInput
                    id="ReservationDialog.startTime"
                    label={t("ReservationDialog.startTime")}
                    hoursLabel={t("common.hoursLabel")}
                    minutesLabel={t("common.minutesLabel")}
                    required
                    errorText={errors.startTime?.message}
                    onChange={onChange}
                    value={value}
                    onBlur={() => trigger()}
                  />
                )}
              />
              <Controller
                name="endTime"
                control={form.control}
                render={({ field: { value, onChange } }) => (
                  <TimeInput
                    id="ReservationDialog.endtime"
                    label={t("ReservationDialog.endTime")}
                    hoursLabel={t("common.hoursLabel")}
                    minutesLabel={t("common.minutesLabel")}
                    required
                    errorText={errors.endTime?.message}
                    onChange={onChange}
                    value={value}
                    onBlur={() => trigger()}
                  />
                )}
              />
            </CommonFields>
            <ReservationTypeForm reservationUnit={reservationUnit} />
          </form>
        </FormProvider>
      </Dialog.Content>
      <ActionButtons>
        <Button variant="secondary" onClick={onClose} theme="black">
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          onClick={() => {
            form.handleSubmit(onSubmit)();
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

  const { reservationUnit, loading } =
    useReservationUnitQuery(reservationUnitId);

  if (loading) {
    return <Loader />;
  }

  return (
    <StyledDialog
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
      {reservationUnit != null && (
        <DialogContent
          onClose={onClose}
          reservationUnit={reservationUnit}
          start={start}
        />
      )}
    </StyledDialog>
  );
};
export default CreateReservationModal;
