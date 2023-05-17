import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  ErrorType,
  RecurringReservationCreateMutationInput,
  RecurringReservationCreateMutationPayload,
  ReservationStaffCreateMutationInput,
  ReservationStaffCreateMutationPayload,
  ReservationUnitType,
} from "common/types/gql-types";
import { camelCase, get } from "lodash";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client";
import { format, parse } from "date-fns";
import { Button, TextInput } from "hds-react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { removeRefParam } from "common/src/reservation-form/util";
import { RecurringReservationFormSchema } from "./RecurringReservationSchema";
import type { RecurringReservationForm } from "./RecurringReservationSchema";
import SortedSelect from "../../ReservationUnits/ReservationUnitEditor/SortedSelect";
import { WeekdaysSelector } from "./WeekdaysSelector";
import ReservationList, {
  NewReservationListItem,
} from "../../ReservationsList";
import { CREATE_RECURRING_RESERVATION } from "./queries";
import { useNotification } from "../../../context/NotificationContext";
import { dateTime } from "../../ReservationUnits/ReservationUnitEditor/DateTimeInput";
import { CREATE_STAFF_RESERVATION } from "../create-reservation/queries";
import { ReservationMade } from "./RecurringReservationDone";
import { ActionsWrapper, Grid as BaseGrid, Element } from "./commonStyling";
import { flattenMetadata } from "../create-reservation/utils";
import { useMultipleReservation, useReservationsInInterval } from "./hooks";
import { useReservationUnitQuery } from "../hooks";
import ReservationTypeForm from "../ReservationTypeForm";
import ControlledTimeInput from "../components/ControlledTimeInput";
import ControlledDateInput from "../components/ControlledDateInput";
import ReservationListButton from "../../ReservationListButton";

const Label = styled.p<{ $bold?: boolean }>`
  font-family: var(--fontsize-body-m);
  font-weight: ${({ $bold }) => ($bold ? "700" : "500")};
`;

const InnerTextInput = styled(TextInput)`
  grid-column: 1 / -1;
  max-width: var(--prose-width);
`;

// max-width causes grids to overflow (forms should not overflow)
const Grid = styled(BaseGrid)`
  max-width: unset;
`;

const TRANS_PREFIX = "MyUnits.RecurringReservationForm";

/* TODO this needs a wrapper with a query to check the available reservations
Also needs controls that allow adding and removing the reservations to the list
Use a separate array for the blocked (clear it if the date selection changes)
This is the easiest way of doing it, but might be inefficient.
*/
const ReservationListEditor = ({
  items,
  reservationUnitPk,
  begin,
  end,
}: {
  items: NewReservationListItem[];
  reservationUnitPk: number;
  begin: Date;
  end: Date;
}) => {
  const { reservations, loading } = useReservationsInInterval({
    reservationUnitPk,
    begin,
    end,
  });

  const { t } = useTranslation();

  // TODO quick-n-diry move the state upward or better yet useContext
  const [removedItems, setRemovedItems] = useState<number[]>([]);

  // TODO move the utility code somewhere else (we could use it in the calendar also)
  type DateRange = {
    begin: Date;
    end: Date;
  };

  // TODO equality check or no? does 08:00 - 09:00 and 09:00 - 10:00 overlap or no?
  const isDateInRange = (a: Date, range: DateRange) => {
    if (a > range.begin && a < range.end) {
      return true;
    }
    return false;
  };

  const isOverllaping = (a: DateRange, b: DateRange) => {
    if (isDateInRange(a.begin, b) || isDateInRange(a.end, b)) {
      return true;
    }
    if (isDateInRange(b.begin, a) || isDateInRange(b.end, a)) {
      return true;
    }
    return false;
  };

  // TODO error boundaries so this doesn't happen
  const convertToDate = (d: Date, time: string) => {
    try {
      return parse(time, "HH:mm", d);
    } catch (e) {
      console.log("exception: ", e);
      return undefined;
    }
  };

  // TODO use a hashmap or something else than an index?
  // We can directly modify the input array (assuming we use a state)
  // the problem with this approach is that it's massive array and copying it is silly
  // but the map below does a full copy anyway when ever the state changes
  const handleRemove = (index: number) => {
    setRemovedItems([...removedItems, index]);
  };

  const handleRestore = (index: number) => {
    const fid = removedItems.findIndex((i) => i === index);
    if (fid) {
      const toUpdate = [
        ...removedItems.slice(0, fid),
        ...removedItems.slice(fid + 1),
      ];

      setRemovedItems(toUpdate);
    }
  };

  // TODO add buttons that allow removing the reservation from the list
  // need a context to hold the removed reservations though
  // FIXME cleanup so we don't need ts-ignore
  const tested = items.map((x, index) =>
    reservations.find(
      (y) =>
        convertToDate(x.date, x.startTime) &&
        convertToDate(x.date, x.endTime) &&
        isOverllaping(
          {
            // @ts-ignore
            begin: convertToDate(x.date, x.startTime),
            // @ts-ignore
            end: convertToDate(x.date, x.endTime),
          },
          y
        )
    )
      ? { ...x, isOverllaping: true }
      : // TODO cleanup (use a wrapper function or multiple maps)
        {
          ...x,
          buttons: removedItems.find((i) => i === index)
            ? [
                ReservationListButton({
                  callback: () => handleRestore(index),
                  type: "restore",
                  t,
                }),
              ]
            : [
                ReservationListButton({
                  callback: () => handleRemove(index),
                  type: "remove",
                  t,
                }),
              ],
        }
  );

  return <ReservationList items={tested} hasPadding />;
};

type Props = {
  reservationUnits: ReservationUnitType[];
};

const MyUnitRecurringReservationForm = ({ reservationUnits }: Props) => {
  const { t } = useTranslation();

  const form = useForm<RecurringReservationForm>({
    mode: "onChange",
    resolver: zodResolver(RecurringReservationFormSchema),
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
    getValues,
    formState: { errors, isSubmitting, dirtyFields, isSubmitted },
  } = form;

  const selectedReservationUnit = watch("reservationUnit");

  const reservationUnitOptions =
    reservationUnits.map((unit) => ({
      label: unit?.nameFi ?? "",
      value: String(unit?.pk),
    })) || [];

  const repeatPatternOptions = [
    { value: "weekly", label: t("common.weekly") },
    { value: "biweekly", label: t("common.biweekly") },
  ] as const;

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

  const { notifyError } = useNotification();

  const translateError = (errorMsg?: string) =>
    errorMsg ? t(`${TRANS_PREFIX}.errors.${errorMsg}`) : "";

  const newReservations = useMultipleReservation(
    form,
    reservationUnit?.reservationStartInterval
  );

  const navigate = useNavigate();

  const onSubmit = async (data: RecurringReservationForm) => {
    // TODO notifyError does a double translation somewhere
    if (!newReservations.success) {
      notifyError(t(translateError("formNotValid")));
      return;
    }
    if (newReservations.reservations.length === 0) {
      notifyError(t(translateError("noReservations")));
      return;
    }
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

      // Allow blocked reservations without a name
      const name = data.seriesName || data.type === "BLOCKED" ? "BLOCKED" : "";
      const input: RecurringReservationCreateMutationInput = {
        reservationUnitPk: unitPk,
        beginDate: format(data.startingDate, "yyyy-MM-dd"),
        beginTime: data.startTime,
        endDate: format(data.endingDate, "yyyy-MM-dd"),
        endTime: data.endTime,
        weekdays: data.repeatOnDays,
        recurrenceInDays: data.repeatPattern.value === "weekly" ? 7 : 14,
        name,
        // TODO this should not be required based on the API spec but empty fails the mutation
        description: data.comments || "toistuva varaus",

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
        const rets = newReservations.reservations.map(async (x) => {
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

        const result: ReservationMade[] = await Promise.all(rets).then(
          (y) => y
        );
        navigate("completed", { state: result });
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

  const handleCancel = () => {
    navigate(-1);
  };

  // TODO (futher work) validators shouldn't be run if the field is focused
  //    because when we input partial values like time: 20:-- but are still editing
  //    the field is dirty and invalid so the error jumps to the UI

  // Do custom error checking for fields since resolver only checks the current field
  // Takes the first error only since this updates live while the user types
  const getZodError = (
    field: "startingDate" | "endingDate" | "startTime" | "endTime"
  ) =>
    (isSubmitted || dirtyFields[field]) && !newReservations?.success
      ? String(
          translateError(
            newReservations.error.issues
              .filter((x) => x.path.includes(field))
              .find(() => true)?.message
          )
        )
      : "";

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
            <ControlledDateInput
              name="startingDate"
              control={form.control}
              error={getZodError("startingDate")}
              disabled={reservationUnit == null}
              required
            />
          </Element>

          <Element>
            <ControlledDateInput
              name="endingDate"
              control={form.control}
              error={getZodError("endingDate")}
              disabled={reservationUnit == null}
              required
            />
          </Element>
          <Element>
            <Controller
              name="repeatPattern"
              control={control}
              defaultValue={repeatPatternOptions[0]}
              render={({ field }) => (
                <SortedSelect
                  {...removeRefParam(field)}
                  sort
                  disabled={reservationUnit == null}
                  label={t(`${TRANS_PREFIX}.repeatPattern`)}
                  multiselect={false}
                  placeholder={t("common.select")}
                  options={[...repeatPatternOptions]}
                  required
                  invalid={errors.repeatPattern != null}
                  error={translateError(errors.repeatPattern?.message)}
                />
              )}
            />
          </Element>

          <Element $start>
            <ControlledTimeInput
              name="startTime"
              control={form.control}
              error={getZodError("startTime")}
              disabled={reservationUnit == null}
              required
            />
          </Element>
          <Element>
            <ControlledTimeInput
              name="endTime"
              control={form.control}
              error={getZodError("endTime")}
              disabled={reservationUnit == null}
              required
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

          {reservationUnit?.pk != null && (
            <Element $wide>
              <Label $bold>
                {t(`${TRANS_PREFIX}.reservationsList`, {
                  count: newReservations.reservations.length,
                })}
              </Label>
              <ReservationListEditor
                reservationUnitPk={reservationUnit.pk}
                items={newReservations.reservations}
                begin={getValues("startingDate")}
                end={getValues("endingDate")}
              />
            </Element>
          )}

          {reservationUnit != null && (
            <ReservationTypeForm reservationUnit={reservationUnit}>
              <InnerTextInput
                id="name"
                disabled={reservationUnit == null}
                label={t(`${TRANS_PREFIX}.name`)}
                required
                {...register("seriesName")}
                invalid={errors.seriesName != null}
                errorText={translateError(errors.seriesName?.message)}
              />
            </ReservationTypeForm>
          )}

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

export default MyUnitRecurringReservationForm;
