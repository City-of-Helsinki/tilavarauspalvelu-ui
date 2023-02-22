import React, { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDayIntervals } from "common/src/calendar/util";
import {
  ErrorType,
  Query,
  QueryReservationUnitsArgs,
  RecurringReservationCreateMutationInput,
  RecurringReservationCreateMutationPayload,
  ReservationStaffCreateMutationInput,
  ReservationStaffCreateMutationPayload,
  ReservationUnitType,
} from "common/types/gql-types";
import { camelCase, get, pick, trimStart, zipObject } from "lodash";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@apollo/client";
import { format } from "date-fns";
import {
  Button,
  Checkbox,
  DateInput,
  RadioButton,
  Select,
  SelectionGroup,
  TextArea,
  TextInput,
} from "hds-react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { removeRefParam } from "common/src/reservation-form/util";
import { RecurringReservationFormSchema } from "./RecurringReservationSchema";
import type { RecurringReservationForm } from "./RecurringReservationSchema";
import SortedSelect from "../../ReservationUnits/ReservationUnitEditor/SortedSelect";
import { WeekdaysSelector } from "../../../common/WeekdaysSelector";
import { ReservationType } from "../create-reservation/types";
import { generateReservations, ReservationList } from "./ReservationsList";
import { CREATE_RECURRING_RESERVATION } from "./queries";
import { useNotification } from "../../../context/NotificationContext";
import { dateTime } from "../../ReservationUnits/ReservationUnitEditor/DateTimeInput";
import {
  CREATE_STAFF_RESERVATION,
  RESERVATION_UNIT_QUERY,
} from "../create-reservation/queries";
import MetadataSetForm from "../create-reservation/MetadataSetForm";
import { ReservationsMade } from "./RecurringReservationDone";
import { ActionsWrapper } from "./commonStyling";

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

const FullRow = styled.div`
  grid-column: 1 / -1;
  max-width: var(--prose-width);
`;

// TODO parametrize (1 for start / auto for other)
// TODO if possible remove the extra div from Controller
const SmallElementRowBegin = styled.div`
  grid-column: 1 / span 1;
`;

const SmallElement = styled.div`
  grid-column: auto / span 1;
`;

const CommentsTextArea = styled(TextArea)`
  grid-column: 1 / -1;
  max-width: var(--prose-width);
`;

const getReservationUnitBuffers = ({
  reservationUnits,
  pk,
}: {
  reservationUnits?: ReservationUnitType[];
  pk?: string;
}) => {
  if (!reservationUnits || !pk) return undefined;

  const unit = reservationUnits.find((ru) => ru.pk === parseInt(pk, 10));
  const buffers = {
    bufferTimeBefore: unit?.bufferTimeBefore || undefined,
    bufferTimeAfter: unit?.bufferTimeAfter || undefined,
  };
  const hasBuffers = Object.values(buffers).some(Boolean);

  return hasBuffers ? buffers : undefined;
};

const getReservationUnitStartInterval = ({
  reservationUnits,
  pk,
}: {
  reservationUnits?: ReservationUnitType[];
  pk?: string;
}) => {
  if (!reservationUnits || !pk) return undefined;

  const unit = reservationUnits.find((ru) => ru.pk === parseInt(pk, 10));

  return unit?.reservationStartInterval;
};

// TODO passing pk: undefined into this is bad, but hooks can't be conditional
// TODO this should be combined with the code in CreateReservationModal (duplicated for now)
const useReservationUnitQuery = (unitPk?: number) => {
  const { data, loading } = useQuery<Query, QueryReservationUnitsArgs>(
    RESERVATION_UNIT_QUERY,
    {
      variables: { pk: [`${unitPk}`] },
    }
  );

  const reservationUnit =
    data?.reservationUnits?.edges.find((ru) => ru)?.node ?? undefined;

  return { reservationUnit, loading };
};

type Props = {
  reservationUnits: ReservationUnitType[];
  onReservation: (res: ReservationsMade) => void;
};

/* TODO
  label styling is wrong but it's a project wide problem
  font-weight: 500 doesn't work at all (Medium font)
  label line-height is incorrect (1.15, should be 1.5) => HDS problem
*/
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
      typeOfReservation: "STAFF",
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

  // TODO these can be replaced by directly using the unit after useReservationUnit
  const buffers = getReservationUnitBuffers({
    reservationUnits,
    pk: selectedReservationUnit?.value,
  });
  const startInterval = getReservationUnitStartInterval({
    reservationUnits,
    pk: selectedReservationUnit?.value,
  });

  const selectedReservationParams = watch([
    "startingDate",
    "endingDate",
    "startingTime",
    "endingTime",
    "repeatPattern",
    "repeatOnDays",
  ]);

  const newReservations = useMemo(
    () =>
      generateReservations({
        startingDate: selectedReservationParams[0],
        endingDate: selectedReservationParams[1],
        startingTime: selectedReservationParams[2],
        endingTime: selectedReservationParams[3],
        repeatPattern: selectedReservationParams[4],
        repeatOnDays: selectedReservationParams[5],
      }),
    [selectedReservationParams]
  );

  const reservationUnitOptions =
    reservationUnits.map((unit) => ({
      label: unit?.nameFi ?? "",
      value: String(unit?.pk),
    })) || [];

  const timeSelectionOptions = startInterval
    ? getDayIntervals("01:00", "23:00", startInterval).map((n) => ({
        label: trimStart(n.substring(0, 5).replace(":", "."), "0"),
        value: trimStart(n.substring(0, 5), "0"),
      }))
    : [];

  const repeatPatternOptions = [
    { value: "weekly", label: t("common.weekly") },
    { value: "biweekly", label: t("common.biweekly") },
  ];

  const tnamespace = "MyUnits.RecurringReservationForm";

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

  const { reservationUnit, loading: unitLoading } = useReservationUnitQuery(
    unit ? Number(unit) : undefined
  );

  // Why is this a thing?
  const renamePkFields = ["ageGroup", "homeCity", "purpose"];

  const { notifyError } = useNotification();

  // TODO before submitting do a query when the time / dates change to check if the space is available
  // check against newReservations and display it to the user before submitting
  // Apollo throws an error on overlapping reservation but we should not send those at all.
  const onSubmit = async (data: RecurringReservationForm) => {
    try {
      const unitPk = Number(data.reservationUnit.value);
      const metadataSetFields =
        reservationUnit?.metadataSet?.supportedFields
          ?.filter((x): x is string => x != null)
          .map(camelCase) ?? [];

      const metadataSetValues = pick(data, metadataSetFields);

      const flattenedMetadataSetValues = zipObject(
        Object.keys(metadataSetValues).map((k) =>
          renamePkFields.includes(k) ? `${k}Pk` : k
        ),
        Object.values(metadataSetValues).map((v) => get(v, "value") || v)
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

        // TODO missing fields
        // abilityGroupPk?: InputMaybe<Scalars["Int"]>;
        // ageGroupPk?: InputMaybe<Scalars["Int"]>;
        // clientMutationId?: InputMaybe<Scalars["String"]>;
        // description?: InputMaybe<Scalars["String"]>;
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

        console.error("GraphQL failed: first error:", firstError);
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
              reservationUnitPks: [Number(unit)],
              recurringReservationPk:
                createResponse.createRecurringReservation.pk,
              type: data.typeOfReservation,
              begin: myDateTime(x.date, x.startTime),
              end: myDateTime(x.date, x.endTime),
              bufferTimeBefore: buffers?.bufferTimeBefore
                ? String(buffers.bufferTimeBefore)
                : undefined,
              bufferTimeAfter: buffers?.bufferTimeAfter
                ? String(buffers.bufferTimeAfter)
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
      console.log("exception", e);
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

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid>
          <SmallElementRowBegin>
            <Controller
              name="reservationUnit"
              control={control}
              defaultValue={{ label: "", value: "" }}
              render={({ field }) => (
                <SortedSelect
                  sort
                  label={t(`${tnamespace}.reservationUnit`)}
                  multiselect={false}
                  placeholder={t("common.select")}
                  options={reservationUnitOptions}
                  required
                  invalid={errors.reservationUnit != null}
                  error={errors.reservationUnit?.label?.message}
                  {...removeRefParam(field)}
                />
              )}
            />
          </SmallElementRowBegin>

          <SmallElementRowBegin>
            <Controller
              name="startingDate"
              control={control}
              render={({ field: { name, onChange } }) => (
                <DateInput
                  name={name}
                  id="startingDate"
                  label={t(`${tnamespace}.startingDate`)}
                  minDate={new Date()}
                  placeholder={t("common.select")}
                  onChange={(_, date) => onChange(date)}
                  disableConfirmation
                  language="fi"
                  required
                  errorText={errors.startingDate?.message}
                />
              )}
            />
          </SmallElementRowBegin>

          <SmallElement>
            <Controller
              name="endingDate"
              control={control}
              render={({ field: { name, onChange } }) => (
                <DateInput
                  id="endingDate"
                  name={name}
                  label={t(`${tnamespace}.endingDate`)}
                  minDate={new Date()}
                  placeholder={t("common.select")}
                  onChange={(_, date) => onChange(date)}
                  disableConfirmation
                  language="fi"
                  required
                  errorText={errors.endingDate?.message}
                />
              )}
            />
          </SmallElement>
          <SmallElement>
            <Controller
              name="repeatPattern"
              control={control}
              defaultValue={{ label: "", value: "weekly" }}
              render={({ field }) => (
                <SortedSelect
                  {...removeRefParam(field)}
                  sort
                  label={t(`${tnamespace}.repeatPattern`)}
                  multiselect={false}
                  placeholder={t("common.select")}
                  options={repeatPatternOptions}
                  required
                  invalid={errors.repeatPattern?.label?.message != null}
                  error={errors.repeatPattern?.label?.message}
                />
              )}
            />
          </SmallElement>

          <SmallElementRowBegin>
            <Controller
              name="startingTime"
              control={control}
              defaultValue={{ label: "", value: "" }}
              render={({ field }) => (
                <Select
                  {...removeRefParam(field)}
                  disabled={!timeSelectionOptions.length}
                  label={t(`${tnamespace}.startingTime`)}
                  multiselect={false}
                  placeholder={t("common.select")}
                  options={timeSelectionOptions}
                  required
                  error={errors.startingTime?.label?.message}
                />
              )}
            />
          </SmallElementRowBegin>
          <SmallElement>
            <Controller
              name="endingTime"
              control={control}
              defaultValue={{ label: "", value: "" }}
              render={({ field }) => (
                <Select
                  {...removeRefParam(field)}
                  disabled={!timeSelectionOptions.length}
                  label={t(`${tnamespace}.endingTime`)}
                  multiselect={false}
                  placeholder={t("common.select")}
                  options={timeSelectionOptions}
                  required
                  error={errors.endingTime?.message}
                />
              )}
            />
          </SmallElement>

          {buffers ? (
            <FullRow>
              <Label>{t(`${tnamespace}.buffers`)}</Label>
              {Object.entries(buffers).map(
                ([key, value]) =>
                  value && (
                    <Controller
                      name={key as keyof RecurringReservationForm}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id={key}
                          label={t(`${tnamespace}.${key}`, {
                            minutes: value / 60,
                          })}
                          // TODO why is this converted to string?
                          // validate and make it a type error if it isn't a string
                          checked={String(field.value) === "true"}
                          {...field}
                          ref={null}
                          // TODO why is this converted to string?
                          value={String(field.value)}
                        />
                      )}
                    />
                  )
              )}
            </FullRow>
          ) : null}
          <FullRow>
            {/* TODO Label is not a label => it's a paragraph but it should be a header or something */}
            <Label>{t(`${tnamespace}.repeatOnDays`)}</Label>
            <Controller
              name="repeatOnDays"
              control={control}
              render={({ field: { value, onChange } }) => (
                <WeekdaysSelector
                  value={value}
                  onChange={onChange}
                  errorText={errors.repeatOnDays?.message}
                />
              )}
            />
          </FullRow>

          {newReservations ? (
            <FullRow>
              <Label $bold>
                {t(`${tnamespace}.reservationsList`, {
                  count: newReservations.length,
                })}
              </Label>
              <ReservationList items={newReservations} />
            </FullRow>
          ) : null}
          <FullRow>
            <Controller
              name="typeOfReservation"
              control={control}
              render={({ field }) => (
                <SelectionGroup
                  label={t(`${tnamespace}.typeOfReservation`)}
                  required
                  errorText={errors.typeOfReservation?.message}
                >
                  {Object.values(ReservationType)
                    .filter((v) => typeof v === "string")
                    .map((v) => (
                      <RadioButton
                        key={v}
                        id={v}
                        checked={v === field.value}
                        label={t(`${tnamespace}.reservationType.${v}`)}
                        onChange={() => field.onChange(v)}
                      />
                    ))}
                </SelectionGroup>
              )}
            />
          </FullRow>

          <FullRow>
            <TextInput
              id="name"
              label={t(`${tnamespace}.name`)}
              required
              {...register("seriesName")}
              errorText={errors.seriesName?.message}
            />
          </FullRow>
          <FullRow>
            <CommentsTextArea
              id="comments"
              label={t(`${tnamespace}.comments`)}
              {...register("comments")}
              errorText={errors.comments?.message}
              required={false}
            />
          </FullRow>

          {/* TODO this should be nicely formatted and translated (can we use Loader even when it's a subset of a form) */}
          {unitLoading ? (
            <div>Loading metadata</div>
          ) : !unit || !reservationUnit ? null : (
            <FullRow>
              {/* TODO hack to deal with the component not supporting style / styled components */}
              <MetadataSetForm reservationUnit={reservationUnit} />
            </FullRow>
          )}
          <ActionsWrapper>
            {/* disabled while sending because we have no rollback functionality */}
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
