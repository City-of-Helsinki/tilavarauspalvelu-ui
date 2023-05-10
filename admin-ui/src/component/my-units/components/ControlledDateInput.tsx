import React, { useState } from "react";
import {
  useController,
  UseControllerProps,
  FieldValues,
} from "react-hook-form";
import { DateInput } from "hds-react";
import { useTranslation } from "react-i18next";
import { addYears, format } from "date-fns";

interface ControllerProps<T extends FieldValues> extends UseControllerProps<T> {
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const isDateValid = (d: Date) => {
  return d instanceof Date && !Number.isNaN(d.getTime());
};

const ControlledDateInput = <T extends FieldValues>({
  control,
  name,
  error,
  required,
  disabled,
}: ControllerProps<T>) => {
  const {
    field: { value, onChange },
  } = useController({ control, name, rules: { required } });
  const { t } = useTranslation();
  // There is no default value for DateInput
  // so we need to control the input from controller
  // save the string because we can't only update the Date because
  // keyboard input requires invalid dates (ex 1.1.).
  const [textValue, setTextValue] = useState(
    isDateValid(value) ? format(value, "dd.MM.yyyy") : ""
  );

  return (
    <DateInput
      id={`reservationDialog.${name}`}
      label={t(`ReservationDialog.${name}`)}
      minDate={new Date()}
      maxDate={addYears(new Date(), 3)}
      disableConfirmation
      language="fi"
      errorText={error}
      disabled={disabled}
      value={textValue}
      required={required}
      onChange={(text, date) => {
        setTextValue(text);
        onChange(date);
      }}
    />
  );
};

export default ControlledDateInput;
