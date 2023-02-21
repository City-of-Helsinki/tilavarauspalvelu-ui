import React, { useMemo } from "react";
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
import {
  RecurringReservationForm,
  RecurringReservationFormSchema,
} from "./RecurringReservationSchema";
import { Grid, Span3, Span6, VerticalFlex } from "../../../styles/layout";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ref, ...rest } = params;
  return rest;
}

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
    resolver: joiResolver(RecurringReservationFormSchema),
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
                    required
                    invalid={errors.reservationUnit != null}
                    error={errors.reservationUnit?.label?.message}
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
                    required
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
                    required
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
                    required
                    invalid={errors.repeatPattern?.label?.message != null}
                    error={errors.repeatPattern?.label?.message}
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
                    required
                    error={errors.startingTime?.label?.message}
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
                    required
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
              {/* TODO one weekday needs to be selected. It's a form validation error, but display it to user here. */}
              {/* TODO Label is not a label => it's a paragraph but it should be a header or something */}
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
              <Span6>
                <TextInput
                  id="name"
                  label={t(`${tnamespace}.name`)}
                  required
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
            {unitLoading ? (
              <div>Loading metadata</div>
            ) : !unit || !reservationUnit ? null : (
              <div style={{ gridColumn: "1 / -1" }}>
                {/* TODO hack to deal with the components not supporting style / styled components */}
                <MetadataSetForm reservationUnit={reservationUnit} />
              </div>
            )}
            <ActionsWrapper>
              <Button variant="secondary" onClick={handleCancel}>
                {t("common.cancel")}
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {t("common.reserve")}
              </Button>
            </ActionsWrapper>
            {/* TODO this should be a loading indicator but how to do it nicely without CLS */}
            {isSubmitting && <div>Submitting</div>}
          </Grid>
        </VerticalFlex>
      </form>
    </FormProvider>
  );
};

export { MyUnitRecurringReservationForm };
