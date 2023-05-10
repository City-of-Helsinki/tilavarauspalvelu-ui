import React from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Control, Controller, useForm } from "react-hook-form";
import { ReservationFormSchema } from "app/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { add, format, set } from "date-fns";
import styled from "styled-components";
import { Button, Select } from "hds-react";
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
type FormValueType = {
  date?: Date;
  startTime?: string;
  length?: string;
};

type OptionType = { value: string; label: string };
// TODO default value based on the already selected length
// TODO pass the interval for options generation
const LengthSelect = ({
  control,
}: {
  control: Control<FormValueType, any>;
}) => {
  const { t } = useTranslation("translation");

  const options = [
    "0:30",
    "1:00",
    "1:30",
    "2:00",
    "2:30",
    "3:00",
    "3:30",
    "4:00",
  ].map((x) => ({
    value: x,
    label: x,
  }));

  return (
    <Controller
      name="length"
      control={control}
      rules={{ required: true }}
      render={({ field: formField }) => (
        <Select<OptionType>
          // TODO some (like this) get the * added by the component
          // others (so far seems all the others) get it from the label text.
          label={t(`EditTimePage.length`)}
          id="length"
          options={options}
          {...formField}
          value={options.find((x) => x.value === formField.value)}
          /*
          error={errorText}
          required={required}
          invalid={!!error}
          $isWide={isWideRow}
          */
        />
      )}
    />
  );
};

// TODO copy from Reservation timeInput
const ChangeTimeFormPart = ({
  reservation,
  onSubmit,
}: {
  reservation: ReservationType;
  onSubmit: (begin: Date, end: Date) => Promise<unknown>;
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValueType>({
    resolver: zodResolver(
      ReservationFormSchema(
        reservation?.reservationUnits?.find(() => true)
          ?.reservationStartInterval ??
          ReservationUnitsReservationUnitReservationStartIntervalChoices.Interval_30Mins
      )
    ),
    mode: "onChange",
    defaultValues: {
      date: new Date(reservation.begin),
      startTime: format(new Date(reservation.begin), "HH:mm"),
      // TODO convert endtime to length (time string)
    },
  });

  const { t } = useTranslation("translation");

  const translateError = (errorMsg?: string) =>
    errorMsg ? t(`reservationForm:errors.${errorMsg}`) : "";

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
    <StyledForm onSubmit={handleSubmit(tSubmit)}>
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
      {/* TODO Selects are bad because they open downward and this page has no space under
          Quick-n-dirty fix: add margin at the bottom of the page */}
      <LengthSelect control={control} />
      {/* TODO this should be inside an accordian and hidden by default
          TODO this should be above the legend?
      */}
      <div style={{ alignSelf: "end" }}>
        {/* TODO translation */}
        <Button type="submit">{t("ReservationDialog.accept")}</Button>
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

  const [changeTimeMutation] = useMutation<
    Mutation,
    MutationStaffAdjustReservationTimeArgs
  >(CHANGE_RESERVATION_TIME, {
    onCompleted: () => {
      onReservationChanged();
    },
    onError: (error) => {
      // TODO translations
      // TODO handle noOverlapping error separately
      // eslint-disable-next-line no-console
      console.error("Change time mutation failed: ", error);
      notifyError("Time change FAILED");
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
  return (
    <Calendar
      reservationUnitPk={String(reservation?.reservationUnits?.[0]?.pk)}
      reservation={reservation}
      allowEditing
      // FIXME what is the correct value? probably the current reservation time
      focusDate={new Date()}
      // TODO onSubmit should not move the event
      // instead track changes in the frontend
      // do a mutation when the user confirms the change
      onSubmit={handleSubmit}
      bottomContent={
        <ChangeTimeFormPart reservation={reservation} onSubmit={handleSubmit} />
      }
    />
  );
};

const EditTimePage = () => {
  const params = useParams();
  const id = params.id ?? undefined;

  const { t } = useTranslation("translation", {
    keyPrefix: "Reservation.EditTime",
  });

  const { reservation, loading, refetch } = useReservationEditData(id);

  return (
    <EditPageWrapper reservation={reservation} title={t("title")}>
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
