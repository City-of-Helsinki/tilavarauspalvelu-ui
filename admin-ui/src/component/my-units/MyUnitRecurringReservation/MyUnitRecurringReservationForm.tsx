/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState } from "react";
import { joiResolver } from "@hookform/resolvers/joi";
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
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
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
import {
  RecurringReservationForm,
  RecurringReservationFormSchema,
} from "./RecurringReservationSchema";
import {
  Grid,
  Span12,
  Span3,
  Span6,
  VerticalFlex,
} from "../../../styles/layout";
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

const Label = styled.p<{ $bold?: boolean }>`
  font-family: var(--fontsize-body-m);
  font-weight: ${({ $bold }) => ($bold ? "700" : "500")};
`;

const ActionsWrapper = styled.div`
  display: flex;
  grid-column: 1 / -1;
  gap: var(--spacing-m);
  margin-top: 2rem;
  margin-bottom: 2rem;
  justify-content: end;
`;

const FullRow = styled.div`
  grid-column: 1 / -1;
`;

// TODO max width should be a prose variable (in the theme)
const CommentsTextArea = styled(TextArea)`
  grid-column: 1 / -1;
  max-width: 66ch;
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

function removeRefParam<Type>(
  params: Type & { ref: unknown }
): Omit<Type, "ref"> {
  const { ref, ...rest } = params;
  return rest;
}

type Props = {
  reservationUnits: ReservationUnitType[];
};

const MyUnitRecurringReservationForm = ({ reservationUnits }: Props) => {
  const { t } = useTranslation();

  const form = useForm<RecurringReservationForm>({
    mode: "onChange",
    resolver: joiResolver(RecurringReservationFormSchema),
    defaultValues: {
      bufferTimeAfter: false,
      bufferTimeBefore: false,
    },
  });
  const {
    handleSubmit,
    control,
    register,
    watch,
    formState: { errors },
  } = form;

  const selectedReservationUnit = watch("reservationUnit");
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
        reservationUnit: selectedReservationUnit,
        startingDate: selectedReservationParams[0],
        endingDate: selectedReservationParams[1],
        startingTime: selectedReservationParams[2],
        endingTime: selectedReservationParams[3],
        repeatPattern: selectedReservationParams[4],
        repeatOnDays: selectedReservationParams[5],
      }),
    [selectedReservationUnit, selectedReservationParams]
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

  // Form submission
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

  // Metadata section
  // TODO this refreshes on all changes not just reservationUnit changes
  // so no matter what form field is changed the whole component gets rerendered
  const reservationUnitSelection = watch(["reservationUnit"]);

  // TODO there is a type error in the form. Value can be undefined in JS even though it shouldn't in TS
  // the default value for reservationUnit in the form is { label: undefined, value: undefined } not undefined
  // TODO I can't understand my own comment; test this and rewrite either the comment or preferably the type definition
  const unit =
    reservationUnitSelection != null && reservationUnitSelection.length > 0
      ? reservationUnitSelection[0]?.value
      : undefined;

  // TODO passing pk: undefined into this is bad, but hooks can't be conditional (wrap inside it's own hook?)
  // TODO this should be combined with the code in CreateReservationModal (duplicated for now)
  // use a custom hook, yay
  const { data: metadata, loading: metadataLoading } = useQuery<
    Query,
    QueryReservationUnitsArgs
  >(RESERVATION_UNIT_QUERY, {
    variables: { pk: [`${unit}`] },
  });

  const reservationUnit = metadata?.reservationUnits?.edges.find(
    (ru) => ru
  )?.node;

  // Why is this a thing?
  const renamePkFields = ["ageGroup", "homeCity", "purpose"];

  const { notifyError, notifySuccess } = useNotification();

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

      console.log("mutation response: ", createResponse);

      if (
        createResponse?.createRecurringReservation == null ||
        createResponse?.createRecurringReservation.errors != null
      ) {
        // Why is this done like this (taken from single reservation)?
        const firstError = (
          createResponse?.createRecurringReservation?.errors || []
        ).find(() => true);

        console.log("first error: ", firstError);

        console.error("GraphQL failed: first error:", firstError);
        notifyError(
          t("ReservationDialog.saveFailed", {
            error: get(firstError, "messages[0]"),
          })
        );
      } else {
        // TODO we don't want it notifications here we want them after all the individual reservations are done
        console.log("GraphQL success: NOW adding individual reservations");

        // TODO this is common with the ReservationForm combine them
        const myDateTime = (date: Date, time: string) =>
          dateTime(format(date, "dd.MM.yyyy"), time);

        // Use CreateStaffReservationMutation here and set the
        // RecurringReservation.id on it to link them to the parent
        // TODO this needs to be run in a loop based on the days
        // TODO once a prototype is working, see if we can combine some of it
        const rets = newReservations.map(async (x) => {
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
              return { data: undefined, error: "Null error" };
            }

            // TODO When does the graphql send errors as data? oposed to exceptions
            if (resData.createStaffReservation.errors != null) {
              return {
                data: undefined,
                error:
                  resData.createStaffReservation.errors.filter(
                    (y): y is ErrorType => y != null
                  ) ?? "unkown error",
              };
            }
            return { data: resData, error: undefined };
          } catch (e) {
            // This happens at least when the start time is in the past
            // or if there is a another reservation on that time slot
            // console.error("failed single reservation with error: ", e);
            return { data: undefined, error: String(e) };
          }
        });

        const createReservationErrors = await Promise.all(rets).then((y) => {
          return y.filter(({ error }) => error != null);
        });
        const createReservationSuccesses = await Promise.all(rets).then((y) => {
          return y.filter(({ error }) => error == null);
        });

        createReservationErrors.forEach(({ error }) => {
          console.error("Failed to create Staff reservation: ", error);
        });
        createReservationSuccesses.forEach(({ data: resData }) => {
          console.log("Succesfully created a single reservations: ", resData);
        });

        // TODO specify the notification for this reservation type instead of using ReservationDialog
        if (createReservationErrors.length === 0) {
          notifySuccess(
            t("ReservationDialog.saveSuccess", {
              // TODO translation
              reservationUnit: reservationUnit?.nameFi,
            })
          );
        }
        // TODO this should rollback the recurring reservation
        else if (createReservationSuccesses.length === 0) {
          notifyError(
            "all single reservations failed; TODO should rollback the recurring reservation set"
          );
        }
        // The third case where we have both is difficult (check the UI spec)
        else {
          notifyError(
            "Some single reservation failed but other succeeded. TODO show which is which to the user."
          );
        }

        // TODO after all is done, do something (show the user the list of reservations / redirect etc.)
      }
    } catch (e) {
      console.log("exception", e);
      notifyError(
        t("ReservationDialog.saveFailed", { error: get(e, "message") })
      );
      // on exception in RecurringReservation (because we are catching the individual errors)
      // TODO we need to cleanup the RecurringReservation (it has zero connections)
    }
  };

  // TODO this prints errors because radio buttons needs default values
  // TODO replace the Grid / SpanX with proper Grid for this page
  // currently Grid is used like a flexbox.
  // We should use grid-column-start for stuff that's alligned at the start, not start a new grid.
  // TODO responsive breakpoints are really high up for Span3 (should be at 450px or 500px) now they are at 950px
  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VerticalFlex style={{ marginTop: "var(--spacing-m)" }}>
          <Grid>
            <Span6>
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
                    error={errors.reservationUnit?.message}
                    {...removeRefParam(field)}
                  />
                )}
              />
            </Span6>

            <Span3>
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
                    errorText={errors.startingDate?.message}
                  />
                )}
              />
            </Span3>
            <Span3>
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
                    errorText={errors.endingDate?.message}
                  />
                )}
              />
            </Span3>
            <Span3>
              <Controller
                name="repeatPattern"
                control={control}
                defaultValue={{ label: "", value: "weekly" }}
                render={({ field }) => (
                  <SortedSelect
                    sort
                    label={t(`${tnamespace}.repeatPattern`)}
                    multiselect={false}
                    placeholder={t("common.select")}
                    options={repeatPatternOptions}
                    error={errors.repeatPattern?.message}
                    {...removeRefParam(field)}
                  />
                )}
              />
            </Span3>
            <Span3>
              <Controller
                name="startingTime"
                control={control}
                defaultValue={{ label: "", value: "" }}
                render={({ field }) => (
                  <Select
                    disabled={!timeSelectionOptions.length}
                    label={t(`${tnamespace}.startingTime`)}
                    multiselect={false}
                    placeholder={t("common.select")}
                    options={timeSelectionOptions}
                    error={errors.startingTime?.message}
                    {...removeRefParam(field)}
                  />
                )}
              />
            </Span3>
            <Span3>
              <Controller
                name="endingTime"
                control={control}
                defaultValue={{ label: "", value: "" }}
                render={({ field }) => (
                  <Select
                    disabled={!timeSelectionOptions.length}
                    label={t(`${tnamespace}.endingTime`)}
                    multiselect={false}
                    placeholder={t("common.select")}
                    options={timeSelectionOptions}
                    error={errors.endingTime?.message}
                    {...removeRefParam(field)}
                  />
                )}
              />
            </Span3>

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
                            checked={String(field.value) === "true"}
                            {...field}
                            ref={null}
                            value={String(field.value)}
                          />
                        )}
                      />
                    )
                )}
              </FullRow>
            ) : null}
            <FullRow>
              <Label>{t(`${tnamespace}.repeatOnDays`)}</Label>
              <Controller
                name="repeatOnDays"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <WeekdaysSelector value={value} onChange={onChange} />
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
                    errorText={errors.typeOfReservation?.message}
                  >
                    {Object.values(ReservationType)
                      .filter((v) => typeof v === "string")
                      .map((v) => (
                        <RadioButton
                          key={v}
                          id={v as string}
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
              <Span6>
                <TextInput
                  id="name"
                  label={t(`${tnamespace}.name`)}
                  {...register("seriesName")}
                  errorText={errors.seriesName?.message}
                />
              </Span6>
            </FullRow>
            <CommentsTextArea
              id="comments"
              label={t(`${tnamespace}.comments`)}
              {...register("comments")}
              errorText={errors.comments?.message}
              required={false}
            />
          </Grid>
          <Grid>
            {/* TODO this should be nicely formatted and translated (can we use Loader even when it's a subset of a form) */}
            {metadataLoading ? (
              <div>Loading metadata</div>
            ) : !unit || !reservationUnit ? (
              <div>Invalid unit</div>
            ) : (
              <div style={{ gridColumn: "1 / -1" }}>
                {/* TODO hack to deal with the components not supporting style / styled components */}
                <MetadataSetForm reservationUnit={reservationUnit} />
              </div>
            )}
            <ActionsWrapper>
              {/* TODO is the cancel button useful here? */}
              <Button variant="secondary" onClick={() => console.log("test")}>
                {t("common.cancel")}
              </Button>
              <Button variant="primary" type="submit">
                {t("common.reserve")}
              </Button>
            </ActionsWrapper>
          </Grid>
        </VerticalFlex>
      </form>
    </FormProvider>
  );
};

export { MyUnitRecurringReservationForm };
