import React from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Control, Controller, useForm } from "react-hook-form";
import { checkDate, checkTimeStringFormat } from "app/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { add, differenceInMinutes, format, set } from "date-fns";
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
import ControlledTimeInput from "../my-units/components/ControlledTimeInput";

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
}: {
  reservation: ReservationType;
  onSubmit: (begin: Date, end: Date) => Promise<unknown>;
}) => {
  const reservationStartInterval =
    reservation?.reservationUnits?.find(() => true)?.reservationStartInterval ??
    ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_30Mins;

  const length = differenceInMinutes(
    new Date(reservation.end),
    new Date(reservation.begin)
  );
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValueType>({
    resolver: zodResolver(TimeChangeFormSchemaRefined),
    mode: "onChange",
    defaultValues: {
      date: new Date(reservation.begin),
      startTime: format(new Date(reservation.begin), "HH:mm"),
      length: durationToTimeString(minutesToDuration(length)),
    },
  });

  const { t } = useTranslation();

  const translateError = (errorMsg?: string) =>
    errorMsg ? t(`reservationForm:errors.${errorMsg}`) : "";

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

  return (
    <StyledForm onSubmit={handleSubmit(tSubmit)} noValidate>
      <ControlledDateInput
        name="date"
        control={control}
        error={translateError(errors.date?.message)}
        required
      />
      <ControlledTimeInput
        name="startTime"
        control={control}
        error={translateError(errors.startTime?.message)}
        required
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

  const [changeTimeMutation] = useMutation<
    Mutation,
    MutationStaffAdjustReservationTimeArgs
  >(CHANGE_RESERVATION_TIME, {
    onCompleted: () => {
      onReservationChanged();
    },
    onError: (error) => {
      // TODO handle noOverlapping error separately
      // eslint-disable-next-line no-console
      console.error("Change time mutation failed: ", error);
      notifyError(t("Reservation.EditTime.error.mutation"));
    },
  });

  const handleSubmit = async (begin: Date, end: Date) => {
    return changeTimeMutation({
      variables: {
        input: {
          begin: begin.toISOString(),
          end: end.toISOString(),
          // TODO pk can be fixed variable (in the mutation)
          pk: reservation.pk ?? 0,
        },
      },
    });
  };

  // TODO Calendar isn't updated because Form submission causes a refetch
  // but does not refetch the calendar events (they need to be passed down)
  // or we need to add forceRefetch prop to trigger it
  return (
    // Quick-n-dirty fix: for select near the bottom of a page; enough padding so opening the select doesn't resize the page
    <div style={{ paddingBottom: "4rem" }}>
      <Calendar
        reservationUnitPk={String(reservation?.reservationUnits?.[0]?.pk)}
        reservation={reservation}
        allowEditing
        focusDate={new Date()}
        // TODO onSubmit should not move the event
        // instead track changes in the frontend
        // do a mutation when the user confirms the change
        onSubmit={handleSubmit}
        /* TODO this should be inside an accordian and hidden by default */
        bottomContent={
          <ChangeTimeFormPart
            reservation={reservation}
            onSubmit={handleSubmit}
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
