import React from "react";
import { DateInput, TimeInput } from "hds-react";
import { useTranslation } from "react-i18next";
import {
  dateTime,
  valueForDateInput,
  valueForTimeInput,
} from "../../common/util";
import { EditorColumns } from "./editorComponents";

const DateTimeInput = ({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}): JSX.Element => {
  const { t } = useTranslation();
  return (
    <EditorColumns style={{ gridTemplateColumns: "4fr 3fr" }}>
      <DateInput
        language="fi"
        disableConfirmation
        label={t("common.date")}
        id="publishBegins.date"
        value={valueForDateInput(value)}
        onChange={(v) => {
          setValue(dateTime(v, valueForTimeInput(value)));
        }}
      />
      <TimeInput
        id="publishBegins.time"
        label={t("common.time")}
        hoursLabel="hours"
        minutesLabel="minutes"
        value={valueForTimeInput(value)}
        onChange={(e) => {
          console.log("time changed", e.target.value);
          if (e.target.value.length !== 5) {
            return;
          }
          setValue(dateTime(valueForDateInput(value), e.target.value));
        }}
      />
    </EditorColumns>
  );
};

export default DateTimeInput;
