import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Control, Controller, UseFormReturn, useForm } from "react-hook-form";
import { checkDate, checkTimeStringFormat } from "app/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { add, differenceInMinutes, format, set } from "date-fns";
import styled from "styled-components";
import { Button, Select, TextInput, TimeInput } from "hds-react";
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

const TimeFormSchema = z.object({
  date: z.date(),
  startTime: z.string(),
  length: z.string(),
});

export type FormValueType = z.infer<typeof TimeFormSchema>;

// No refinement for length since the select doesn't allow invalid values
const TimeChangeFormSchemaRefined = TimeFormSchema.partial()
  .superRefine((val, ctx) => checkDate(val.date, ctx, "date"))
  .superRefine((val, ctx) =>
    checkTimeStringFormat(val.startTime, ctx, "startTime")
  );

// TODO utility functions should be elsewhere (but there are a million utils.ts files)
const timeToDuration = (time: string) => {
  const dindex = time.indexOf(":");
  if (dindex > 0) {
    const hours = Number(time.substring(0, dindex) ?? "0");
    const minutes = Number(time.substring(dindex + 1) ?? "0");
    return { hours, minutes };
  }
  return undefined;
};

const setTimeOnDate = (date: Date, time: string): Date => {
  const duration = timeToDuration(time);
  if (duration) {
    return set(date, duration);
  }
  return date;
};

const intervalToMinutes = (
  interval: ReservationUnitsReservationUnitReservationStartIntervalChoices
): number => {
  switch (interval) {
    case ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_15Mins:
      return 15;
    case ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_30Mins:
      return 30;
    case ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_60Mins:
      return 60;
    case ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_90Mins:
      return 90;
    default:
      return 15;
  }
};

type Duration = { hours: number; minutes: number };
const durationDiff = (d1: Duration, d2: Duration): Duration => ({
  hours: d1.hours - d2.hours,
  minutes: d1.minutes - d2.minutes,
});

const divideDuration = (dur: Duration, mins: number): number => {
  const total = dur.hours * 60 + dur.minutes;
  return total / mins;
};

const addToDuration = (dur: Duration, mins: number): Duration => {
  const mtmp = dur.minutes + mins;
  if (mtmp < 60) {
    return { hours: dur.hours, minutes: mtmp };
  }
  return {
    minutes: mtmp % 60,
    hours: Math.floor(dur.hours + Math.floor(mtmp / 60)),
  };
};

const padWithZeros = (x: number) => `${x >= 0 && x < 10 ? "0" : ""}${x}`;
const durationToTimeString = (d: Duration): string =>
  `${d.hours}:${padWithZeros(d.minutes)}`;
const minutesToDuration = (mins: number): Duration => ({
  hours: Math.floor(mins / 60),
  minutes: mins % 60,
});

const generateTimeIntervals = (
  intervalMins: number,
  min: Duration,
  max: Duration
): string[] => {
  const diff = durationDiff(max, min);
  if (
    diff.hours < 0 ||
    diff.minutes < 0 ||
    (diff.hours === 0 && diff.minutes === 0)
  ) {
    return [];
  }

  const count = divideDuration(diff, intervalMins);
  return count > 0
    ? Array.from(Array(count + 1).keys())
        // TODO conversion
        .map((x) => addToDuration(min, x * intervalMins))
        .map((x) => durationToTimeString(x))
    : [];
};

type OptionType = { value: string; label: string };
const LengthSelect = ({
  control,
  interval,
}: {
  control: Control<FormValueType, unknown>;
  interval: ReservationUnitsReservationUnitReservationStartIntervalChoices;
}) => {
  const { t } = useTranslation();

  // TODO make these configurable
  // TODO make these relative to the interval (x * interval)
  const min = { hours: 1, minutes: 0 };
  const max = { hours: 6, minutes: 0 };
  const options = generateTimeIntervals(
    intervalToMinutes(interval),
    min,
    max
  ).map((x) => ({
    value: x,
    label: x,
  }));

  // TODO errors?
  return (
    <Controller
      name="length"
      control={control}
      rules={{ required: true }}
      render={({ field: { onChange, value } }) => (
        <Select<OptionType>
          label={t("Reservation.EditTime.form.length")}
          id="length"
          options={options}
          onChange={(selected: OptionType) => onChange(selected.value)}
          value={options.find((x) => x.value === value)}
        />
      )}
    />
  );
};

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
    register,
    formState: { errors, isDirty },
    getValues,
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
      <TextInput
        id="EditPage.startTimeText"
        value={getValues("startTime")}
        label={t(`ReservationDialog.startTime`)}
      />
      <TimeInput
        {...register("startTime")}
        value={getValues("startTime")}
        id="EditPage.startTime"
        label={t(`ReservationDialog.startTime`)}
        hoursLabel={t("common.hoursLabel")}
        minutesLabel={t("common.minutesLabel")}
        required
        errorText={translateError(errors.startTime?.message)}
      />
      <LengthSelect control={control} interval={reservationStartInterval} />
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

  const form = useForm<FormValueType>({
    resolver: zodResolver(TimeChangeFormSchemaRefined),
    mode: "onChange",
    defaultValues: {
      date: new Date(reservation.begin),
      startTime: format(new Date(reservation.begin), "HH:mm"),
      length: durationToTimeString(minutesToDuration(length)),
    },
  });
  const { getValues } = form;

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
    console.log("handleChange: ", begin, " : ", end);
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
