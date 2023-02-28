import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDayIntervals } from "common/src/calendar/util";
import type {
  ErrorType,
  RecurringReservationCreateMutationInput,
  RecurringReservationCreateMutationPayload,
  ReservationStaffCreateMutationInput,
  ReservationStaffCreateMutationPayload,
  ReservationUnitType,
} from "common/types/gql-types";
import { camelCase, get, trimStart } from "lodash";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client";
import { format } from "date-fns";
import { Button, DateInput, Select, TextArea, TextInput } from "hds-react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { removeRefParam } from "common/src/reservation-form/util";
import { RecurringReservationFormSchema } from "./RecurringReservationSchema";
import type { RecurringReservationForm } from "./RecurringReservationSchema";
import SortedSelect from "../../ReservationUnits/ReservationUnitEditor/SortedSelect";
import { WeekdaysSelector } from "./WeekdaysSelector";
import { ReservationList } from "./ReservationsList";
import { CREATE_RECURRING_RESERVATION } from "./queries";
import { useNotification } from "../../../context/NotificationContext";
import { dateTime } from "../../ReservationUnits/ReservationUnitEditor/DateTimeInput";
import { CREATE_STAFF_RESERVATION } from "../create-reservation/queries";
import { ReservationsMade } from "./RecurringReservationDone";
import { ActionsWrapper } from "./commonStyling";
import { flattenMetadata } from "../create-reservation/utils";
import { useMultipleReservation } from "./hooks";
import { useReservationUnitQuery } from "../hooks";
import ReservationTypeForm from "../ReservationTypeForm";

const Label = styled.p<{ $bold?: boolean }>`
  font-family: var(--fontsize-body-m);
  font-weight: ${({ $bold }) => ($bold ? "700" : "500")};
`;

// Three column grid on desktop and one on small screens.
const Grid = styled.div`
  max-width: var(--container-width-small);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1rem 2rem;
`;

const Element = styled.div<{ $wide?: boolean; $start?: boolean }>`
  grid-column: ${({ $wide, $start }) =>
    $wide ? "1 / -1" : $start ? "1 / span 1" : "auto / span 1"};
  max-width: var(--prose-width);
`;

const CommentsTextArea = styled(TextArea)`
  grid-column: 1 / -1;
  max-width: var(--prose-width);
`;

const TRANS_PREFIX = "MyUnits.RecurringReservationForm";

type Props = {
  reservationUnits: ReservationUnitType[];
  onReservation: (res: ReservationsMade) => void;
};

const MyUnitRecurringReservationForm = ({
  reservationUnits,
  onReservation,
}: Props) => {
  const { t } = useTranslation();

  const form = useForm<RecurringReservationForm>({
    mode: "onChange",
    resolver: zodResolver(RecurringReservationFormSchema),
    defaultValues: {
      bufferTimeAfter: false,
      bufferTimeBefore: false,
      type: "STAFF",
    },
  });

  const {
    handleSubmit,
    control,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const selectedReservationUnit = watch("reservationUnit");

  const newReservations = useMultipleReservation(form);

  const reservationUnitOptions =
    reservationUnits.map((unit) => ({
      label: unit?.nameFi ?? "",
      value: String(unit?.pk),
    })) || [];

  const repeatPatternOptions = [
    { value: "weekly", label: t("common.weekly") },
    { value: "biweekly", label: t("common.biweekly") },
  ];

  const [create] = useMutation<
    { createRecurringReservation: RecurringReservationCreateMutationPayload },
    { input: RecurringReservationCreateMutationInput }
  >(CREATE_RECURRING_RESERVATION);

  const createRecurringReservation = (
    input: RecurringReservationCreateMutationInput
  ) => create({ variables: { input } });

  const createReservationMutation = useMutation<
    { createStaffReservation: ReservationStaffCreateMutationPayload },
    { input: ReservationStaffCreateMutationInput }
  >(CREATE_STAFF_RESERVATION);

  const createStaffReservation = (input: ReservationStaffCreateMutationInput) =>
    createReservationMutation[0]({ variables: { input } });

  const unit = selectedReservationUnit?.value;

  const { reservationUnit } = useReservationUnitQuery(
    unit ? Number(unit) : undefined
  );

  // TODO these are problematic since there is no test case for them
  // they are the same in the single reservation but the use case and design isn't clear.
  const bufferTimeBefore = reservationUnit?.bufferTimeBefore ?? undefined;
  const bufferTimeAfter = reservationUnit?.bufferTimeAfter ?? undefined;

  const startInterval = reservationUnit?.reservationStartInterval;

  const timeSelectionOptions = startInterval
    ? getDayIntervals("01:00", "23:00", startInterval).map((n) => ({
        label: trimStart(n.substring(0, 5).replace(":", "."), "0"),
        value: trimStart(n.substring(0, 5), "0"),
      }))
    : [];

  const { notifyError } = useNotification();

  const onSubmit = async (data: RecurringReservationForm) => {
    try {
      const unitPk = reservationUnit?.pk;
      if (unitPk == null) {
        throw new Error("Reservation unit not selected");
      }

      const metadataSetFields =
        reservationUnit?.metadataSet?.supportedFields
          ?.filter((x): x is string => x != null)
          .map(camelCase) ?? [];

      const flattenedMetadataSetValues = flattenMetadata(
        data,
        metadataSetFields
      );

      const input: RecurringReservationCreateMutationInput = {
        reservationUnitPk: unitPk,
        beginDate: format(data.startingDate, "yyyy-MM-dd"),
        beginTime: data.startingTime.value,
        endDate: format(data.endingDate, "yyyy-MM-dd"),
        endTime: data.endingTime.value,
        weekdays: data.repeatOnDays,
        recurrenceInDays: data.repeatPattern.value === "weekly" ? 7 : 14,
        name: data.seriesName,
        description: data.comments,

        // TODO missing fields
        // abilityGroupPk?: InputMaybe<Scalars["Int"]>;
        // ageGroupPk?: InputMaybe<Scalars["Int"]>;
        // clientMutationId?: InputMaybe<Scalars["String"]>;
        // user?: InputMaybe<Scalars["String"]>;
      };

      const { data: createResponse } = await createRecurringReservation(input);

      if (
        createResponse?.createRecurringReservation == null ||
        createResponse?.createRecurringReservation.errors != null
      ) {
        // Why is this done like this (taken from single reservation)?
        const firstError = (
          createResponse?.createRecurringReservation?.errors || []
        ).find(() => true);

        notifyError(
          t("ReservationDialog.saveFailed", {
            error: get(firstError, "messages[0]"),
          })
        );
      } else {
        // TODO this is common with the ReservationForm combine them
        const myDateTime = (date: Date, time: string) =>
          dateTime(format(date, "dd.MM.yyyy"), time);

        // TODO see if this can be combined with ReservationDialog (it's very similar)
        const rets = newReservations.map(async (x) => {
          const common = {
            startTime: x.startTime,
            endTime: x.endTime,
            date: x.date,
          };

          try {
            const staffInput: ReservationStaffCreateMutationInput = {
              reservationUnitPks: [unitPk],
              recurringReservationPk:
                createResponse.createRecurringReservation.pk,
              type: data.type,
              begin: myDateTime(x.date, x.startTime),
              end: myDateTime(x.date, x.endTime),
              bufferTimeBefore: bufferTimeBefore
                ? String(bufferTimeBefore)
                : undefined,
              bufferTimeAfter: bufferTimeAfter
                ? String(bufferTimeBefore)
                : undefined,
              workingMemo: data.comments,
              ...flattenedMetadataSetValues,
            };
            const { data: resData } = await createStaffReservation(staffInput);

            if (resData == null) {
              return {
                ...common,
                reservationPk: undefined,
                error: "Null error",
              };
            }

            // TODO When does the graphql send errors as data? oposed to exceptions
            if (resData.createStaffReservation.errors != null) {
              return {
                ...common,
                reservationPk: undefined,
                error:
                  resData.createStaffReservation.errors.filter(
                    (y): y is ErrorType => y != null
                  ) ?? "unkown error",
              };
            }
            return {
              ...common,
              reservationPk: resData.createStaffReservation.pk ?? undefined,
              error: undefined,
            };
          } catch (e) {
            // This happens at least when the start time is in the past
            // or if there is a another reservation on that time slot
            return {
              ...common,
              reservationPk: undefined,
              error: String(e),
            };
          }
        });

        const result = await Promise.all(rets).then((y) => y);
        onReservation(result);
      }
    } catch (e) {
      notifyError(
        t("ReservationDialog.saveFailed", { error: get(e, "message") })
      );
      // on exception in RecurringReservation (because we are catching the individual errors)
      // We don't need to cleanup the RecurringReservation that has zero connections.
      // Based on documentation backend will do this for us.
    }
  };

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1);
  };

  const translateError = (errorMsg?: string) =>
    errorMsg ? t(`${TRANS_PREFIX}.errors.${errorMsg}`) : undefined;

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid>
          <Element $start>
            <Controller
              name="reservationUnit"
              control={control}
              defaultValue={{ label: "", value: "" }}
              render={({ field }) => (
                <SortedSelect
                  {...removeRefParam(field)}
                  sort
                  label={t(`${TRANS_PREFIX}.reservationUnit`)}
                  multiselect={false}
                  placeholder={t("common.select")}
                  options={reservationUnitOptions}
                  required
                  invalid={errors.reservationUnit != null}
                  error={translateError(errors.reservationUnit?.message)}
                />
              )}
            />
          </Element>

          <Element $start>
            <Controller
              name="startingDate"
              control={control}
              render={({ field: { name, onChange } }) => (
                <DateInput
                  name={name}
                  id="startingDate"
                  disabled={reservationUnit == null}
                  label={t(`${TRANS_PREFIX}.startingDate`)}
                  minDate={new Date()}
                  placeholder={t("common.select")}
                  onChange={(_, date) => onChange(date)}
                  disableConfirmation
                  language="fi"
                  required
                  errorText={translateError(errors.startingDate?.message)}
                />
              )}
            />
          </Element>

          <Element>
            <Controller
              name="endingDate"
              control={control}
              render={({ field: { name, onChange } }) => (
                <DateInput
                  id="endingDate"
                  name={name}
                  disabled={reservationUnit == null}
                  label={t(`${TRANS_PREFIX}.endingDate`)}
                  minDate={new Date()}
                  placeholder={t("common.select")}
                  onChange={(_, date) => onChange(date)}
                  disableConfirmation
                  language="fi"
                  required
                  errorText={translateError(errors.endingDate?.message)}
                />
              )}
            />
          </Element>
          <Element>
            <Controller
              name="repeatPattern"
              control={control}
              defaultValue={{ label: "", value: "weekly" }}
              render={({ field }) => (
                <SortedSelect
                  {...removeRefParam(field)}
                  sort
                  disabled={reservationUnit == null}
                  label={t(`${TRANS_PREFIX}.repeatPattern`)}
                  multiselect={false}
                  placeholder={t("common.select")}
                  options={repeatPatternOptions}
                  required
                  invalid={errors.repeatPattern != null}
                  error={translateError(errors.repeatPattern?.message)}
                />
              )}
            />
          </Element>

          <Element $start>
            <Controller
              name="startingTime"
              control={control}
              defaultValue={{ label: "", value: "" }}
              render={({ field }) => (
                <Select
                  {...removeRefParam(field)}
                  disabled={!timeSelectionOptions.length}
                  label={t(`${TRANS_PREFIX}.startingTime`)}
                  multiselect={false}
                  placeholder={t("common.select")}
                  options={timeSelectionOptions}
                  invalid={errors.startingTime != null}
                  required
                  error={translateError(errors.startingTime?.message)}
                />
              )}
            />
          </Element>
          <Element>
            <Controller
              name="endingTime"
              control={control}
              defaultValue={{ label: "", value: "" }}
              render={({ field }) => (
                <Select
                  {...removeRefParam(field)}
                  disabled={!timeSelectionOptions.length}
                  label={t(`${TRANS_PREFIX}.endingTime`)}
                  multiselect={false}
                  placeholder={t("common.select")}
                  options={timeSelectionOptions}
                  required
                  invalid={errors.endingTime != null}
                  error={translateError(errors.endingTime?.message)}
                />
              )}
            />
          </Element>

          <Element $start>
            <Controller
              name="repeatOnDays"
              control={control}
              render={({ field: { value, onChange } }) => (
                <WeekdaysSelector
                  label={t(`${TRANS_PREFIX}.repeatOnDays`)}
                  disabled={reservationUnit == null}
                  value={value}
                  onChange={onChange}
                  errorText={translateError(errors.repeatOnDays?.message)}
                />
              )}
            />
          </Element>

          {newReservations && (
            <Element $wide>
              <Label $bold>
                {t(`${TRANS_PREFIX}.reservationsList`, {
                  count: newReservations.length,
                })}
              </Label>
              <ReservationList items={newReservations} />
            </Element>
          )}

          <Element $wide>
            {/* TODO from this point on this is the same as the Single reservation */}
            {reservationUnit != null && (
              <ReservationTypeForm reservationUnit={reservationUnit}>
                <TextInput
                  id="name"
                  disabled={reservationUnit == null}
                  label={t(`${TRANS_PREFIX}.name`)}
                  required
                  {...register("seriesName")}
                  errorText={translateError(errors.seriesName?.message)}
                />
                <CommentsTextArea
                  id="comments"
                  disabled={reservationUnit == null}
                  label={t(`${TRANS_PREFIX}.comments`)}
                  {...register("comments")}
                  errorText={translateError(errors.comments?.message)}
                  required={false}
                />
              </ReservationTypeForm>
            )}
          </Element>

          <ActionsWrapper>
            {/* cancel is disabled while sending because we have no rollback */}
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {t("common.reserve")}
            </Button>
          </ActionsWrapper>
        </Grid>
      </form>
    </FormProvider>
  );
};

export { MyUnitRecurringReservationForm };
