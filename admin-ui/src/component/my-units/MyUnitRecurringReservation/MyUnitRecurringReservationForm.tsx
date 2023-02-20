/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState } from "react";
import { joiResolver } from "@hookform/resolvers/joi";
import { getDayIntervals } from "common/src/calendar/util";
import {
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

// TODO this does a full render any time you switch out any fields, not just the reservation unit
// i.e. the watch for the reservation unit refreshes on any change
const MetadataPart = () => {
  // TODO modify the data to get the pk
  // Do a GraphQL query to get the actual unit info so we can pass it to the form part
  // TODO <MetadataSetForm reservationUnit={reservationUnit} />

  const { watch } = useFormContext<RecurringReservationForm>();

  // TODO This needs a memo or something because it's run on all changes not just reservationUnit changes
  // or component split so that the sub component doesn't rerun
  const selection = watch(["reservationUnit"]);

  // TODO there is a type error in the form value can be undefined in JS even though it shouldn't in TS
  // the default value for reservationUnit in the form is { label: undefined, value: undefined } not undefined
  const unit =
    selection != null && selection.length > 0 ? selection[0]?.value : undefined;
  console.log("MetadataPart: reservation units: ", unit);

  // TODO this should be combined with the code in CreateReservationModal (duplicated for now)
  const { data, loading } = useQuery<Query, QueryReservationUnitsArgs>(
    RESERVATION_UNIT_QUERY,
    {
      variables: { pk: [`${unit}`] },
    }
  );

  const reservationUnit = data?.reservationUnits?.edges.find((ru) => ru)?.node;

  // TODO this should be nicely formatted and translated (don't use Loader because this is a subset of a form)
  if (loading) {
    return <div>Loading metadata</div>;
  }
  if (!unit || !reservationUnit) {
    return <div>Invalid unit</div>;
  }

  // TODO hack to deal with the components not supporting style / styled components
  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <MetadataSetForm reservationUnit={reservationUnit} />;
    </div>
  );
  // return <>TODO render metadata</>;
};

type Props = {
  reservationUnits: ReservationUnitType[];
};

// TODO this has double 'name' fields
// one from the Metadata, one for the 'recurring', do we only need one? or both and rename them slightly
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

  // Why is this a thing?
  const renamePkFields = ["ageGroup", "homeCity", "purpose"];

  const { notifyError, notifySuccess } = useNotification();

  const onSubmit = async (data: RecurringReservationForm) => {
    console.log("submitted: ", data);
    // TODO this is coppied from StaffReservation (Modal)
    try {
      // this is the pk as a number
      const unit = Number(data.reservationUnit.value);
      console.log("reservation unit: ", unit);
      /* TODO the metadata needs to be implemented after selecting the unit
      const metadataSetFields = (
        (reservationUnit.metadataSet?.supportedFields || []) as string[]
      ).map(camelCase);

      const metadataSetValues = pick(data, metadataSetFields);

      const flattenedMetadataSetValues = zipObject(
        Object.keys(metadataSetValues).map((k) =>
          renamePkFields.includes(k) ? `${k}Pk` : k
        ),
        Object.values(metadataSetValues).map((v) => get(v, "value") || v)
      );
      */

      // TODO this is common with the ReservationForm combine them
      const myDateTime = (date: Date, time: string) =>
        dateTime(format(date, "dd.MM.yyyy"), time);

      const input: RecurringReservationCreateMutationInput = {
        reservationUnitPk: unit,
        // type: data.type,
        // TODO convert 13.2.2023 date into 2023-02-13
        beginDate: "2023-02-13", // data.startingDate, // myDateTime(new Date(
        beginTime: data.startingTime.value,
        endDate: "2023-02-28", // data.endingDate,
        endTime: data.endingTime.value,
        weekdays: data.repeatOnDays,
        recurrenceInDays: data.repeatPattern.value === "weekly" ? 7 : 14,
        // myDateTime(new Date(data.endingDate), data.endingTime),
        // bufferTimeBefore: data.bufferTimeBefore,
        // ? String(reservationUnit.bufferTimeBefore)
        // : undefined,
        // bufferTimeAfter: data.bufferTimeAfter,
        // ? String(reservationUnit.bufferTimeAfter)
        // : undefined,
        // workingMemo: data.workingMemo,
        // FIXME metadata
        // ...flattenedMetadataSetValues,
      };
      // TODO really really hate the use of as in Typescript

      const { data: createResponse } = await createRecurringReservation(input);

      console.log("mutation response: ", createResponse);

      // What??? why is this done like this
      const firstError = (
        createResponse?.createRecurringReservation?.errors || []
      ).find(() => true);

      console.log("first error: ", firstError);

      if (firstError) {
        console.error("GraphQL failed: first error:", firstError);
        notifyError(
          t("ReservationDialog.saveFailed", {
            error: get(firstError, "messages[0]"),
          })
        );
      } else {
        // TODO we don't want it notifications here we want them after all the individual reservations are done
        console.log("GraphQL success: adding individual reservations");
        /*
        notifySuccess(
          t("ReservationDialog.saveSuccess", {
            reservationUnit:
              "FIXME this should be the unit name, but it needs a query",
          })
        );
        */

        // Use CreateStaffReservationMutation here and set the
        // RecurringReservation.id on it to link them to the parent
        // TODO this needs to be run in a loop based on the days
        // TODO once a prototype is working, see if we can combine some of it
        newReservations.map(async (x) => {
          try {
            const staffInput: ReservationStaffCreateMutationInput = {
              reservationUnitPks: [Number(unit)],
              type: "STAFF", // FIXME
              begin: myDateTime(new Date(x.date), x.startTime),
              end: myDateTime(new Date(x.date), x.endTime),
              bufferTimeBefore: buffers?.bufferTimeBefore
                ? String(buffers.bufferTimeBefore)
                : undefined,
              bufferTimeAfter: buffers?.bufferTimeAfter
                ? String(buffers.bufferTimeAfter)
                : undefined,
              // TODO what?
              // workingMemo: values.workingMemo,
              // TODO metadata requires us to move the form here
              // ...flattenedMetadataSetValues,
            };
            const { data: resData } = await createStaffReservation(staffInput);

            // TODO When does the graphql send errors as data?
            if (resData?.createStaffReservation?.errors) {
              console.log(
                "failed to create reservation with error",
                resData?.createStaffReservation?.errors
              );
            } else {
              console.log("successfully created reservation: ", staffInput);
            }
          } catch (e) {
            // This happens at least when the start time is in the past
            console.error("failed single reservation with error: ", e);
          }
        });

        // TODO after all is done, do something (show the user the list of reservations / redirect etc.)
      }
    } catch (e) {
      console.log("exception", e);
      notifyError(
        t("ReservationDialog.saveFailed", { error: get(e, "message") })
      );
      // on exception in StaffReservation (first of them)
      // we need to cleanup the RecurringReservation (if it has zero connections)
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
                defaultValue=""
                render={({ field }) => (
                  <DateInput
                    id="startingDate"
                    label={t(`${tnamespace}.startingDate`)}
                    minDate={new Date()}
                    placeholder={t("common.select")}
                    disableConfirmation
                    language="fi"
                    errorText={errors.startingDate?.message}
                    {...field}
                  />
                )}
              />
            </Span3>
            <Span3>
              <Controller
                name="endingDate"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <DateInput
                    id="endingDate"
                    label={t(`${tnamespace}.endingDate`)}
                    minDate={new Date()}
                    placeholder={t("common.select")}
                    disableConfirmation
                    language="fi"
                    errorText={errors.endingDate?.message}
                    {...field}
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
                  {...register("name")}
                  errorText={errors.name?.message}
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
            <MetadataPart />
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
