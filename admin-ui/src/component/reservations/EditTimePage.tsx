import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Control, Controller, UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { add, differenceInMinutes, format } from "date-fns";
import styled from "styled-components";
import { Button, Select } from "hds-react";
import { z } from "zod";
import {
  Mutation,
  MutationStaffAdjustReservationTimeArgs,
  ReservationType,
  ReservationUnitsReservationUnitReservationStartIntervalChoices,
} from "common/types/gql-types";
import { useNotification } from "app/context/NotificationContext";
import withMainMenu from "../withMainMenu";
import EditPageWrapper from "./EditPageWrapper";
import { useReservationEditData } from "./requested/hooks";
import Loader from "../Loader";
import Calendar from "./requested/Calendar";
import { CHANGE_RESERVATION_TIME } from "./queries";
import ControlledDateInput from "../my-units/components/ControlledDateInput";
import {
  TimeChangeFormSchemaRefined,
  TimeFormSchema,
  durationToTimeString,
  generateTimeIntervals,
  intervalToMinutes,
  minutesToDuration,
  setTimeOnDate,
  timeToDuration,
} from "./utils";

const StyledForm = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
  margin: 1rem;
`;

// TODO bad using this combined with the zod parser that is designed for ReservationForm
// should use a separate zod parser for this maybe? technically this works
// why it's bad? because the type inferance is inconsistent (schema should define the types so they are in insync)
// why we need to do this? because the resolver has extended refinements that check the times
// is it necessary? not really because the refinement is primarily used for startTime, endTime checking
// how to solve? reuse the date, startTime refinments and add a length refinement
// type FormValueType = ReservationFormType;

type Time = {
  hours: number;
  minutes: number;
};
type OptionType = { value: string; label: string };
const LengthSelect = ({
  control,
  interval,
  min,
  max,
  name,
}: {
  control: Control<FormValueType, unknown>;
  interval: ReservationUnitsReservationUnitReservationStartIntervalChoices;
  min: Time;
  max: Time;
  name: "length" | "startTime";
}) => {
  const { t } = useTranslation();

  const options = generateTimeIntervals(
    intervalToMinutes(interval),
    min,
    max
  ).map((x) => ({
    value: x,
    label: x,
  }));

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: true }}
      render={({ field: { onChange, value } }) => (
        <Select<OptionType>
          label={t(`Reservation.EditTime.form.${name}`)}
          id={name}
          options={options}
          onChange={(selected: OptionType) => onChange(selected.value)}
          value={options.find((x) => x.value === value)}
        />
      )}
    />
  );
};

type FormValueType = z.infer<typeof TimeFormSchema>;

const ChangeTimeFormPart = ({
  reservation,
  onSubmit,
  form,
}: {
  reservation: ReservationType;
  onSubmit: (begin: Date, end: Date) => Promise<unknown>;
  form: UseFormReturn<FormValueType>;
}) => {
  const reservationStartInterval =
    reservation?.reservationUnits?.find(() => true)?.reservationStartInterval ??
    ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_30Mins;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  const { t } = useTranslation();

  const translateError = (errorMsg?: string) =>
    errorMsg ? t(`reservationForm:errors.${errorMsg}`) : "";

  // TODO clear the dirty after submission
  const tSubmit = (values: FormValueType) => {
    if (values.date && values.startTime && values.length) {
      const start = setTimeOnDate(values.date, values.startTime);
      const dur = timeToDuration(values.length);
      if (dur) {
        const end = add(start, dur);
        onSubmit(start, end);
      }
    }
  };

  // FIXME neither the DateInput nor the TimeInput are changed when the event is moved
  // in the calendar. DateInput issue is because the text / Date format problems.
  // TimeInput is a mystery. Neither register nor setting value works for it.
  // I'm guessing it's a bug in HDS with refs / values not updated properly
  // because they break the input into two text fields (which is silly but w/e),
  // so they could lose the ref in the process. There also isn't a useEffect for value changes
  // in TimeInput so a value change should not do anything after creation.
  return (
    <StyledForm onSubmit={handleSubmit(tSubmit)} noValidate>
      <ControlledDateInput
        name="date"
        control={control}
        error={translateError(errors.date?.message)}
        required
      />
      {/* Use select because HDS TimeInput can't be controlled since their ref is broken */}
      <LengthSelect
        control={control}
        interval={reservationStartInterval}
        min={{ hours: 0, minutes: 0 }}
        max={{ hours: 23, minutes: 0 }}
        name="startTime"
      />
      <LengthSelect
        control={control}
        interval={reservationStartInterval}
        min={{ hours: 1, minutes: 0 }}
        max={{ hours: 6, minutes: 0 }}
        name="length"
      />
      <div style={{ alignSelf: "end" }}>
        <Button type="submit" disabled={!isDirty}>
          {t("Reservation.EditPage.save")}
        </Button>
      </div>
    </StyledForm>
  );
};

const EditTime = ({
  reservation,
  onReservationChanged,
}: {
  reservation: ReservationType;
  onReservationChanged: () => void;
}) => {
  const { notifyError } = useNotification();
  const { t } = useTranslation();
  const [forceUpdate, setForceUpdate] = useState(0);

  const [changeTimeMutation] = useMutation<
    Mutation,
    MutationStaffAdjustReservationTimeArgs
  >(CHANGE_RESERVATION_TIME, {
    onCompleted: () => {
      onReservationChanged();
      setForceUpdate(forceUpdate + 1);
    },
    onError: (error) => {
      // TODO handle noOverlapping error separately
      // eslint-disable-next-line no-console
      console.error("Change time mutation failed: ", error);
      notifyError(t("Reservation.EditTime.error.mutation"));
    },
  });

  // TODO form part should be in the component above because
  // we need to do form submits for all mutations.
  // Calendar should update the form data
  const length = differenceInMinutes(
    new Date(reservation.end),
    new Date(reservation.begin)
  );

  const startDateTime = new Date(reservation.begin);

  const form = useForm<FormValueType>({
    resolver: zodResolver(TimeChangeFormSchemaRefined),
    mode: "onChange",
    defaultValues: {
      // TODO convert from DateTime to Date string
      // date: reservation.begin,
      date: startDateTime,
      startTime: format(startDateTime, "HH:mm"),
      length: durationToTimeString(minutesToDuration(length)),
    },
  });
  const { getValues, watch } = form;

  const convertToApiFormat = (begin: Date, end: Date) => ({
    begin: begin.toISOString(),
    end: end.toISOString(),
  });

  const handleSubmit = async (begin: Date, end: Date) => {
    return changeTimeMutation({
      variables: {
        input: {
          ...convertToApiFormat(begin, end),
          // TODO pk can be fixed variable (in the mutation)
          pk: reservation.pk ?? 0,
        },
      },
    });
  };

  // TODO change the form values here (no submit)
  // TODO we need to push an override for the time into Calendar after
  // because reservation is the same but the date and time is changed
  // all forma value changes should cause that
  // WE also need to filter out the selected reservation in the Calendar
  // events query.
  const handleChange = (begin: Date, end: Date) => {
    const l = differenceInMinutes(end, begin);
    const params = {
      shouldValidate: true, // trigger validation
      shouldTouch: true, // update touched fields form state
      shouldDirty: true, // update dirty and dirty fields form state
    };
    form.setValue("date", begin, params);
    form.setValue("startTime", format(begin, "HH:mm"), params);
    form.setValue("length", durationToTimeString(minutesToDuration(l)), params);
  };

  // TODO this is not production code;
  // combine the similar function and make it into a utility or remove it
  const formToDates = (
    values: Partial<FormValueType>
  ): { begin: Date; end: Date } | undefined => {
    if (values.date && values.startTime && values.length) {
      const begin = setTimeOnDate(values.date, values.startTime);
      const dur = timeToDuration(values.length);
      if (dur) {
        const end = add(begin, dur);
        return {
          begin,
          end,
        };
      }
    }
    return undefined;
  };

  const editedReservation = ((x) => ({
    ...reservation,
    ...(x != null ? convertToApiFormat(x.begin, x.end) : {}),
  }))(formToDates(getValues()));

  // need a watcher to update the Calendar when the form changes
  watch();

  return (
    // Quick-n-dirty fix: for select near the bottom of a page; enough padding so opening the select doesn't resize the page
    <div style={{ paddingBottom: "4rem" }}>
      <Calendar
        reservationUnitPk={String(reservation?.reservationUnits?.[0]?.pk)}
        reservation={editedReservation}
        allowEditing
        focusDate={new Date()}
        // TODO onSubmit should not move the event
        // instead track changes in the frontend
        // do a mutation when the user confirms the change
        onChange={handleChange}
        forceUpdate={forceUpdate}
        /* TODO this should be inside an accordian and hidden by default */
        bottomContent={
          <ChangeTimeFormPart
            reservation={reservation}
            onSubmit={handleSubmit}
            form={form}
          />
        }
      />
    </div>
  );
};

const EditTimePage = () => {
  const params = useParams();
  const id = params.id ?? undefined;

  const { t } = useTranslation();

  const { reservation, loading, refetch } = useReservationEditData(id);

  return (
    <EditPageWrapper
      reservation={reservation}
      title={t("Reservation.EditTime.title")}
    >
      {loading ? (
        <Loader />
      ) : !reservation ? (
        <div>No reservation</div>
      ) : (
        <EditTime reservation={reservation} onReservationChanged={refetch} />
      )}
    </EditPageWrapper>
  );
};

export default withMainMenu(EditTimePage);
